/**
 * DOLBY VISION PROFILE 8.4 (HLG) & CONTAINER INJECTOR (BROWSER & WORKER NATIVE)
 *
 * Menginjeksikan NAL Unit Type 62 (Dolby Vision RPU) ke setiap frame bitstream HEVC,
 * atom Dolby Vision `dvvC` (32-byte Profile 8.4 BL+RPU HLG Compatible),
 * memvalidasi Main Tier (tierFlag: 0), menormalisasi brand ISO MP4 (`isom`),
 * dan memperbaiki durasi container `mvhd`.
 *
 * 100% Identik dengan spesifikasi video Wanxzyy / Rein yang tembus TikTok tanpa re-encode.
 * Bekerja 100% native di browser via Uint8Array & DataView tanpa dependency eksternal.
 */

// Paket NAL Unit Type 62 (Dolby Vision RPU) terkalibrasi Peak EDR 1000 Nits HLG (427 bytes)
const RPU_HEX =
  '000001a77c0119080908406136506e203f114e6401000941002007801ffc00fffa7e6fec' +
  '17f26373ca9a60a7f8bbc14f242c2bba6cfa941a97d175a07c6219aa8164ae7e11628bae' +
  '32be73af0b4a33191830b8a18d335503ac32640202590a2834ef60c01ee81340041528c0' +
  '281c1db70003e92fde00225cfdc0522319cec0aa9d96f85fd0b139b8841f3a802b21f140' +
  '4a7200c0660f0383fd4b02ec670d991bb4e3ddf8942cbebba065c127c024c202e0fe5ada' +
  'd8e2ff96d8c43c712d311ae6680e9bf49809ef955828b7e7400402f250d1ed28149bd470' +
  'be8dec022a930d1afa5154b4c2b44e74c7c69c97946f800b052395203027a643ad79e049' +
  '96d66418cbe6b118448a39681823ba4088f61b470a876844d8714d12b300001af512b37c' +
  'fe758e12b3226500000300800000040000030004000003000e1b112180c3052f1847028a' +
  '00000300d31f2d7fff800000030000030000030030103ec070a980300800410999810100' +
  '0003000480301c001f7b3300b08ff99a8008a0800800800161029001000ed90010010008' +
  '2400c15ffce00000460a14a70000030228582000000303fe00022595781080';

const RPU_PACKET = new Uint8Array(RPU_HEX.match(/../g).map(h => parseInt(h, 16)));

// Atom dvvC 32 byte (Dolby Vision v2.4 Profile 8.4 BL+RPU HLG)
const DVVC_32_BOX = new Uint8Array([
  0x00, 0x00, 0x00, 0x20, // 32 bytes
  0x64, 0x76, 0x76, 0x43, // 'dvvC'
  0x01, 0x00, 0x10, 0x25, 0x40, // Profile 8.4 HLG
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00
]);

function find4CC(u8, fourCC, from = 0) {
  const b0 = fourCC.charCodeAt(0);
  const b1 = fourCC.charCodeAt(1);
  const b2 = fourCC.charCodeAt(2);
  const b3 = fourCC.charCodeAt(3);
  const len = u8.length - 3;
  for (let i = from; i < len; i++) {
    if (u8[i] === b0 && u8[i + 1] === b1 && u8[i + 2] === b2 && u8[i + 3] === b3) {
      return i;
    }
  }
  return -1;
}

/**
 * Patch video HEVC MP4 secara komprehensif:
 * 1. Sisipkan NAL Unit Type 62 (Dolby Vision RPU) ke setiap frame video bitstream
 * 2. Pasang box dvvC 32-byte pada visual sample entry hvc1
 * 3. Kunci HEVC profile tier ke 0 (Main Tier)
 * 4. Normalisasi ftyp ke major_brand 'isom' dengan compatible brands isom, iso2, hvc1, mp41
 * 5. Rekalkulasi tabel stsz dan stco/co64
 * 6. Perbaiki durasi container mvhd yang korup (-1)
 *
 * @param {Uint8Array|ArrayBuffer} inputBytes
 * @returns {Uint8Array}
 */
export function injectDolbyVisionBitstreamAndContainer(inputBytes) {
  let u8 = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  let view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);

  const moovIdx = find4CC(u8, 'moov');
  const mdatIdx = find4CC(u8, 'mdat');
  if (moovIdx === -1 || mdatIdx === -1) {
    console.warn('[DOVI-PATCHER] moov atau mdat tidak ditemukan');
    return u8;
  }

  // Cari video track (trak dengan handler 'vide')
  let trakPos = find4CC(u8, 'trak', moovIdx);
  let videoTrakIdx = -1;
  const moovSize = view.getUint32(moovIdx - 4, false);
  const moovEnd = (moovIdx - 4) + moovSize;

  while (trakPos !== -1 && trakPos < moovEnd) {
    const hdlrIdx = find4CC(u8, 'hdlr', trakPos);
    if (hdlrIdx !== -1) {
      const isVide = u8[hdlrIdx + 12] === 0x76 && u8[hdlrIdx + 13] === 0x69 &&
                     u8[hdlrIdx + 14] === 0x64 && u8[hdlrIdx + 15] === 0x65;
      if (isVide) {
        videoTrakIdx = trakPos;
        break;
      }
    }
    trakPos = find4CC(u8, 'trak', trakPos + 4);
  }

  if (videoTrakIdx === -1) {
    console.warn('[DOVI-PATCHER] Video track tidak ditemukan');
    return u8;
  }

  const mdiaIdx = find4CC(u8, 'mdia', videoTrakIdx);
  const minfIdx = find4CC(u8, 'minf', mdiaIdx);
  const stblIdx = find4CC(u8, 'stbl', minfIdx);

  // Ambil stsz (sample sizes)
  const stszIdx = find4CC(u8, 'stsz', stblIdx);
  if (stszIdx === -1) return u8;
  const sampleCount = view.getUint32(stszIdx + 12, false);
  const sampleSizes = [];
  for (let i = 0; i < sampleCount; i++) {
    sampleSizes.push(view.getUint32(stszIdx + 16 + i * 4, false));
  }

  // Ambil stco / co64 (chunk offsets)
  let is64Bit = false;
  let stcoTablePos = -1;
  let stcoEntryCount = 0;
  let chunkOffsets = [];

  const stcoIdx = find4CC(u8, 'stco', stblIdx);
  if (stcoIdx !== -1) {
    stcoTablePos = stcoIdx + 12;
    stcoEntryCount = view.getUint32(stcoIdx + 8, false);
    for (let i = 0; i < stcoEntryCount; i++) {
      chunkOffsets.push(view.getUint32(stcoTablePos + i * 4, false));
    }
  } else {
    const co64Idx = find4CC(u8, 'co64', stblIdx);
    if (co64Idx === -1) return u8;
    is64Bit = true;
    stcoTablePos = co64Idx + 12;
    stcoEntryCount = view.getUint32(co64Idx + 8, false);
    for (let i = 0; i < stcoEntryCount; i++) {
      chunkOffsets.push(Number(view.getBigUint64(stcoTablePos + i * 8, false)));
    }
  }

  // Cek apakah RPU NAL 62 sudah terpasang
  const firstSamplePos = chunkOffsets[0];
  let alreadyHasRpu = false;
  for (let i = firstSamplePos; i < firstSamplePos + Math.min(60, sampleSizes[0]); i++) {
    if (u8[i] === 0x7c && u8[i + 1] === 0x01 && u8[i + 2] === 0x19 && u8[i + 3] === 0x08) {
      alreadyHasRpu = true;
      break;
    }
  }

  let newSampleSizes = [...sampleSizes];
  let newChunkOffsets = [...chunkOffsets];
  let newMdatPayload = null;
  const expansionPerSample = RPU_PACKET.length;

  if (!alreadyHasRpu) {
    console.log(`[DOVI-PATCHER] Menyuntikkan NAL Unit Type 62 Dolby Vision RPU ke ${sampleCount} frame...`);

    // Parse stsc untuk mapping sample -> chunk
    const stscIdx = find4CC(u8, 'stsc', stblIdx);
    const stscCount = view.getUint32(stscIdx + 8, false);
    const stscEntries = [];
    for (let i = 0; i < stscCount; i++) {
      stscEntries.push({
        firstChunk: view.getUint32(stscIdx + 12 + i * 12, false),
        samplesPerChunk: view.getUint32(stscIdx + 16 + i * 12, false),
        sampleDescIndex: view.getUint32(stscIdx + 20 + i * 12, false)
      });
    }

    let currentChunk = 1;
    let currentChunkSampleIndex = 0;
    let stscIdxPtr = 0;
    const chunkToSamples = Array.from({ length: stcoEntryCount }, () => []);

    for (let s = 0; s < sampleCount; s++) {
      while (stscIdxPtr + 1 < stscEntries.length && currentChunk >= stscEntries[stscIdxPtr + 1].firstChunk) {
        stscIdxPtr++;
      }
      const samplesInThisChunk = stscEntries[stscIdxPtr].samplesPerChunk;
      chunkToSamples[currentChunk - 1].push(s);

      currentChunkSampleIndex++;
      if (currentChunkSampleIndex >= samplesInThisChunk) {
        currentChunk++;
        currentChunkSampleIndex = 0;
      }
    }

    // Bangun payload mdat baru
    const totalNewMdatSize = (u8.length - (mdatIdx + 4)) + (sampleCount * expansionPerSample);
    newMdatPayload = new Uint8Array(totalNewMdatSize);
    let payloadWritePos = 0;

    newChunkOffsets = [];
    let currentOffset = chunkOffsets[0];

    for (let c = 0; c < stcoEntryCount; c++) {
      newChunkOffsets.push(currentOffset);
      const chunkSampleIndices = chunkToSamples[c];
      let oldChunkPos = chunkOffsets[c];

      for (const sIdx of chunkSampleIndices) {
        const oldSampleSize = sampleSizes[sIdx];
        newMdatPayload.set(RPU_PACKET, payloadWritePos);
        payloadWritePos += expansionPerSample;

        newMdatPayload.set(u8.subarray(oldChunkPos, oldChunkPos + oldSampleSize), payloadWritePos);
        payloadWritePos += oldSampleSize;

        newSampleSizes[sIdx] = oldSampleSize + expansionPerSample;
        oldChunkPos += oldSampleSize;
      }

      currentOffset += (oldChunkPos - chunkOffsets[c]) + (chunkSampleIndices.length * expansionPerSample);
    }
  }

  // Rekonstruksi Header MP4
  let headerPart = new Uint8Array(u8.subarray(0, mdatIdx - 4));
  let hView = new DataView(headerPart.buffer, headerPart.byteOffset, headerPart.byteLength);

  // 1. Update stsz jika ada ekspansi
  if (!alreadyHasRpu) {
    const stszInHeader = find4CC(headerPart, 'stsz', stblIdx);
    for (let i = 0; i < sampleCount; i++) {
      hView.setUint32(stszInHeader + 16 + i * 4, newSampleSizes[i], false);
    }
  }

  // 2. Update stco / co64
  if (!alreadyHasRpu) {
    if (!is64Bit) {
      const stcoInHeader = find4CC(headerPart, 'stco', stblIdx);
      for (let i = 0; i < stcoEntryCount; i++) {
        hView.setUint32(stcoInHeader + 12 + i * 4, newChunkOffsets[i], false);
      }
    } else {
      const co64InHeader = find4CC(headerPart, 'co64', stblIdx);
      for (let i = 0; i < stcoEntryCount; i++) {
        hView.setBigUint64(co64InHeader + 12 + i * 8, BigInt(newChunkOffsets[i]), false);
      }
    }
  }

  // 3. Kunci HEVC tierFlag ke 0 (Main Tier) pada sub-box hvcC
  const hvcCInHeader = find4CC(headerPart, 'hvcC', stblIdx);
  if (hvcCInHeader !== -1) {
    headerPart[hvcCInHeader + 5] = (headerPart[hvcCInHeader + 5] & 0xDF); // clear bit 5 (tierFlag = 0)
    console.log('[DOVI-PATCHER] HEVC Profile terkunci ke Main Tier (tierFlag: 0)!');
  }

  // 4. Update atau sisipkan dvvC 32-byte
  const dvvCInHeader = find4CC(headerPart, 'dvvC', stblIdx);
  if (dvvCInHeader !== -1) {
    const oldDvvCSize = hView.getUint32(dvvCInHeader - 4, false);
    if (oldDvvCSize === 24) {
      const dvvCStart = dvvCInHeader - 4;
      const b1 = headerPart.subarray(0, dvvCStart);
      const b2 = headerPart.subarray(dvvCStart + oldDvvCSize);
      const merged = new Uint8Array(b1.length + DVVC_32_BOX.length + b2.length);
      merged.set(b1, 0);
      merged.set(DVVC_32_BOX, b1.length);
      merged.set(b2, b1.length + DVVC_32_BOX.length);
      headerPart = merged;
      hView = new DataView(headerPart.buffer, headerPart.byteOffset, headerPart.byteLength);

      const delta = 8;
      ['hvc1', 'stsd', 'stbl', 'minf', 'mdia', 'trak', 'moov'].forEach(tag => {
        const p = find4CC(headerPart, tag);
        if (p !== -1) {
          const sz = hView.getUint32(p - 4, false);
          hView.setUint32(p - 4, sz + delta, false);
        }
      });
      for (let i = 0; i < stcoEntryCount; i++) {
        newChunkOffsets[i] += delta;
      }
    }
  } else if (hvcCInHeader !== -1) {
    const hvcCSize = hView.getUint32(hvcCInHeader - 4, false);
    const insertPos = (hvcCInHeader - 4) + hvcCSize;
    const b1 = headerPart.subarray(0, insertPos);
    const b2 = headerPart.subarray(insertPos);
    const merged = new Uint8Array(b1.length + DVVC_32_BOX.length + b2.length);
    merged.set(b1, 0);
    merged.set(DVVC_32_BOX, b1.length);
    merged.set(b2, b1.length + DVVC_32_BOX.length);
    headerPart = merged;
    hView = new DataView(headerPart.buffer, headerPart.byteOffset, headerPart.byteLength);

    const delta = DVVC_32_BOX.length;
    ['hvc1', 'stsd', 'stbl', 'minf', 'mdia', 'trak', 'moov'].forEach(tag => {
      const p = find4CC(headerPart, tag);
      if (p !== -1) {
        const sz = hView.getUint32(p - 4, false);
        hView.setUint32(p - 4, sz + delta, false);
      }
    });
    for (let i = 0; i < stcoEntryCount; i++) {
      newChunkOffsets[i] += delta;
    }
  }

  // 5. Update ftyp ke major_brand 'isom' dan compatible brands: isom, iso2, hvc1, mp41
  const ftypInHeader = find4CC(headerPart, 'ftyp');
  if (ftypInHeader !== -1 && ftypInHeader <= 8) {
    headerPart[ftypInHeader + 4] = 0x69; // 'i'
    headerPart[ftypInHeader + 5] = 0x73; // 's'
    headerPart[ftypInHeader + 6] = 0x6f; // 'o'
    headerPart[ftypInHeader + 7] = 0x6d; // 'm'
    hView.setUint32(ftypInHeader + 8, 512, false);
    if (headerPart.length >= ftypInHeader + 28) {
      headerPart[ftypInHeader + 12] = 0x69; headerPart[ftypInHeader + 13] = 0x73; headerPart[ftypInHeader + 14] = 0x6f; headerPart[ftypInHeader + 15] = 0x6d;
      headerPart[ftypInHeader + 16] = 0x69; headerPart[ftypInHeader + 17] = 0x73; headerPart[ftypInHeader + 18] = 0x6f; headerPart[ftypInHeader + 19] = 0x32;
      headerPart[ftypInHeader + 20] = 0x68; headerPart[ftypInHeader + 21] = 0x76; headerPart[ftypInHeader + 22] = 0x63; headerPart[ftypInHeader + 23] = 0x31;
      headerPart[ftypInHeader + 24] = 0x6d; headerPart[ftypInHeader + 25] = 0x70; headerPart[ftypInHeader + 26] = 0x34; headerPart[ftypInHeader + 27] = 0x31;
    }
  }

  // 6. Normalisasi durasi container mvhd jika -1 atau korup
  const mvhdInHeader = find4CC(headerPart, 'mvhd');
  if (mvhdInHeader !== -1) {
    const ver = headerPart[mvhdInHeader + 4];
    if (ver === 1) {
      const dur = hView.getBigUint64(mvhdInHeader + 28, false);
      if (dur === 0xFFFFFFFFFFFFFFFFn || dur > 1000000000n) {
        const mdhdInHeader = find4CC(headerPart, 'mdhd', videoTrakIdx);
        if (mdhdInHeader !== -1) {
          const ts = hView.getUint32(mdhdInHeader + 16, false);
          const mdDur = hView.getUint32(mdhdInHeader + 20, false);
          const mvTs = hView.getUint32(mvhdInHeader + 24, false);
          const finalMvDur = BigInt(Math.round((mdDur / ts) * mvTs));
          hView.setBigUint64(mvhdInHeader + 28, finalMvDur, false);
          console.log(`[DOVI-PATCHER] Durasi mvhd dinormalisasi: ${finalMvDur} (ts: ${mvTs})`);
        }
      }
    }
  }

  // Gabungkan payload mdat baru jika ada ekspansi RPU
  if (!alreadyHasRpu && newMdatPayload) {
    const mdatBoxHeader = new Uint8Array(8);
    const mdatView = new DataView(mdatBoxHeader.buffer);
    mdatView.setUint32(0, newMdatPayload.length + 8, false);
    mdatBoxHeader[4] = 0x6d; // 'm'
    mdatBoxHeader[5] = 0x64; // 'd'
    mdatBoxHeader[6] = 0x61; // 'a'
    mdatBoxHeader[7] = 0x74; // 't'

    const finalResult = new Uint8Array(headerPart.length + 8 + newMdatPayload.length);
    finalResult.set(headerPart, 0);
    finalResult.set(mdatBoxHeader, headerPart.length);
    finalResult.set(newMdatPayload, headerPart.length + 8);
    return finalResult;
  } else {
    const remainingMdat = u8.subarray(mdatIdx - 4);
    const finalResult = new Uint8Array(headerPart.length + remainingMdat.length);
    finalResult.set(headerPart, 0);
    finalResult.set(remainingMdat, headerPart.length);
    return finalResult;
  }
}

/**
 * Patch video lengkap: Injeksi Dolby Vision Profile 8.4 Bitstream RPU + Wanxzyy Spec
 *
 * @param {Uint8Array|ArrayBuffer} inputBytes
 * @returns {Promise<Uint8Array>}
 */
export async function patchVideoDolbyVision(inputBytes) {
  return injectDolbyVisionBitstreamAndContainer(inputBytes);
}

export default {
  injectDolbyVisionProfile8: injectDolbyVisionBitstreamAndContainer,
  injectDolbyVisionBitstreamAndContainer,
  patchVideoDolbyVision
};
