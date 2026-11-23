/**
 * Instant MP4 / MOV Container & HEVC Bitstream Patch Engine (Pure Browser JS)
 *
 * Memperbaiki struktur kontainer video H.265/HEVC maupun H.264/AVC dalam < 1.5 detik
 * TANPA decode/encode ulang video (mdatByteIdentical: true, 0% quality loss, ukuran tetap utuh):
 * - Normalisasi sample entry 'hev1' -> 'hvc1' (wajib untuk hardware decoder iOS/Instagram)
 * - True FastStart layout: [ftyp] -> [moov] -> [free] -> [mdat]
 * - Rekalkulasi presisi tabel chunk offset stco / co64 (dengan 2-pass overflow protection)
 * - Normalisasi ftyp brands (isom/mp42/hvc1 atau avc1) & perbaikan durasi mvhd/tkhd abnormal
 * - Pembersihan udta/meta & compressorname lama
 */

import { patchVideoDolbyVision } from './dolbyVisionPatcher.js';

const CONTAINER_BOXES = new Set([
  'moov',
  'trak',
  'mdia',
  'minf',
  'stbl',
  'edts',
  'dinf',
  'udta',
  'ilst'
]);

const textEncoder = new TextEncoder();

function u32(buf, off) {
  return new DataView(buf.buffer, buf.byteOffset + off, 4).getUint32(0, false);
}

function u64(buf, off) {
  return Number(new DataView(buf.buffer, buf.byteOffset + off, 8).getBigUint64(0, false));
}

function wU32(buf, off, val) {
  new DataView(buf.buffer, buf.byteOffset + off, 4).setUint32(0, val >>> 0, false);
}

function wU64(buf, off, val) {
  new DataView(buf.buffer, buf.byteOffset + off, 8).setBigUint64(0, BigInt(Math.round(val)), false);
}

function fourCC(buf, off) {
  if (off + 4 > buf.byteLength) return '';
  return String.fromCharCode(buf[off], buf[off + 1], buf[off + 2], buf[off + 3]);
}

function writeFourCC(buf, off, str) {
  for (let i = 0; i < 4; i++) {
    buf[off + i] = str.charCodeAt(i);
  }
}

function concatArrays(parts) {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

function buildBox(type, payload) {
  const size = 8 + payload.length;
  if (size > 0xffffffff) {
    throw new Error(`Box ${type} melebihi batas 4GB 32-bit.`);
  }
  const out = new Uint8Array(size);
  wU32(out, 0, size);
  writeFourCC(out, 4, type);
  out.set(payload, 8);
  return out;
}

function readBoxHeader(buf, offset, limit) {
  if (offset + 8 > limit) return null;
  let size = u32(buf, offset);
  const type = fourCC(buf, offset + 4);
  let header = 8;
  if (size === 1) {
    if (offset + 16 > limit) throw new Error(`Box ${type} header 64-bit terpotong.`);
    size = u64(buf, offset + 8);
    header = 16;
  } else if (size === 0) {
    size = limit - offset;
  }
  if (size < header || offset + size > limit) {
    throw new Error(`Struktur box ${type} tidak valid.`);
  }
  return { type, offset, size, header, end: offset + size };
}

function parseBoxTree(buf, start, end) {
  const nodes = [];
  let cursor = start;
  while (cursor + 8 <= end) {
    const hdr = readBoxHeader(buf, cursor, end);
    if (!hdr) break;
    const node = {
      type: hdr.type,
      raw: buf.slice(hdr.offset, hdr.end),
      children: null
    };
    if (CONTAINER_BOXES.has(hdr.type)) {
      node.children = parseBoxTree(buf, hdr.offset + hdr.header, hdr.end);
    }
    nodes.push(node);
    cursor = hdr.end;
  }
  return nodes;
}

function findChild(node, type) {
  return node?.children ? node.children.find((c) => c.type === type) || null : null;
}

function findPath(node, types) {
  let curr = node;
  for (const t of types) {
    curr = findChild(curr, t);
    if (!curr) return null;
  }
  return curr;
}

function payloadStart(leaf) {
  return u32(leaf.raw, 0) === 1 ? 16 : 8;
}

function serializeTree(node) {
  return node.children ? buildBox(node.type, concatArrays(node.children.map(serializeTree))) : node.raw;
}

function cloneTree(node) {
  return {
    type: node.type,
    raw: node.raw ? node.raw.slice() : null,
    children: node.children ? node.children.map(cloneTree) : null
  };
}

function getTracks(moov) {
  return (moov?.children || []).filter((c) => c.type === 'trak');
}

function getTrackHandler(trak) {
  const hdlr = findPath(trak, ['mdia', 'hdlr']);
  if (!hdlr) return '';
  const p = payloadStart(hdlr);
  if (p + 12 > hdlr.raw.byteLength) return '';
  return fourCC(hdlr.raw, p + 8);
}

function getTrackSampleTag(trak) {
  const stsd = findPath(trak, ['mdia', 'minf', 'stbl', 'stsd']);
  if (!stsd) return '';
  const p = payloadStart(stsd);
  if (p + 16 > stsd.raw.byteLength) return '';
  const entryCount = u32(stsd.raw, p + 4);
  if (entryCount < 1) return '';
  return fourCC(stsd.raw, p + 12);
}

function readTimeHeader(leaf) {
  const p = payloadStart(leaf);
  const version = leaf.raw[p];
  if (version === 1) {
    return {
      version: 1,
      timescaleOffset: p + 20,
      durationOffset: p + 28,
      width: 8,
      timescale: u32(leaf.raw, p + 20),
      duration: u64(leaf.raw, p + 28)
    };
  }
  return {
    version: 0,
    timescaleOffset: p + 12,
    durationOffset: p + 16,
    width: 4,
    timescale: u32(leaf.raw, p + 12),
    duration: u32(leaf.raw, p + 16)
  };
}

function computeTrackFps(trak) {
  const mdhd = findPath(trak, ['mdia', 'mdhd']);
  const stts = findPath(trak, ['mdia', 'minf', 'stbl', 'stts']);
  if (!mdhd || !stts) return 0;
  const { timescale } = readTimeHeader(mdhd);
  if (!timescale) return 0;

  const p = payloadStart(stts);
  if (p + 8 > stts.raw.byteLength) return 0;
  const count = u32(stts.raw, p + 4);
  if (p + 8 + count * 8 > stts.raw.byteLength) return 0;

  let totalSamples = 0;
  let totalDelta = 0;
  for (let i = 0; i < count; i++) {
    totalSamples += u32(stts.raw, p + 8 + i * 8);
    totalDelta += u32(stts.raw, p + 8 + i * 8) * u32(stts.raw, p + 12 + i * 8);
  }
  if (!totalSamples || !totalDelta) return 0;
  return Number(((timescale * totalSamples) / totalDelta).toFixed(2));
}

function analyzeMoovTree(moovNode, baseInfo) {
  const tracks = getTracks(moovNode);
  const videoTrak = tracks.find((t) => getTrackHandler(t) === 'vide');
  const audioTrak = tracks.find((t) => getTrackHandler(t) === 'soun');

  const videoCodecTag = videoTrak ? getTrackSampleTag(videoTrak) : '';
  const audioCodecTag = audioTrak ? getTrackSampleTag(audioTrak) : '';
  const fps = videoTrak ? computeTrackFps(videoTrak) : 0;

  let durationSec = 0;
  const mvhd = findChild(moovNode, 'mvhd');
  if (mvhd) {
    const info = readTimeHeader(mvhd);
    if (info.timescale > 0 && info.duration > 0 && info.duration < info.timescale * 86400 * 30) {
      durationSec = info.duration / info.timescale;
    }
  }
  if (!durationSec && videoTrak) {
    const mdhd = findPath(videoTrak, ['mdia', 'mdhd']);
    if (mdhd) {
      const info = readTimeHeader(mdhd);
      if (info.timescale > 0 && info.duration > 0) {
        durationSec = info.duration / info.timescale;
      }
    }
  }

  return {
    ...baseInfo,
    videoCodecTag,
    isHevc: videoCodecTag === 'hvc1' || videoCodecTag === 'hev1',
    isAvc: videoCodecTag === 'avc1' || videoCodecTag === 'avc3',
    audioCodecTag,
    hasAudio: Boolean(audioTrak),
    fps,
    durationSec
  };
}

/**
 * Inspeksi ringan file MP4/MOV langsung dari File object di browser (hanya membaca ftyp + moov,
 * tanpa memuat mdat ratusan MB saat file baru dipilih di Dropzone).
 * @param {File} file
 * @returns {Promise<object>}
 */
export async function inspectMp4File(file) {
  const fallback = {
    isMp4: false,
    majorBrand: '',
    isFragmented: false,
    hasFastStart: false,
    videoCodecTag: '',
    isHevc: false,
    isAvc: false,
    audioCodecTag: '',
    hasAudio: false,
    fps: 0,
    durationSec: 0,
    avgBitrateMbps: 0
  };
  if (!file || file.size < 16) return fallback;

  try {
    let offset = 0;
    let ftypBrand = '';
    let isMp4 = false;
    let isFragmented = false;
    let moovOffset = -1;
    let moovSize = 0;
    let mdatOffset = -1;

    while (offset + 8 <= file.size) {
      const sliceLen = Math.min(16, file.size - offset);
      const hdrBuf = new Uint8Array(await file.slice(offset, offset + sliceLen).arrayBuffer());
      let size = u32(hdrBuf, 0);
      const type = fourCC(hdrBuf, 4);
      let headerSize = 8;

      if (size === 1) {
        if (hdrBuf.length < 16) break;
        size = u64(hdrBuf, 8);
        headerSize = 16;
      } else if (size === 0) {
        size = file.size - offset;
      }

      if (size < headerSize || offset + size > file.size) break;

      if (offset === 0) {
        if (type !== 'ftyp') return fallback;
        isMp4 = true;
        if (size >= 12) {
          const brandBuf = new Uint8Array(await file.slice(8, 12).arrayBuffer());
          ftypBrand = fourCC(brandBuf, 0);
        }
      }

      if (type === 'moof') isFragmented = true;
      if (type === 'moov' && moovOffset === -1) {
        moovOffset = offset;
        moovSize = size;
      }
      if (type === 'mdat' && mdatOffset === -1) {
        mdatOffset = offset;
      }

      offset += size;
    }

    if (!isMp4 || moovOffset === -1 || moovSize > 64 * 1024 * 1024) {
      return { ...fallback, isMp4, majorBrand: ftypBrand, isFragmented };
    }

    const moovBuf = new Uint8Array(await file.slice(moovOffset, moovOffset + moovSize).arrayBuffer());
    const moovHdr = readBoxHeader(moovBuf, 0, moovBuf.length);
    const moovNode = {
      type: 'moov',
      raw: moovBuf,
      children: parseBoxTree(moovBuf, moovHdr.header, moovBuf.length)
    };

    const hasFastStart = mdatOffset !== -1 ? moovOffset < mdatOffset : true;
    const info = analyzeMoovTree(moovNode, {
      isMp4: true,
      majorBrand: ftypBrand,
      isFragmented,
      hasFastStart
    });

    if (info.durationSec > 0) {
      info.avgBitrateMbps = Number(((file.size * 8) / (info.durationSec * 1_000_000)).toFixed(2));
    }
    return info;
  } catch {
    return fallback;
  }
}

/**
 * Deteksi cepat codec video langsung dari Uint8Array moov (bebas false positive di mdat).
 * @param {Uint8Array|ArrayBuffer} inputData
 */
function asPureU8(inputData) {
  return inputData instanceof Uint8Array
    ? new Uint8Array(inputData.buffer, inputData.byteOffset, inputData.byteLength)
    : new Uint8Array(inputData);
}

export function detectMp4CodecFromMoov(inputData) {
  const u8 = asPureU8(inputData);
  const top = [];
  let cursor = 0;
  while (cursor + 8 <= u8.length) {
    try {
      const hdr = readBoxHeader(u8, cursor, u8.length);
      if (!hdr) break;
      top.push(hdr);
      cursor = hdr.end;
    } catch {
      break;
    }
  }
  const moovTop = top.find((x) => x.type === 'moov');
  if (!moovTop) return { isHevc: false, codec: 'Unknown / Non-MP4', tag: 'unknown' };

  const moovNode = {
    type: 'moov',
    raw: u8.subarray(moovTop.offset, moovTop.end),
    children: parseBoxTree(u8, moovTop.offset + moovTop.header, moovTop.end)
  };
  const info = analyzeMoovTree(moovNode, {});
  if (info.isHevc) {
    return { isHevc: true, codec: 'H.265 / HEVC', tag: info.videoCodecTag || 'hvc1' };
  }
  if (info.isAvc) {
    return { isHevc: false, codec: 'H.264 / AVC', tag: info.videoCodecTag || 'avc1' };
  }
  return { isHevc: false, codec: info.videoCodecTag || 'Unknown', tag: info.videoCodecTag || 'unknown' };
}

function buildCleanFtyp(videoCodecTag) {
  const codecBrand = videoCodecTag === 'hvc1' || videoCodecTag === 'hev1' ? 'hvc1' : 'avc1';
  const brands = ['isom', 'iso2', codecBrand, 'mp42'];
  const payload = new Uint8Array(8 + brands.length * 4);
  writeFourCC(payload, 0, 'mp42');
  wU32(payload, 4, 512);
  brands.forEach((b, idx) => writeFourCC(payload, 8 + idx * 4, b));
  return buildBox('ftyp', payload);
}

function rewriteHdlr(trak) {
  const mdia = findChild(trak, 'mdia');
  const h = mdia && findChild(mdia, 'hdlr');
  if (!h) return;
  const p = payloadStart(h);
  if (p + 12 > h.raw.byteLength) return;
  const handlerType = fourCC(h.raw, p + 8);
  const rest = h.raw.slice(p + 12);
  const isZero = (n) => {
    for (let i = 0; i < n; i++) if (rest[i] !== 0) return false;
    return true;
  };
  let reserved = 0;
  if (rest.length >= 12 && isZero(12)) reserved = 12;
  else if (rest.length >= 8 && isZero(8)) reserved = 8;
  let nameEnd = rest.length;
  while (nameEnd > reserved && rest[nameEnd - 1] === 0) nameEnd--;
  const nameBytes = rest.slice(reserved, nameEnd);
  const payload = concatArrays([
    new Uint8Array(4),
    new Uint8Array(4),
    textEncoder.encode(handlerType),
    new Uint8Array(12),
    nameBytes,
    new Uint8Array(1)
  ]);
  const idx = mdia.children.indexOf(h);
  mdia.children[idx] = { type: 'hdlr', raw: buildBox('hdlr', payload), children: null };
}

function zeroTimestamps(node) {
  if (node.type === 'mvhd' || node.type === 'tkhd' || node.type === 'mdhd') {
    const raw = node.raw.slice();
    const p = payloadStart(node);
    const version = raw[p];
    if (version === 1) {
      wU64(raw, p + 4, 0);
      wU64(raw, p + 12, 0);
    } else {
      wU32(raw, p + 4, 0);
      wU32(raw, p + 8, 0);
    }
    node.raw = raw;
    return;
  }
  if (node.children) {
    for (const c of node.children) zeroTimestamps(c);
  }
}

function patchVideoStsdAndCompressor(outMoov) {
  let tagBefore = '';
  let tagAfter = '';
  for (const trak of getTracks(outMoov)) {
    if (getTrackHandler(trak) !== 'vide') continue;
    const stsd = findPath(trak, ['mdia', 'minf', 'stbl', 'stsd']);
    if (!stsd) continue;
    const p = payloadStart(stsd);
    if (p + 8 > stsd.raw.byteLength) continue;
    if (u32(stsd.raw, p + 4) < 1) continue;
    const entryStart = p + 8;
    if (entryStart + 16 > stsd.raw.byteLength) continue;

    const entrySize = u32(stsd.raw, entryStart);
    const raw = stsd.raw.slice();
    tagBefore = fourCC(raw, entryStart + 4);
    tagAfter = tagBefore;

    if (tagBefore === 'hev1') {
      writeFourCC(raw, entryStart + 4, 'hvc1');
      tagAfter = 'hvc1';
    }

    const compressorOffset = entryStart + 8 + 42;
    if (entrySize >= 82 && compressorOffset + 32 <= raw.byteLength) {
      for (let i = 0; i < 32; i++) raw[compressorOffset + i] = 0;
    }
    stsd.raw = raw;
  }
  return { tagBefore, tagAfter };
}

function normalizeTimescaleAndDuration(outMoov, newMovieTimescale = 1000) {
  const mvhd = findChild(outMoov, 'mvhd');
  if (!mvhd) return;
  const mvhdInfo = readTimeHeader(mvhd);
  const oldTimescale = mvhdInfo.timescale || newMovieTimescale;

  // Hitung durasi real terpanjang dari mdhd track bila mvhd korup / 0 / 0xFFFFFFFF
  let realDurationSec = 0;
  for (const trak of getTracks(outMoov)) {
    const mdhd = findPath(trak, ['mdia', 'mdhd']);
    if (!mdhd) continue;
    const info = readTimeHeader(mdhd);
    if (info.timescale > 0 && info.duration > 0 && info.duration < info.timescale * 86400 * 30) {
      realDurationSec = Math.max(realDurationSec, info.duration / info.timescale);
    }
  }

  const ratio = newMovieTimescale / oldTimescale;
  const rawMvhd = mvhd.raw.slice();
  wU32(rawMvhd, mvhdInfo.timescaleOffset, newMovieTimescale);

  const isAbnormalMvhd =
    mvhdInfo.duration === 0 ||
    mvhdInfo.duration >= 0xfffffffe ||
    mvhdInfo.duration > oldTimescale * 86400 * 30;
  const targetMvhdDuration =
    isAbnormalMvhd && realDurationSec > 0
      ? Math.round(realDurationSec * newMovieTimescale)
      : Math.round(mvhdInfo.duration * ratio);

  if (mvhdInfo.width === 8) wU64(rawMvhd, mvhdInfo.durationOffset, targetMvhdDuration);
  else wU32(rawMvhd, mvhdInfo.durationOffset, targetMvhdDuration);
  mvhd.raw = rawMvhd;

  for (const trak of getTracks(outMoov)) {
    const tkhd = findChild(trak, 'tkhd');
    if (tkhd) {
      const p = payloadStart(tkhd);
      const version = tkhd.raw[p];
      const durOffset = version === 1 ? p + 28 : p + 20;
      const curDur = version === 1 ? u64(tkhd.raw, durOffset) : u32(tkhd.raw, durOffset);
      const isAbnormalTkhd =
        curDur === 0 ||
        curDur >= 0xfffffffe ||
        curDur > oldTimescale * 86400 * 30;
      const nextDur =
        isAbnormalTkhd && realDurationSec > 0
          ? Math.round(realDurationSec * newMovieTimescale)
          : Math.round(curDur * ratio);
      const rawTkhd = tkhd.raw.slice();
      if (version === 1) wU64(rawTkhd, durOffset, nextDur);
      else wU32(rawTkhd, durOffset, nextDur);
      tkhd.raw = rawTkhd;
    }

    const elst = findPath(trak, ['edts', 'elst']);
    if (elst && ratio !== 1) {
      const p = payloadStart(elst);
      const version = elst.raw[p];
      const entryCount = u32(elst.raw, p + 4);
      const entryWidth = version === 1 ? 20 : 12;
      const rawElst = elst.raw.slice();
      for (let i = 0; i < entryCount; i++) {
        const entryOffset = p + 8 + i * entryWidth;
        if (entryOffset + (version === 1 ? 8 : 4) > rawElst.byteLength) break;
        if (version === 1) {
          const dv = new DataView(rawElst.buffer, rawElst.byteOffset + entryOffset, 8);
          const curVal = Number(dv.getBigUint64(0, false));
          if (curVal > 0 && curVal < 0xffffffffffff) {
            dv.setBigUint64(0, BigInt(Math.round(curVal * ratio)), false);
          }
        } else {
          const curVal = u32(rawElst, entryOffset);
          if (curVal > 0 && curVal < 0xfffffffe) {
            wU32(rawElst, entryOffset, Math.round(curVal * ratio));
          }
        }
      }
      elst.raw = rawElst;
    }
  }
}

function readChunkOffsets(trak) {
  const stbl = findPath(trak, ['mdia', 'minf', 'stbl']);
  const boxNode = stbl && stbl.children.find((c) => c.type === 'stco' || c.type === 'co64');
  if (!boxNode) throw new Error('Tabel chunk offset (stco/co64) tidak ditemukan.');
  const is64 = boxNode.type === 'co64';
  const p = payloadStart(boxNode);
  const count = u32(boxNode.raw, p + 4);
  const offsets = new Array(count);
  let cursor = p + 8;
  for (let i = 0; i < count; i++) {
    offsets[i] = is64 ? u64(boxNode.raw, cursor) : u32(boxNode.raw, cursor);
    cursor += is64 ? 8 : 4;
  }
  return { is64, offsets };
}

function setChunkOffsets(trak, offsets, forceUse64) {
  const stbl = findPath(trak, ['mdia', 'minf', 'stbl']);
  const idx = stbl.children.findIndex((c) => c.type === 'stco' || c.type === 'co64');
  const old = stbl.children[idx];
  const use64 = Boolean(forceUse64 || offsets.some((v) => v > 0xffffffff));
  const step = use64 ? 8 : 4;
  const p = payloadStart(old);
  const payload = new Uint8Array(8 + offsets.length * step);
  payload.set(old.raw.slice(p, p + 4), 0);
  wU32(payload, 4, offsets.length);
  let cursor = 8;
  for (const val of offsets) {
    if (use64) wU64(payload, cursor, val);
    else wU32(payload, cursor, val);
    cursor += step;
  }
  const type = use64 ? 'co64' : 'stco';
  stbl.children[idx] = { type, raw: buildBox(type, payload), children: null };
}

function buildMdatHeader(payloadLength) {
  const size8 = 8 + payloadLength;
  if (size8 <= 0xffffffff) {
    const h = new Uint8Array(8);
    wU32(h, 0, size8);
    writeFourCC(h, 4, 'mdat');
    return h;
  }
  const h = new Uint8Array(16);
  wU32(h, 0, 1);
  writeFourCC(h, 4, 'mdat');
  wU64(h, 8, 16 + payloadLength);
  return h;
}

/**
 * Instant Clean MP4 Container & HEVC Patcher (Zero Re-Encoding, Zero Quality Loss).
 * Mempertahankan 100% byte mdat video & audio secara identik.
 * @param {Uint8Array|ArrayBuffer} inputBuffer
 * @param {object} [opts]
 * @returns {{ bytes: Uint8Array, report: object }}
 */
export function patchMp4ContainerLossless(inputBuffer, opts = {}) {
  const t0 = performance.now();
  const movieTimescale = opts.movieTimescale || 1000;
  const input = asPureU8(inputBuffer);

  const top = [];
  let cursor = 0;
  while (cursor + 8 <= input.length) {
    const hdr = readBoxHeader(input, cursor, input.length);
    if (!hdr) break;
    top.push(hdr);
    cursor = hdr.end;
  }

  const ftyp = top.find((x) => x.type === 'ftyp');
  const moovTop = top.find((x) => x.type === 'moov');
  const mdats = top.filter((x) => x.type === 'mdat');

  if (!ftyp || !moovTop || mdats.length !== 1) {
    const err = new Error('Kontainer membutuhkan tepat 1 ftyp, moov, dan mdat.');
    err.code = 'NEED_REMUX';
    throw err;
  }
  if (top.some((x) => x.type === 'moof' || x.type === 'sidx' || x.type === 'mfra')) {
    const err = new Error('Fragmented MP4 (moof) terdeteksi, mengalihkan ke fast stream-copy.');
    err.code = 'FRAGMENTED_MP4';
    throw err;
  }

  const mdat = mdats[0];
  const mdatContentStart = mdat.offset + mdat.header;
  const mediaPayload = input.subarray(mdatContentStart, mdat.end);

  const moovNode = {
    type: 'moov',
    raw: input.slice(moovTop.offset, moovTop.end),
    children: parseBoxTree(input, moovTop.offset + moovTop.header, moovTop.end)
  };
  const info = analyzeMoovTree(moovNode, {});
  if (!info.isHevc && !info.isAvc) {
    const err = new Error(`Codec video (${info.videoCodecTag || 'unknown'}) perlu remux/transcode.`);
    err.code = 'UNSUPPORTED_CODEC_FOR_PATCH';
    throw err;
  }
  if (info.hasAudio && info.audioCodecTag && info.audioCodecTag !== 'mp4a') {
    const err = new Error(`Audio codec (${info.audioCodecTag}) bukan AAC.`);
    err.code = 'NON_AAC_AUDIO';
    throw err;
  }

  const outMoov = cloneTree(moovNode);
  outMoov.children = outMoov.children.filter((c) => c.type !== 'meta' && c.type !== 'udta');
  zeroTimestamps(outMoov);
  const { tagBefore, tagAfter } = patchVideoStsdAndCompressor(outMoov);
  getTracks(outMoov).forEach(rewriteHdlr);
  normalizeTimescaleAndDuration(outMoov, movieTimescale);

  const ftypBytes = buildCleanFtyp(tagAfter || info.videoCodecTag);
  const freeBox = buildBox('free', new Uint8Array(0));
  const mdatHeader = buildMdatHeader(mediaPayload.length);

  const outTracks = getTracks(outMoov);
  const originalOffsets = outTracks.map(readChunkOffsets);
  let use64Flags = originalOffsets.map((o) => o.is64);

  let moovBytes = null;
  for (let pass = 0; pass < 3; pass++) {
    outTracks.forEach((t, i) =>
      setChunkOffsets(t, originalOffsets[i].offsets.map(() => 0), use64Flags[i])
    );
    const placeholder = serializeTree(outMoov);
    const newMediaStart = ftypBytes.length + placeholder.length + freeBox.length + mdatHeader.length;
    const shift = newMediaStart - mdatContentStart;

    const nextFlags = originalOffsets.map((o, i) => {
      const maxShifted = o.offsets.reduce((mx, v) => Math.max(mx, v + shift), 0);
      return use64Flags[i] || maxShifted > 0xffffffff;
    });
    if (nextFlags.some((f, i) => f !== use64Flags[i])) {
      use64Flags = nextFlags;
      continue;
    }

    outTracks.forEach((t, i) => {
      setChunkOffsets(
        t,
        originalOffsets[i].offsets.map((v) => v + shift),
        use64Flags[i]
      );
    });
    moovBytes = serializeTree(outMoov);
    if (moovBytes.length !== placeholder.length) {
      throw new Error('Gagal menstabilkan ukuran moov pasca rekalkulasi offset.');
    }
    break;
  }

  if (!moovBytes) {
    throw new Error('Gagal menghitung offset stco/co64.');
  }

  const output = concatArrays([ftypBytes, moovBytes, freeBox, mdatHeader, mediaPayload]);
  const elapsedMs = Math.round(performance.now() - t0);

  return {
    bytes: output,
    report: {
      mode: 'instant-clean-patch',
      videoCodec: info.isHevc ? 'H.265 / HEVC' : 'H.264 / AVC',
      videoCodecTagBefore: tagBefore || info.videoCodecTag,
      videoCodecTagAfter: tagAfter || info.videoCodecTag,
      moovWasBehindMdat: moovTop.offset > mdat.offset,
      moovMovedBeforeMdat: true,
      ftypNormalized: true,
      mdatByteIdentical: true,
      movieTimescale,
      fps: info.fps,
      durationSec: info.durationSec,
      elapsedMs
    }
  };
}

/**
 * Instant HDR Silau Patcher untuk video HEVC (Dolby Vision Profile 8.4 RPU NAL 62 + colr HLG + dvvC).
 * Hanya menerima file MP4/MOV ber-codec HEVC agar video SDR H.264 tidak rusak.
 * @param {Uint8Array|ArrayBuffer} inputBuffer
 * @returns {{ bytes: Uint8Array, report: object }}
 */
export function patchHevcDolbyVisionInstant(inputBuffer) {
  const t0 = performance.now();
  const input = asPureU8(inputBuffer);
  const codecInfo = detectMp4CodecFromMoov(input);
  if (!codecInfo.isHevc) {
    const err = new Error(
      `Preset HDR Silau Patch khusus video H.265 / HEVC. File ini terdeteksi ${codecInfo.codec} (${codecInfo.tag}). Gunakan "Instant Patch IG Story" atau preset re-encode.`
    );
    err.code = 'NOT_HEVC';
    throw err;
  }

  const patched = patchVideoDolbyVision(input);
  const patchedInfo = detectMp4CodecFromMoov(patched);
  const elapsedMs = Math.round(performance.now() - t0);

  return {
    bytes: patched instanceof Uint8Array ? patched : new Uint8Array(patched),
    report: {
      mode: 'instant-dovi-84-patch',
      videoCodec: 'H.265 / HEVC (Dolby Vision 8.4 HLG)',
      videoCodecTagBefore: codecInfo.tag,
      videoCodecTagAfter: patchedInfo.tag || 'hvc1',
      moovMovedBeforeMdat: true,
      doviInjected: true,
      elapsedMs
    }
  };
}
