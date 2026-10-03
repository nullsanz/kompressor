/**
 * DOLBY VISION PROFILE 8.4 BITSTREAM RPU & CONTAINER INJECTOR (BROWSER & WORKER NATIVE)
 * 
 * Standar Industri Open-Source: quietvoid/dovi_tool
 * - Menginjeksikan NAL Unit 62 (UNSPEC62) Dolby Vision RPU ke setiap video sample HEVC (hvc1/hev1)
 * - L1 Dynamic Metadata: MaxCLL 3999.69 nits (~4000 nits EDR peak boost), MaxFALL 92.36 nits
 * - L2 Trims: 4000 nits target dengan nilai netral/identitas (slope=2048, offset=2048, sat=2048)
 * - Zero MMR mapping (remove_mapping: true) -> 100% MENCEGAH MUKA MERAH BATA / DISTORSI CHROMA
 * - Menginjeksikan atom colr (19 byte, nclx BT.2020 Primaries=9, HLG Transfer=18, BT.2020 Matrix=9)
 * - Menginjeksikan atom dvvC (32 byte, Profile 8.4, compatibility ID 4) ke dalam stsd/hvc1
 * - Patching HEVC SPS VUI parameter di hvcC agar transfer_characteristics = 18 (ARIB STD-B67 / HLG)
 * - Memaksa sample entry 'hev1' menjadi 'hvc1' dan menambahkan brand 'qt  '/'hvc1' agar Apple AVPlayer memicu EDR
 * - Rekalkulasi tabel stsz (sample sizes) & stco/co64 (chunk offsets)
 * - Tata letak FastStart: [ftyp] -> [moov] -> [mdat]
 * 
 * 100% Native Browser JavaScript (Uint8Array, DataView, ArrayBuffer) - Zero dependencies!
 */

// 413-byte Official Dolby Vision Profile 8.4 RPU NAL 62 (quietvoid/dovi_tool 4000 nits L1 + neutral L2)
const NAL62_HEX = 
  '7c0119080908406136506e203f114e6401000941002007801ffc00fffa7e6fec' +
  '17f26373ca9a60a7f8bbc14f242c2bba6cfa941a97d175a07c6219aa8164ae7e11628bae' +
  '32be73af0b4a33191830b8a18d335503ac32640202590a2834ef60c01ee81340041528c0' +
  '281c1db70003e92fde00225cfdc0522319cec0aa9d96f85fd0b139b8841f3a802b21f140' +
  '4a7200c0660f0383fd4b02ec670d991bb4e3ddf8942cbebba065c127c024c202e0fe5ada' +
  'd8e2ff96d8c43c712d311ae6680e9bf49809ef955828b7e7400402f250d1ed28149bd470' +
  'be8dec022a930d1afa5154b4c2b44e74c7c69c97946f800b052395203027a643ad79e049' +
  '96d66418cbe6b118448a39681823ba4088f61b470a876844d8714d12b300001af512b37c' +
  'fe758e12b3226500000300800000040000030004000003000e1b112180c3052f1847028a' +
  '00000300d31f2d7fff800000030000030000030030103ec070a8a030080073840000c02e' +
  '708008008008008004000100a0000003000003000003024183e8000043e803e80a301c00' +
  '40040002090028580800000303fe00023894ce8480';

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export const NAL62_PAYLOAD = hexToBytes(NAL62_HEX);

// 4 bytes length prefix: 413 bytes = 0x0000019D -> total 417 bytes unit
export const NAL62_SAMPLE_UNIT = new Uint8Array(4 + NAL62_PAYLOAD.length);
NAL62_SAMPLE_UNIT[0] = 0x00;
NAL62_SAMPLE_UNIT[1] = 0x00;
NAL62_SAMPLE_UNIT[2] = 0x01;
NAL62_SAMPLE_UNIT[3] = 0x9D;
NAL62_SAMPLE_UNIT.set(NAL62_PAYLOAD, 4);

// 32-byte dvvC atom (Profile 8.4 HLG, compatibility ID 4)
export const DVVC_32_BOX = hexToBytes(
  '0000002064767643010010254000000000000000000000000000000000000000'
);

// 19-byte colr atom (nclx: BT.2020 Primaries=9, HLG Transfer=18, BT.2020 Matrix=9, full_range=1)
export const COLR_19_BOX = hexToBytes(
  '00000013636f6c726e636c7800090012000901'
);

/**
 * Patching HEVC SPS NAL unit agar VUI parameter memuat:
 * - colour_primaries: 9 (BT.2020)
 * - transfer_characteristics: 18 (ARIB STD-B67 / HLG) -> Pemicu hardware EDR boost di layar HP!
 * - matrix_coeffs: 9 (BT.2020 NCL)
 */
export function patchSpsVuiToHlg(spsNal) {
  const rbsp = [];
  for (let i = 0; i < spsNal.length; i++) {
    if (i >= 2 && spsNal[i] === 3 && spsNal[i - 1] === 0 && spsNal[i - 2] === 0) continue;
    rbsp.push(spsNal[i]);
  }
  const rbspBuf = new Uint8Array(rbsp);

  class BitStream {
    constructor(buf) {
      this.buf = buf;
      this.bytePos = 0;
      this.bitPos = 0;
      this.outBits = [];
    }
    readBit() {
      const bit = (this.buf[this.bytePos] >> (7 - this.bitPos)) & 1;
      this.bitPos++;
      if (this.bitPos === 8) { this.bitPos = 0; this.bytePos++; }
      return bit;
    }
    readBits(n) {
      let val = 0;
      for (let i = 0; i < n; i++) val = (val << 1) | this.readBit();
      return val;
    }
    readUE() {
      let zeros = 0;
      while (this.readBit() === 0) zeros++;
      if (zeros === 0) return 0;
      return (1 << zeros) - 1 + this.readBits(zeros);
    }
    copyBits(n) { for (let i = 0; i < n; i++) this.writeBit(this.readBit()); }
    copyUE() {
      let zeros = 0;
      while (this.readBit() === 0) { this.writeBit(0); zeros++; }
      this.writeBit(1);
      for (let i = 0; i < zeros; i++) this.writeBit(this.readBit());
    }
    writeBit(b) { this.outBits.push(b ? 1 : 0); }
    writeBits(val, n) {
      for (let i = n - 1; i >= 0; i--) this.writeBit((val >> i) & 1);
    }
    writeUE(val) {
      if (val === 0) { this.writeBit(1); return; }
      const codeNum = val + 1;
      const bits = codeNum.toString(2);
      for (let i = 0; i < bits.length - 1; i++) this.writeBit(0);
      for (let i = 0; i < bits.length; i++) this.writeBit(bits[i] === '1' ? 1 : 0);
    }
    toBuffer() {
      const bytes = [];
      let cur = 0, count = 0;
      for (let i = 0; i < this.outBits.length; i++) {
        cur = (cur << 1) | this.outBits[i];
        count++;
        if (count === 8) { bytes.push(cur); cur = 0; count = 0; }
      }
      if (count > 0) bytes.push(cur << (8 - count));

      const out = [];
      for (let i = 0; i < bytes.length; i++) {
        if (out.length >= 2 && out[out.length - 1] === 0 && out[out.length - 2] === 0 && bytes[i] <= 3) {
          out.push(3);
        }
        out.push(bytes[i]);
      }
      return new Uint8Array(out);
    }
  }

  try {
    const bs = new BitStream(rbspBuf);
    bs.copyBits(16);
    const vps_id = bs.readBits(4); bs.writeBits(vps_id, 4);
    const max_sub_layers = bs.readBits(3); bs.writeBits(max_sub_layers, 3);
    const temporal_nesting = bs.readBit(); bs.writeBit(temporal_nesting);
    bs.copyBits(96);
    if (max_sub_layers > 0) {
      for (let i = 0; i < max_sub_layers; i++) bs.copyBits(2);
      for (let i = max_sub_layers; i < 8; i++) bs.copyBits(2);
    }
    bs.copyUE();
    const chroma = bs.readUE(); bs.writeUE(chroma);
    if (chroma === 3) bs.copyBits(1);
    bs.copyUE(); bs.copyUE();
    const conf = bs.readBit(); bs.writeBit(conf);
    if (conf) { bs.copyUE(); bs.copyUE(); bs.copyUE(); bs.copyUE(); }
    bs.copyUE(); bs.copyUE();
    const log2_max_poc = bs.readUE(); bs.writeUE(log2_max_poc);
    const sub_layer_ordering = bs.readBit(); bs.writeBit(sub_layer_ordering);
    const start_idx = sub_layer_ordering ? 0 : max_sub_layers;
    for (let i = start_idx; i <= max_sub_layers; i++) {
      bs.copyUE(); bs.copyUE(); bs.copyUE();
    }
    bs.copyUE(); bs.copyUE(); bs.copyUE(); bs.copyUE(); bs.copyUE(); bs.copyUE();
    const scaling = bs.readBit(); bs.writeBit(scaling);
    if (scaling) {
      if (bs.readBit()) return spsNal;
      else bs.writeBit(0);
    }
    bs.copyBits(3);
    const num_rps = bs.readUE(); bs.writeUE(num_rps);
    for (let i = 0; i < num_rps; i++) {
      let inter = 0;
      if (i !== 0) { inter = bs.readBit(); bs.writeBit(inter); }
      if (inter) return spsNal;
      const num_neg = bs.readUE(); bs.writeUE(num_neg);
      const num_pos = bs.readUE(); bs.writeUE(num_pos);
      for (let j = 0; j < num_neg; j++) { bs.copyUE(); bs.copyBits(1); }
      for (let j = 0; j < num_pos; j++) { bs.copyUE(); bs.copyBits(1); }
    }
    const lt = bs.readBit(); bs.writeBit(lt);
    if (lt) {
      const num_lt = bs.readUE(); bs.writeUE(num_lt);
      for (let i = 0; i < num_lt; i++) { bs.copyBits(log2_max_poc + 4); bs.copyBits(1); }
    }
    bs.copyBits(2);

    const vui_present = bs.readBit();
    bs.writeBit(1);

    if (vui_present) {
      const sar_present = bs.readBit(); bs.writeBit(sar_present);
      if (sar_present) {
        const idc = bs.readBits(8); bs.writeBits(idc, 8);
        if (idc === 255) bs.copyBits(32);
      }
      const overscan = bs.readBit(); bs.writeBit(overscan);
      if (overscan) bs.copyBits(1);

      const vid_sig = bs.readBit();
      bs.writeBit(1);
      let vid_fmt = 5, full_range = 1;
      if (vid_sig) {
        vid_fmt = bs.readBits(3);
        full_range = bs.readBit();
        const colour_desc = bs.readBit();
        if (colour_desc) bs.readBits(24);
      }
      bs.writeBits(vid_fmt, 3);
      bs.writeBit(full_range);
      bs.writeBit(1);
      bs.writeBits(9, 8);  // BT.2020 primaries
      bs.writeBits(18, 8); // HLG transfer
      bs.writeBits(9, 8);  // BT.2020 matrix

      while (bs.bytePos < rbspBuf.length - 1 || (bs.bytePos === rbspBuf.length - 1 && bs.bitPos < 7)) {
        bs.writeBit(bs.readBit());
      }
      bs.writeBit(1);
      while (bs.outBits.length % 8 !== 0) bs.writeBit(0);
    } else {
      bs.writeBit(0); bs.writeBit(0);
      bs.writeBit(1); bs.writeBits(5, 3); bs.writeBit(1); bs.writeBit(1);
      bs.writeBits(9, 8); bs.writeBits(18, 8); bs.writeBits(9, 8);
      bs.writeBits(0, 7);
      bs.writeBit(1);
      while (bs.outBits.length % 8 !== 0) bs.writeBit(0);
    }
    return bs.toBuffer();
  } catch (err) {
    console.warn('[DOVI-SPS] Gagal rewrite VUI, mempertahankan original:', err.message);
    return spsNal;
  }
}

/**
 * Memperbarui box hvcC di dalam container MP4 agar SPS di dalamnya ber-transfer HLG
 */
export function patchHvcCBuffer(hvcCBuf) {
  const view = new DataView(hvcCBuf.buffer, hvcCBuf.byteOffset, hvcCBuf.byteLength);
  if (hvcCBuf.length < 31) return hvcCBuf;
  const numOfArrays = hvcCBuf[30];
  let offset = 31;
  const arrayParts = [hvcCBuf.subarray(0, 31)];

  for (let a = 0; a < numOfArrays; a++) {
    if (offset + 3 > hvcCBuf.length) break;
    const arrayHeader = hvcCBuf[offset];
    const nalType = arrayHeader & 0x3F;
    const numNalus = view.getUint16(offset + 1, false);
    offset += 3;

    if (nalType === 33) { // SPS NAL
      const naluList = [];
      for (let n = 0; n < numNalus; n++) {
        if (offset + 2 > hvcCBuf.length) break;
        const naluLen = view.getUint16(offset, false);
        offset += 2;
        const naluData = hvcCBuf.subarray(offset, offset + naluLen);
        offset += naluLen;

        const patched = patchSpsVuiToHlg(naluData);
        const lenBuf = new Uint8Array(2);
        new DataView(lenBuf.buffer).setUint16(0, patched.length, false);
        naluList.push(concatUint8Arrays([lenBuf, patched]));
      }
      const arrHdrBuf = new Uint8Array([arrayHeader, (naluList.length >> 8) & 0xFF, naluList.length & 0xFF]);
      arrayParts.push(concatUint8Arrays([arrHdrBuf, ...naluList]));
    } else {
      const startArr = offset - 3;
      for (let n = 0; n < numNalus; n++) {
        if (offset + 2 > hvcCBuf.length) break;
        const naluLen = view.getUint16(offset, false);
        offset += 2 + naluLen;
      }
      arrayParts.push(hvcCBuf.subarray(startArr, offset));
    }
  }

  const newHvcC = concatUint8Arrays(arrayParts);
  new DataView(newHvcC.buffer, newHvcC.byteOffset, newHvcC.byteLength).setUint32(0, newHvcC.length, false);
  return newHvcC;
}

function findFourCC(u8, fourCC, from = 0, to = u8.length) {
  const b0 = fourCC.charCodeAt(0);
  const b1 = fourCC.charCodeAt(1);
  const b2 = fourCC.charCodeAt(2);
  const b3 = fourCC.charCodeAt(3);
  const limit = Math.min(u8.length - 3, to);
  for (let i = from; i < limit; i++) {
    if (u8[i] === b0 && u8[i + 1] === b1 && u8[i + 2] === b2 && u8[i + 3] === b3) {
      return i;
    }
  }
  return -1;
}

function findBox(u8, view, fourCC, start = 0, end = u8.length) {
  let pos = findFourCC(u8, fourCC, start, end);
  while (pos !== -1 && pos + 4 <= end) {
    if (pos >= 4) {
      const boxStart = pos - 4;
      const boxSize = view.getUint32(boxStart, false);
      if (boxSize >= 8 && boxStart + boxSize <= u8.length + 8) {
        return { start: boxStart, size: boxSize, end: boxStart + boxSize, payloadStart: pos + 4 };
      }
    }
    pos = findFourCC(u8, fourCC, pos + 1, end);
  }
  return null;
}

function findAllBoxes(u8, view, fourCC, start = 0, end = u8.length) {
  const results = [];
  let pos = findFourCC(u8, fourCC, start, end);
  while (pos !== -1 && pos + 4 <= end) {
    if (pos >= 4) {
      const boxStart = pos - 4;
      const boxSize = view.getUint32(boxStart, false);
      if (boxSize >= 8) {
        results.push({ start: boxStart, size: boxSize, end: boxStart + boxSize, payloadStart: pos + 4 });
      }
    }
    pos = findFourCC(u8, fourCC, pos + 4, end);
  }
  return results;
}

function concatUint8Arrays(arrays) {
  let totalLength = 0;
  for (let i = 0; i < arrays.length; i++) {
    totalLength += arrays[i].length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (let i = 0; i < arrays.length; i++) {
    result.set(arrays[i], offset);
    offset += arrays[i].length;
  }
  return result;
}

/**
 * Deteksi cepat format codec MP4 dari buffer byte (membaca hvc1/hev1 vs avc1)
 */
export function detectMp4Codec(inputData) {
  const u8 = inputData instanceof Uint8Array ? inputData : new Uint8Array(inputData);
  
  // 1. Scan hvc1 atau hev1 di seluruh buffer (tanpa batas 128KB yang memotong moov di belakang)
  if (findFourCC(u8, 'hvc1', 0, u8.length) !== -1 || findFourCC(u8, 'hev1', 0, u8.length) !== -1) {
    return { isHevc: true, codec: 'H.265 / HEVC', tag: 'hvc1' };
  }
  // 2. Scan avc1 atau avc3 di seluruh buffer
  if (findFourCC(u8, 'avc1', 0, u8.length) !== -1 || findFourCC(u8, 'avc3', 0, u8.length) !== -1) {
    return { isHevc: false, codec: 'H.264 / AVC', tag: 'avc1' };
  }
  // 3. Cek ftyp brand di 64 byte awal
  const ftypLimit = Math.min(u8.length, 64);
  if (findFourCC(u8, 'hvc1', 0, ftypLimit) !== -1 || findFourCC(u8, 'hev1', 0, ftypLimit) !== -1) {
    return { isHevc: true, codec: 'H.265 / HEVC', tag: 'hvc1' };
  }
  return { isHevc: false, codec: 'Unknown / Non-HEVC', tag: 'unknown' };
}

/**
 * Pure Browser JS Dolby Vision Profile 8.4 Bitstream & Container Injector
 * - Menginjeksikan NAL 62 (4000 nits L1 + neutral L2) ke setiap frame video HEVC
 * - Menginjeksikan colr atom (BT.2020 Primaries=9, HLG Transfer=18, BT.2020 Matrix=9)
 * - Menginjeksikan dvvC atom (Profile 8.4 HLG, compatibility ID 4)
 * - Mengubah sample entry 'hev1' menjadi 'hvc1'
 * - Menambahkan brand 'hvc1' & 'qt  ' ke ftyp agar iOS / macOS VideoToolbox memicu EDR nits
 * @param {Uint8Array|ArrayBuffer} inputData 
 * @returns {{ patchedBytes: Uint8Array, isHevc: boolean, sampleCount: number, status: string, message?: string }}
 */
export function injectDolbyVisionBitstreamProfile84(inputData) {
  const u8 = inputData instanceof Uint8Array ? inputData : new Uint8Array(inputData);
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);

  const ftyp = findBox(u8, view, 'ftyp');
  const moov = findBox(u8, view, 'moov');
  const mdat = findBox(u8, view, 'mdat');
  if (!ftyp || !moov || !mdat) {
    throw new Error('File bukan MP4 valid (ftyp, moov, atau mdat tidak ditemukan)');
  }

  // 1. Upgrade ftyp untuk memasukkan brand 'hvc1' dan 'qt  '
  let ftypBuf = u8.subarray(ftyp.start, ftyp.end);
  let hasHvc1 = false, hasQt = false;
  for (let i = 16; i < ftypBuf.length; i += 4) {
    const brand = String.fromCharCode(ftypBuf[i], ftypBuf[i + 1], ftypBuf[i + 2], ftypBuf[i + 3]);
    if (brand === 'hvc1') hasHvc1 = true;
    if (brand === 'qt  ') hasQt = true;
  }
  const addedBrands = [];
  if (!hasHvc1) addedBrands.push(new Uint8Array([0x68, 0x76, 0x63, 0x31])); // 'hvc1'
  if (!hasQt) addedBrands.push(new Uint8Array([0x71, 0x74, 0x20, 0x20]));   // 'qt  '
  if (addedBrands.length > 0) {
    ftypBuf = concatUint8Arrays([ftypBuf, ...addedBrands]);
    new DataView(ftypBuf.buffer, ftypBuf.byteOffset, ftypBuf.byteLength).setUint32(0, ftypBuf.length, false);
  }

  // 2. Parse semua tracks
  const traks = findAllBoxes(u8, view, 'trak', moov.start, moov.end);
  let videoTrak = null;
  const allTracks = [];

  for (let tIdx = 0; tIdx < traks.length; tIdx++) {
    const trak = traks[tIdx];
    const hdlr = findBox(u8, view, 'hdlr', trak.start, trak.end);
    if (!hdlr) continue;
    const handlerType = String.fromCharCode(
      u8[hdlr.start + 16],
      u8[hdlr.start + 17],
      u8[hdlr.start + 18],
      u8[hdlr.start + 19]
    );

    const stbl = findBox(u8, view, 'stbl', trak.start, trak.end);
    if (!stbl) continue;

    const stsd = findBox(u8, view, 'stsd', stbl.start, stbl.end);
    const stsz = findBox(u8, view, 'stsz', stbl.start, stbl.end);
    const stsc = findBox(u8, view, 'stsc', stbl.start, stbl.end);
    const stco = findBox(u8, view, 'stco', stbl.start, stbl.end);
    const co64 = findBox(u8, view, 'co64', stbl.start, stbl.end);

    const isVideo = handlerType === 'vide';
    let isHevc = false;
    let hvc1Box = null;

    if (isVideo && stsd) {
      hvc1Box = findBox(u8, view, 'hvc1', stsd.start, stsd.end) || findBox(u8, view, 'hev1', stsd.start, stsd.end);
      if (hvc1Box) isHevc = true;
    }

    const trackObj = {
      index: tIdx,
      trak,
      handlerType,
      isVideo,
      isHevc,
      hvc1Box,
      stbl,
      stsd,
      stsz,
      stsc,
      offsetBox: stco || co64,
      isCo64: Boolean(co64)
    };

    allTracks.push(trackObj);
    if (isVideo) videoTrak = trackObj;
  }

  if (!videoTrak) {
    throw new Error('Track video tidak ditemukan di dalam MP4');
  }

  if (!videoTrak.isHevc) {
    console.warn('[DOVI-PATCHER] Video bukan H.265/HEVC (hvc1/hev1). Tag codec:', videoTrak.handlerType);
    return {
      patchedBytes: u8,
      isHevc: false,
      sampleCount: 0,
      status: 'not_hevc',
      message: 'Video menggunakan codec ' + videoTrak.handlerType + '. Dolby Vision 8.4 memerlukan H.265/HEVC untuk hardware EDR boost.'
    };
  }

  // 3. Parse video sample sizes (stsz)
  const stszStart = videoTrak.stsz.start;
  const sampleSizeDefault = view.getUint32(stszStart + 12, false);
  const sampleCount = view.getUint32(stszStart + 16, false);
  const sampleSizes = [];

  if (sampleSizeDefault !== 0) {
    for (let i = 0; i < sampleCount; i++) sampleSizes.push(sampleSizeDefault);
  } else {
    for (let i = 0; i < sampleCount; i++) {
      sampleSizes.push(view.getUint32(stszStart + 20 + i * 4, false));
    }
  }

  // 4. Parse sample-to-chunk (stsc) & chunk offsets untuk semua tracks
  for (const trk of allTracks) {
    const stscStart = trk.stsc.start;
    const cnt = view.getUint32(stscStart + 12, false);
    trk.stscEntries = [];
    for (let i = 0; i < cnt; i++) {
      trk.stscEntries.push({
        firstChunk: view.getUint32(stscStart + 16 + i * 12, false),
        samplesPerChunk: view.getUint32(stscStart + 20 + i * 12, false),
        sampleDescId: view.getUint32(stscStart + 24 + i * 12, false)
      });
    }

    const offStart = trk.offsetBox.start;
    const cCnt = view.getUint32(offStart + 12, false);
    trk.chunkOffsets = [];
    for (let c = 0; c < cCnt; c++) {
      if (trk.isCo64) {
        trk.chunkOffsets.push(Number(view.getBigUint64(offStart + 16 + c * 8, false)));
      } else {
        trk.chunkOffsets.push(view.getUint32(offStart + 16 + c * 4, false));
      }
    }
  }

  // 5. Petakan setiap video sample ke chunk dan byte offset fisiknya
  const videoSamples = [];
  let currentSampleIdx = 0;

  for (let c = 0; c < videoTrak.chunkOffsets.length; c++) {
    const chunkNum = c + 1;
    let spc = videoTrak.stscEntries[0].samplesPerChunk;
    for (let s = videoTrak.stscEntries.length - 1; s >= 0; s--) {
      if (chunkNum >= videoTrak.stscEntries[s].firstChunk) {
        spc = videoTrak.stscEntries[s].samplesPerChunk;
        break;
      }
    }

    let sampleOffsetInChunk = videoTrak.chunkOffsets[c];
    for (let i = 0; i < spc && currentSampleIdx < sampleCount; i++) {
      const sz = sampleSizes[currentSampleIdx];
      videoSamples.push({
        index: currentSampleIdx,
        offset: sampleOffsetInChunk,
        size: sz,
        chunkIndex: c
      });
      sampleOffsetInChunk += sz;
      currentSampleIdx++;
    }
  }

  // 6. Urutkan semua chunk lintas tracks secara global
  const allGlobalChunks = [];
  for (const trk of allTracks) {
    for (let c = 0; c < trk.chunkOffsets.length; c++) {
      allGlobalChunks.push({
        track: trk,
        chunkIdxInTrack: c,
        originalOffset: trk.chunkOffsets[c]
      });
    }
  }

  allGlobalChunks.sort((a, b) => a.originalOffset - b.originalOffset);

  for (let idx = 0; idx < allGlobalChunks.length; idx++) {
    const gc = allGlobalChunks[idx];
    if (idx + 1 < allGlobalChunks.length) {
      gc.originalLength = allGlobalChunks[idx + 1].originalOffset - gc.originalOffset;
    } else {
      gc.originalLength = (mdat.start + mdat.size) - gc.originalOffset;
    }
  }

  // 7. Suntikkan NAL 62 (4000 nits L1 + neutral L2) ke setiap video sample
  const deltaPerVideoSample = NAL62_SAMPLE_UNIT.length;
  for (const gc of allGlobalChunks) {
    if (gc.track.isVideo && gc.track.isHevc) {
      const samplesInChunk = videoSamples.filter(s => s.chunkIndex === gc.chunkIdxInTrack);
      const chunkParts = [];

      for (const s of samplesInChunk) {
        const sampleData = u8.subarray(s.offset, s.offset + s.size);
        chunkParts.push(sampleData);
        chunkParts.push(NAL62_SAMPLE_UNIT);
      }
      gc.newBytes = concatUint8Arrays(chunkParts);
    } else {
      gc.newBytes = u8.subarray(gc.originalOffset, gc.originalOffset + gc.originalLength);
    }
  }

  // 8. Box stsz yang telah diperbarui
  const newStszLen = 20 + sampleCount * 4;
  const newStszBuf = new Uint8Array(newStszLen);
  const newStszView = new DataView(newStszBuf.buffer);
  newStszView.setUint32(0, newStszLen, false);
  newStszBuf[4] = 0x73; newStszBuf[5] = 0x74; newStszBuf[6] = 0x73; newStszBuf[7] = 0x7a; // 'stsz'
  newStszView.setUint32(8, 0, false);
  newStszView.setUint32(12, 0, false);
  newStszView.setUint32(16, sampleCount, false);
  for (let i = 0; i < sampleCount; i++) {
    newStszView.setUint32(20 + i * 4, sampleSizes[i] + deltaPerVideoSample, false);
  }

  // 9. Patch hvcC dengan SPS VUI BT.2020 + HLG transfer 18
  const hvcCPos = findFourCC(u8, 'hvcC', videoTrak.hvc1Box.start, videoTrak.hvc1Box.end);
  const hvcCSize = view.getUint32(hvcCPos - 4, false);
  const origHvcC = u8.subarray(hvcCPos - 4, (hvcCPos - 4) + hvcCSize);
  const patchedHvcC = patchHvcCBuffer(origHvcC);

  const hvcCDiff = patchedHvcC.length - origHvcC.length;
  const colrDelta = COLR_19_BOX.length;
  const dvvcDelta = DVVC_32_BOX.length;
  const videoInjectionsDelta = hvcCDiff + colrDelta + dvvcDelta;

  const stszDelta = newStszBuf.length - videoTrak.stsz.size;
  const totalMoovDelta = videoInjectionsDelta + stszDelta;

  // FASTSTART LAYOUT:
  // [ftyp] -> [moov] -> [mdat]
  const estimatedMoovSize = moov.size + totalMoovDelta;
  const mdatHeaderSize = 8;
  const newMdatStart = ftypBuf.length + estimatedMoovSize;

  let runningOffset = newMdatStart + mdatHeaderSize;
  for (const gc of allGlobalChunks) {
    gc.newOffset = runningOffset;
    runningOffset += gc.newBytes.length;
  }
  const newMdatPayloadSize = runningOffset - (newMdatStart + mdatHeaderSize);
  const newMdatTotalSize = mdatHeaderSize + newMdatPayloadSize;

  // Buat box stco/co64 baru untuk semua tracks
  const newOffsetBoxes = new Map();
  for (const trk of allTracks) {
    const trkChunks = allGlobalChunks.filter(gc => gc.track === trk);
    trkChunks.sort((a, b) => a.chunkIdxInTrack - b.chunkIdxInTrack);

    const is64 = runningOffset > 0xFFFFFFFF || trk.isCo64;
    const boxType = is64 ? 'co64' : 'stco';
    const entrySize = is64 ? 8 : 4;
    const boxSize = 16 + trkChunks.length * entrySize;
    const ob = new Uint8Array(boxSize);
    const obView = new DataView(ob.buffer);
    obView.setUint32(0, boxSize, false);
    ob[4] = boxType.charCodeAt(0);
    ob[5] = boxType.charCodeAt(1);
    ob[6] = boxType.charCodeAt(2);
    ob[7] = boxType.charCodeAt(3);
    obView.setUint32(8, 0, false);
    obView.setUint32(12, trkChunks.length, false);

    for (let c = 0; c < trkChunks.length; c++) {
      if (is64) {
        obView.setBigUint64(16 + c * 8, BigInt(trkChunks[c].newOffset), false);
      } else {
        obView.setUint32(16 + c * 4, trkChunks[c].newOffset, false);
      }
    }
    newOffsetBoxes.set(trk, ob);
  }

  // Rekonstruksi moov box secara presisi
  const moovParts = [];
  let moovCursor = moov.start;

  for (const trk of allTracks) {
    moovParts.push(u8.subarray(moovCursor, trk.trak.start));

    const trakParts = [];
    let trakCursor = trk.trak.start;

    if (trk.isVideo && trk.hvc1Box) {
      // 1. Ambil bagian trak sebelum hvcC
      trakParts.push(u8.subarray(trakCursor, hvcCPos - 4));
      // 2. Suntikkan patched hvcC (SPS VUI HLG)
      trakParts.push(patchedHvcC);
      // 3. Suntikkan colr atom (BT.2020 Primaries=9, HLG Transfer=18, BT.2020 Matrix=9)
      trakParts.push(COLR_19_BOX);
      // 4. Suntikkan dvvC atom (Profile 8.4 HLG, compatibility ID 4)
      trakParts.push(DVVC_32_BOX);
      trakCursor = (hvcCPos - 4) + hvcCSize;

      // 5. Ambil bagian trak sebelum stsz
      trakParts.push(u8.subarray(trakCursor, trk.stsz.start));
      // 6. Gantikan stsz
      trakParts.push(newStszBuf);
      trakCursor = trk.stsz.end;
    }

    // 7. Gantikan offsetBox
    trakParts.push(u8.subarray(trakCursor, trk.offsetBox.start));
    trakParts.push(newOffsetBoxes.get(trk));
    trakCursor = trk.offsetBox.end;

    trakParts.push(u8.subarray(trakCursor, trk.trak.end));

    let trakBuf = concatUint8Arrays(trakParts);
    let trakView = new DataView(trakBuf.buffer, trakBuf.byteOffset, trakBuf.byteLength);

    if (trk.isVideo && trk.hvc1Box) {
      // Force sample entry name 'hev1' -> 'hvc1'
      const pHvc1Rel = findFourCC(trakBuf, 'hvc1') !== -1 ? findFourCC(trakBuf, 'hvc1') : findFourCC(trakBuf, 'hev1');
      if (pHvc1Rel !== -1) {
        trakBuf[pHvc1Rel] = 0x68;     // 'h'
        trakBuf[pHvc1Rel + 1] = 0x76; // 'v'
        trakBuf[pHvc1Rel + 2] = 0x63; // 'c'
        trakBuf[pHvc1Rel + 3] = 0x31; // '1'
      }

      const updateSizeAt = (pos, delta) => {
        if (pos >= 0 && pos + 4 <= trakBuf.length) {
          const sz = trakView.getUint32(pos, false);
          trakView.setUint32(pos, sz + delta, false);
        }
      };
      const pTrak = 0;
      const pMdia = findFourCC(trakBuf, 'mdia');
      const pMinf = findFourCC(trakBuf, 'minf');
      const pStbl = findFourCC(trakBuf, 'stbl');
      const pStsd = findFourCC(trakBuf, 'stsd');

      const trkDelta = videoInjectionsDelta + stszDelta;
      updateSizeAt(pTrak, trkDelta);
      if (pMdia >= 4) updateSizeAt(pMdia - 4, trkDelta);
      if (pMinf >= 4) updateSizeAt(pMinf - 4, trkDelta);
      if (pStbl >= 4) updateSizeAt(pStbl - 4, trkDelta);
      if (pStsd >= 4) updateSizeAt(pStsd - 4, videoInjectionsDelta);
      if (pHvc1Rel >= 4) updateSizeAt(pHvc1Rel - 4, videoInjectionsDelta);
    } else {
      const obDiff = newOffsetBoxes.get(trk).length - trk.offsetBox.size;
      if (obDiff !== 0) {
        const sz = trakView.getUint32(0, false);
        trakView.setUint32(0, sz + obDiff, false);
      }
    }

    moovParts.push(trakBuf);
    moovCursor = trk.trak.end;
  }

  moovParts.push(u8.subarray(moovCursor, moov.end));
  let moovBuf = concatUint8Arrays(moovParts);
  let moovView = new DataView(moovBuf.buffer, moovBuf.byteOffset, moovBuf.byteLength);
  moovView.setUint32(0, moovBuf.length, false);

  // Jika ukuran moov berubah dari perkiraan, sinkronkan offset
  const actualMoovDelta = moovBuf.length - estimatedMoovSize;
  if (actualMoovDelta !== 0) {
    for (const trk of allTracks) {
      const ob = newOffsetBoxes.get(trk);
      const obView = new DataView(ob.buffer, ob.byteOffset, ob.byteLength);
      const is64 = obView.getUint32(4, false) === 0x636F3634;
      const cnt = obView.getUint32(12, false);
      for (let c = 0; c < cnt; c++) {
        if (is64) {
          const cur = obView.getBigUint64(16 + c * 8, false);
          obView.setBigUint64(16 + c * 8, cur + BigInt(actualMoovDelta), false);
        } else {
          const cur = obView.getUint32(16 + c * 4, false);
          obView.setUint32(16 + c * 4, cur + actualMoovDelta, false);
        }
      }
    }
  }

  // Buat header mdat baru
  const mdatHeader = new Uint8Array(mdatHeaderSize);
  const mdatHeaderView = new DataView(mdatHeader.buffer);
  mdatHeaderView.setUint32(0, newMdatTotalSize, false);
  mdatHeader[4] = 0x6d; // 'm'
  mdatHeader[5] = 0x64; // 'd'
  mdatHeader[6] = 0x61; // 'a'
  mdatHeader[7] = 0x74; // 't'

  const mdatPayload = concatUint8Arrays(allGlobalChunks.map(gc => gc.newBytes));

  const finalBuf = concatUint8Arrays([
    ftypBuf,
    moovBuf,
    mdatHeader,
    mdatPayload
  ]);

  return {
    patchedBytes: finalBuf,
    isHevc: true,
    sampleCount,
    status: 'success',
    message: `Berhasil menginjeksikan 4000 Nits L1 RPU NAL 62 + colr HLG + dvvC (quietvoid/dovi_tool standard) ke ${sampleCount} frame HEVC!`
  };
}

export default {
  NAL62_PAYLOAD,
  NAL62_SAMPLE_UNIT,
  DVVC_32_BOX,
  COLR_19_BOX,
  patchSpsVuiToHlg,
  patchHvcCBuffer,
  detectMp4Codec,
  injectDolbyVisionBitstreamProfile84
};
