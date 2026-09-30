/**
 * DOLBY VISION PROFILE 8.4 (HLG) & CONTAINER INJECTOR (BROWSER & WORKER NATIVE)
 *
 * Menginjeksikan NAL Unit Type 62 (Dolby Vision RPU) ke setiap frame bitstream HEVC,
 * atom Dolby Vision `dvvC` (32-byte Profile 8.4 BL+RPU HLG Compatible),
 * memvalidasi Main Tier (tierFlag: 0), menormalisasi brand ISO MP4 (`isom`),
 * memperbaiki durasi container `mvhd`, dan MEMPERTAHANKAN 100% TRACK AUDIO
 * melalui algoritma Multi-Track Chunk Interleaving.
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
 * Patch video HEVC MP4 secara komprehensif (Multi-Track Aware):
 * 1. Sisipkan NAL Unit Type 62 (Dolby Vision RPU) ke setiap frame video bitstream
 * 2. Pasang box dvvC 32-byte pada visual sample entry hvc1
 * 3. Kunci HEVC profile tier ke 0 (Main Tier)
 * 4. Normalisasi ftyp ke major_brand 'isom' dengan compatible brands isom, iso2, hvc1, mp41
 * 5. Rekalkulasi tabel stsz dan stco/co64 untuk SELURUH track (video & audio terjaga 100%)
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
    return u8;
  }

  const moovSize = view.getUint32(moovIdx - 4, false);
  const moovEnd = (moovIdx - 4) + moovSize;

  // 1. Temukan seluruh track dalam moov (video, audio, dll)
  let trakPos = find4CC(u8, 'trak', moovIdx);
  const tracks = [];

  while (trakPos !== -1 && trakPos < moovEnd) {
    const trakSize = view.getUint32(trakPos - 4, false);
    const trakEnd = (trakPos - 4) + trakSize;

    const hdlrIdx = find4CC(u8, 'hdlr', trakPos);
    let handler = 'unknown';
    if (hdlrIdx !== -1 && hdlrIdx < trakEnd) {
      handler = String.fromCharCode(u8[hdlrIdx + 12], u8[hdlrIdx + 13], u8[hdlrIdx + 14], u8[hdlrIdx + 15]);
    }

    const stblIdx = find4CC(u8, 'stbl', trakPos);
    if (stblIdx !== -1 && stblIdx < trakEnd) {
      // stsz
      const stszIdx = find4CC(u8, 'stsz', stblIdx);
      let sampleSizes = [];
      let sampleCount = 0;
      if (stszIdx !== -1) {
        sampleCount = view.getUint32(stszIdx + 12, false);
        for (let i = 0; i < sampleCount; i++) {
          sampleSizes.push(view.getUint32(stszIdx + 16 + i * 4, false));
        }
      }

      // stsc
      const stscIdx = find4CC(u8, 'stsc', stblIdx);
      const stscEntries = [];
      if (stscIdx !== -1) {
        const count = view.getUint32(stscIdx + 8, false);
        for (let i = 0; i < count; i++) {
          stscEntries.push({
            firstChunk: view.getUint32(stscIdx + 12 + i * 12, false),
            samplesPerChunk: view.getUint32(stscIdx + 16 + i * 12, false),
            sampleDescIndex: view.getUint32(stscIdx + 20 + i * 12, false)
          });
        }
      }

      // stco / co64
      let is64Bit = false;
      let chunkOffsets = [];
      const stcoIdx = find4CC(u8, 'stco', stblIdx);
      if (stcoIdx !== -1) {
        const count = view.getUint32(stcoIdx + 8, false);
        for (let i = 0; i < count; i++) {
          chunkOffsets.push(view.getUint32(stcoIdx + 12 + i * 4, false));
        }
      } else {
        const co64Idx = find4CC(u8, 'co64', stblIdx);
        if (co64Idx !== -1) {
          is64Bit = true;
          const count = view.getUint32(co64Idx + 8, false);
          for (let i = 0; i < count; i++) {
            chunkOffsets.push(Number(view.getBigUint64(co64Idx + 12 + i * 8, false)));
          }
        }
      }

      // Map samples ke chunks
      let currentChunk = 1;
      let currentChunkSampleIndex = 0;
      let stscIdxPtr = 0;
      const chunkToSamples = Array.from({ length: chunkOffsets.length }, () => []);

      for (let s = 0; s < sampleCount; s++) {
        while (stscIdxPtr + 1 < stscEntries.length && currentChunk >= stscEntries[stscIdxPtr + 1].firstChunk) {
          stscIdxPtr++;
        }
        const samplesInThisChunk = stscEntries[stscIdxPtr] ? stscEntries[stscIdxPtr].samplesPerChunk : 1;
        if (currentChunk - 1 < chunkOffsets.length) {
          chunkToSamples[currentChunk - 1].push(s);
        }

        currentChunkSampleIndex++;
        if (currentChunkSampleIndex >= samplesInThisChunk) {
          currentChunk++;
          currentChunkSampleIndex = 0;
        }
      }

      tracks.push({
        trackIndex: tracks.length,
        trakPos,
        handler,
        sampleSizes,
        sampleCount,
        is64Bit,
        chunkOffsets,
        chunkToSamples
      });
    }

    trakPos = find4CC(u8, 'trak', trakPos + 4);
  }

  const videoTrack = tracks.find(t => t.handler === 'vide');
  if (!videoTrack) return u8;

  // Cek apakah RPU NAL 62 sudah terpasang
  const firstSamplePos = videoTrack.chunkOffsets[0];
  let alreadyHasRpu = false;
  for (let i = firstSamplePos; i < firstSamplePos + Math.min(60, videoTrack.sampleSizes[0]); i++) {
    if (u8[i] === 0x7c && u8[i + 1] === 0x01 && u8[i + 2] === 0x19 && u8[i + 3] === 0x08) {
      alreadyHasRpu = true;
      break;
    }
  }

  // 2. Siapkan MP4 Header Part (sebelum mdat) dan mutasikan box dvvC terlebih dahulu
  let headerPart = new Uint8Array(u8.subarray(0, mdatIdx - 4));
  let hView = new DataView(headerPart.buffer, headerPart.byteOffset, headerPart.byteLength);

  // Kunci Main Tier (tierFlag = 0)
  const vTrakInHeader = find4CC(headerPart, 'trak', find4CC(headerPart, 'moov'));
  const hvcCInHeader = find4CC(headerPart, 'hvcC', vTrakInHeader);
  if (hvcCInHeader !== -1) {
    headerPart[hvcCInHeader + 5] = (headerPart[hvcCInHeader + 5] & 0xDF);
  }

  // Update atau sisipkan box dvvC 32-byte
  const dvvCInHeader = find4CC(headerPart, 'dvvC', vTrakInHeader);
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
        let p = find4CC(headerPart, tag);
        while (p !== -1 && p < (dvvCStart + 100)) {
          const sz = hView.getUint32(p - 4, false);
          hView.setUint32(p - 4, sz + delta, false);
          p = find4CC(headerPart, tag, p + 4);
        }
      });
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
      let p = find4CC(headerPart, tag);
      while (p !== -1 && p < (insertPos + 100)) {
        const sz = hView.getUint32(p - 4, false);
        hView.setUint32(p - 4, sz + delta, false);
        p = find4CC(headerPart, tag, p + 4);
      }
    });
  }

  // Update ftyp ke isom / iso2 / hvc1 / mp41
  const ftypInHeader = find4CC(headerPart, 'ftyp');
  if (ftypInHeader !== -1 && ftypInHeader <= 8) {
    headerPart[ftypInHeader + 4] = 0x69; headerPart[ftypInHeader + 5] = 0x73; headerPart[ftypInHeader + 6] = 0x6f; headerPart[ftypInHeader + 7] = 0x6d;
    hView.setUint32(ftypInHeader + 8, 512, false);
    if (headerPart.length >= ftypInHeader + 28) {
      headerPart[ftypInHeader + 12] = 0x69; headerPart[ftypInHeader + 13] = 0x73; headerPart[ftypInHeader + 14] = 0x6f; headerPart[ftypInHeader + 15] = 0x6d;
      headerPart[ftypInHeader + 16] = 0x69; headerPart[ftypInHeader + 17] = 0x73; headerPart[ftypInHeader + 18] = 0x6f; headerPart[ftypInHeader + 19] = 0x32;
      headerPart[ftypInHeader + 20] = 0x68; headerPart[ftypInHeader + 21] = 0x76; headerPart[ftypInHeader + 22] = 0x63; headerPart[ftypInHeader + 23] = 0x31;
      headerPart[ftypInHeader + 24] = 0x6d; headerPart[ftypInHeader + 25] = 0x70; headerPart[ftypInHeader + 26] = 0x34; headerPart[ftypInHeader + 27] = 0x31;
    }
  }

  // Normalisasi durasi container mvhd
  const mvhdInHeader = find4CC(headerPart, 'mvhd');
  if (mvhdInHeader !== -1) {
    const ver = headerPart[mvhdInHeader + 4];
    if (ver === 1) {
      const dur = hView.getBigUint64(mvhdInHeader + 28, false);
      if (dur === 0xFFFFFFFFFFFFFFFFn || dur > 1000000000n) {
        const mdhdInHeader = find4CC(headerPart, 'mdhd', vTrakInHeader);
        if (mdhdInHeader !== -1) {
          const ts = hView.getUint32(mdhdInHeader + 16, false);
          const mdDur = hView.getUint32(mdhdInHeader + 20, false);
          const mvTs = hView.getUint32(mvhdInHeader + 24, false);
          const finalMvDur = BigInt(Math.round((mdDur / ts) * mvTs));
          hView.setBigUint64(mvhdInHeader + 28, finalMvDur, false);
        }
      }
    }
  }

  // 3. Rekonstruksi mdat: Kumpulkan SELURUH CHUNK secara kronologis lintas track (Interleaved)
  const allChunks = [];
  for (let tIdx = 0; tIdx < tracks.length; tIdx++) {
    const t = tracks[tIdx];
    for (let cIdx = 0; cIdx < t.chunkOffsets.length; cIdx++) {
      allChunks.push({
        trackIdx: tIdx,
        chunkIdx: cIdx,
        oldOffset: t.chunkOffsets[cIdx],
        sampleIndices: t.chunkToSamples[cIdx],
        isVideo: t.handler === 'vide'
      });
    }
  }

  allChunks.sort((a, b) => a.oldOffset - b.oldOffset);

  // Posisi awal mdat payload:
  let currentOffset = headerPart.length + 8;

  // Hitung ukuran total mdat payload baru secara presisi
  const expansionPerSample = RPU_PACKET.length;
  let totalNewMdatSize = 0;
  for (const chunk of allChunks) {
    const t = tracks[chunk.trackIdx];
    for (const sIdx of chunk.sampleIndices) {
      totalNewMdatSize += t.sampleSizes[sIdx];
      if (chunk.isVideo && !alreadyHasRpu) {
        totalNewMdatSize += expansionPerSample;
      }
    }
  }

  const newMdatPayload = new Uint8Array(totalNewMdatSize);
  let payloadWritePos = 0;

  const newChunkOffsetsPerTrack = tracks.map(t => new Array(t.chunkOffsets.length));
  const newVideoSampleSizes = [...videoTrack.sampleSizes];

  for (const chunk of allChunks) {
    newChunkOffsetsPerTrack[chunk.trackIdx][chunk.chunkIdx] = currentOffset;
    const t = tracks[chunk.trackIdx];

    if (chunk.isVideo && !alreadyHasRpu) {
      let oldPos = chunk.oldOffset;
      for (const sIdx of chunk.sampleIndices) {
        const sSize = t.sampleSizes[sIdx];
        newMdatPayload.set(RPU_PACKET, payloadWritePos);
        payloadWritePos += expansionPerSample;

        newMdatPayload.set(u8.subarray(oldPos, oldPos + sSize), payloadWritePos);
        payloadWritePos += sSize;

        newVideoSampleSizes[sIdx] = sSize + expansionPerSample;
        oldPos += sSize;
      }
      currentOffset += (oldPos - chunk.oldOffset) + (chunk.sampleIndices.length * expansionPerSample);
    } else {
      let chunkSize = 0;
      for (const sIdx of chunk.sampleIndices) {
        chunkSize += t.sampleSizes[sIdx];
      }
      newMdatPayload.set(u8.subarray(chunk.oldOffset, chunk.oldOffset + chunkSize), payloadWritePos);
      payloadWritePos += chunkSize;
      currentOffset += chunkSize;
    }
  }

  // 4. Perbarui tabel stsz dan stco/co64 di Header Part
  let freshTrakPos = find4CC(headerPart, 'trak');
  for (let tIdx = 0; tIdx < tracks.length; tIdx++) {
    const t = tracks[tIdx];
    const stblPos = find4CC(headerPart, 'stbl', freshTrakPos);
    const newOffsets = newChunkOffsetsPerTrack[tIdx];

    // Track Video: Perbarui ukuran sample (stsz)
    if (t.handler === 'vide' && !alreadyHasRpu) {
      const stszPos = find4CC(headerPart, 'stsz', stblPos);
      if (stszPos !== -1) {
        for (let i = 0; i < t.sampleCount; i++) {
          hView.setUint32(stszPos + 16 + i * 4, newVideoSampleSizes[i], false);
        }
      }
    }

    // Seluruh Track (Video & Audio): Perbarui chunk offset (stco / co64)
    if (!t.is64Bit) {
      const stcoPos = find4CC(headerPart, 'stco', stblPos);
      if (stcoPos !== -1) {
        for (let i = 0; i < newOffsets.length; i++) {
          hView.setUint32(stcoPos + 12 + i * 4, newOffsets[i], false);
        }
      }
    } else {
      const co64Pos = find4CC(headerPart, 'co64', stblPos);
      if (co64Pos !== -1) {
        for (let i = 0; i < newOffsets.length; i++) {
          hView.setBigUint64(co64Pos + 12 + i * 8, BigInt(newOffsets[i]), false);
        }
      }
    }

    freshTrakPos = find4CC(headerPart, 'trak', freshTrakPos + 4);
  }

  // 5. Rakit binary MP4 final
  const mdatHeader = new Uint8Array(8);
  const mdatView = new DataView(mdatHeader.buffer);
  mdatView.setUint32(0, newMdatPayload.length + 8, false);
  mdatHeader[4] = 0x6d; mdatHeader[5] = 0x64; mdatHeader[6] = 0x61; mdatHeader[7] = 0x74;

  const finalResult = new Uint8Array(headerPart.length + 8 + newMdatPayload.length);
  finalResult.set(headerPart, 0);
  finalResult.set(mdatHeader, headerPart.length);
  finalResult.set(newMdatPayload, headerPart.length + 8);

  return finalResult;
}

/**
 * Patch video lengkap: Injeksi Dolby Vision Profile 8.4 Bitstream RPU + Wanxzyy Spec (Multi-Track Preserved)
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
