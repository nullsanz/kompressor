/**
 * WANXZYY / REIN CONTAINER REFINERY (BROWSER & WORKER NATIVE)
 *
 * Menggunakan official Wanxzyy / Rein MP4 Container Refinery:
 * - Menormalisasi MP4 box structure (ftyp brand isom/iso2/hvc1/mp41, mvhd, tkhd, mdhd, hvc1 stsd)
 * - Rekalkulasi presisi tabel chunk offsets (stco / co64)
 * - Mempertahankan 100% video bitstream mdat (mdatByteIdentical: true)
 * - Mencegah desync time-to-sample, durasi 00:00, atau decode freeze pada WhatsApp, TikTok, PC
 */

import './wanxzyyPatcher.js';

const DVVC_32_BOX = new Uint8Array([
  0x00, 0x00, 0x00, 0x20, // 32 bytes
  0x64, 0x76, 0x76, 0x43, // 'dvvC'
  0x01, 0x00, 0x10, 0x25, 0x00, // Profile 8.4 HLG, rpu_present_flag=0 (was 0x40, bikin HP nerapin static RPU color curve salah)
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00
]);

function find4CC(u8, fourCC, from = 0, to = u8.length) {
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

function insertDvvCBoxProperlyBrowser(inputBytes) {
  const u8 = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);

  const moovPos = find4CC(u8, 'moov');
  const mdatPos = find4CC(u8, 'mdat');
  if (moovPos === -1 || mdatPos === -1) return u8;
  const moovStart = moovPos - 4;
  const moovEnd = moovStart + view.getUint32(moovStart, false);

  let trakPos = find4CC(u8, 'trak', moovPos, moovEnd);
  let vTrakPos = -1;
  while (trakPos !== -1 && trakPos < moovEnd) {
    const trakEnd = (trakPos - 4) + view.getUint32(trakPos - 4, false);
    const hdlrPos = find4CC(u8, 'hdlr', trakPos, trakEnd);
    if (hdlrPos !== -1 && hdlrPos < trakEnd) {
      const handler = String.fromCharCode(u8[hdlrPos + 12], u8[hdlrPos + 13], u8[hdlrPos + 14], u8[hdlrPos + 15]);
      if (handler === 'vide') {
        vTrakPos = trakPos;
        break;
      }
    }
    trakPos = find4CC(u8, 'trak', trakPos + 4, moovEnd);
  }
  if (vTrakPos === -1) return u8;

  const hvc1Pos = find4CC(u8, 'hvc1', vTrakPos, moovEnd);
  if (hvc1Pos === -1) return u8;

  const hvcCPos = find4CC(u8, 'hvcC', hvc1Pos, moovEnd);
  if (hvcCPos === -1) return u8;
  const hvcCSize = view.getUint32(hvcCPos - 4, false);
  const insertPos = (hvcCPos - 4) + hvcCSize;

  const dvvCPos = find4CC(u8, 'dvvC', hvc1Pos, hvc1Pos + view.getUint32(hvc1Pos - 4, false));
  if (dvvCPos !== -1) return u8;

  const delta = DVVC_32_BOX.length;
  const newBuf = new Uint8Array(u8.length + delta);
  newBuf.set(u8.subarray(0, insertPos), 0);
  newBuf.set(DVVC_32_BOX, insertPos);
  newBuf.set(u8.subarray(insertPos), insertPos + delta);

  const nView = new DataView(newBuf.buffer, newBuf.byteOffset, newBuf.byteLength);

  const mdiaPos = find4CC(u8, 'mdia', vTrakPos, moovEnd);
  const minfPos = find4CC(u8, 'minf', mdiaPos, moovEnd);
  const stblPos = find4CC(u8, 'stbl', minfPos, moovEnd);
  const stsdPos = find4CC(u8, 'stsd', stblPos, moovEnd);

  const parentPositions = [
    moovStart,
    vTrakPos - 4,
    mdiaPos - 4,
    minfPos - 4,
    stblPos - 4,
    stsdPos - 4,
    hvc1Pos - 4
  ];

  for (const pos of parentPositions) {
    if (pos >= 0 && pos < newBuf.length - 4) {
      const oldSz = nView.getUint32(pos, false);
      nView.setUint32(pos, oldSz + delta, false);
    }
  }

  if (insertPos < mdatPos) {
    let curTrakPos = find4CC(newBuf, 'trak', moovStart, moovStart + nView.getUint32(moovStart, false));
    const newMoovEnd = moovStart + nView.getUint32(moovStart, false);

    while (curTrakPos !== -1 && curTrakPos < newMoovEnd) {
      const tEnd = (curTrakPos - 4) + nView.getUint32(curTrakPos - 4, false);
      const stcoPos = find4CC(newBuf, 'stco', curTrakPos, tEnd);
      if (stcoPos !== -1 && stcoPos < tEnd) {
        const count = nView.getUint32(stcoPos + 8, false);
        for (let i = 0; i < count; i++) {
          const oldOff = nView.getUint32(stcoPos + 12 + i * 4, false);
          nView.setUint32(stcoPos + 12 + i * 4, oldOff + delta, false);
        }
      }
      const co64Pos = find4CC(newBuf, 'co64', curTrakPos, tEnd);
      if (co64Pos !== -1 && co64Pos < tEnd) {
        const count = nView.getUint32(co64Pos + 8, false);
        for (let i = 0; i < count; i++) {
          const oldOff = nView.getBigUint64(co64Pos + 12 + i * 8, false);
          nView.setBigUint64(co64Pos + 12 + i * 8, oldOff + BigInt(delta), false);
        }
      }
      curTrakPos = find4CC(newBuf, 'trak', curTrakPos + 4, newMoovEnd);
    }
  }

  return newBuf;
}

/**
 * Menormalisasi durasi container MP4 (mvhd & tkhd) ke durasi track riil terpanjang.
 * Mencegah bug Wanxzyy Patcher yang menulis mvhd version 1 dengan durasi
 * 0xFFFFFFFFFFFFFFFF (512 juta jam), yang menyebabkan Windows Explorer menampilkan
 * Length abnormal (512409557:36:10) dan gagal me-render thumbnail video.
 */
export function normalizeContainerDurationBrowser(inputBytes) {
  const u8 = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);

  const moovPos = find4CC(u8, 'moov');
  if (moovPos === -1) return u8;
  const moovStart = moovPos - 4;
  const moovSize = view.getUint32(moovStart, false);
  const moovEnd = moovStart + moovSize;

  const mvhdPos = find4CC(u8, 'mvhd', moovStart, moovEnd);
  if (mvhdPos === -1 || mvhdPos > moovEnd) return u8;
  const mvhdStart = mvhdPos - 4;
  const mvhdVer = u8[mvhdStart + 8];
  const mvhdTimescale = mvhdVer === 1 ? view.getUint32(mvhdStart + 28, false) : view.getUint32(mvhdStart + 20, false);
  const mvhdDurOffset = mvhdVer === 1 ? mvhdStart + 32 : mvhdStart + 24;

  let maxTrackDuration = 0;
  let curTrakPos = find4CC(u8, 'trak', moovStart, moovEnd);

  while (curTrakPos !== -1 && curTrakPos < moovEnd) {
    const trakStart = curTrakPos - 4;
    const trakSize = view.getUint32(trakStart, false);
    const trakEnd = trakStart + trakSize;

    let trakDuration = 0;
    const tkhdPos = find4CC(u8, 'tkhd', trakStart, trakEnd);
    let tkhdVer = 0;
    let tkhdDurOffset = 0;

    if (tkhdPos !== -1 && tkhdPos < trakEnd) {
      const tkhdStart = tkhdPos - 4;
      tkhdVer = u8[tkhdStart + 8];
      tkhdDurOffset = tkhdVer === 1 ? tkhdStart + 36 : tkhdStart + 28;
      if (tkhdVer === 1) {
        const durHi = view.getUint32(tkhdStart + 36, false);
        if (durHi !== 0xFFFFFFFF && durHi < 0x10000) {
          trakDuration = Number(view.getBigUint64(tkhdStart + 36, false));
        }
      } else {
        const dur = view.getUint32(tkhdStart + 28, false);
        if (dur !== 0xFFFFFFFF && dur < 0x7FFFFFFF) {
          trakDuration = dur;
        }
      }
    }

    // Check mdhd (mdia -> mdhd)
    const mdhdPos = find4CC(u8, 'mdhd', trakStart, trakEnd);
    if (mdhdPos !== -1 && mdhdPos < trakEnd) {
      const mdhdStart = mdhdPos - 4;
      const mdhdVer = u8[mdhdStart + 8];
      const mdTimescale = mdhdVer === 1 ? view.getUint32(mdhdStart + 28, false) : view.getUint32(mdhdStart + 20, false);
      let mdDur = 0;
      if (mdhdVer === 1) {
        const durHi = view.getUint32(mdhdStart + 32, false);
        if (durHi !== 0xFFFFFFFF && durHi < 0x10000) {
          mdDur = Number(view.getBigUint64(mdhdStart + 32, false));
        }
      } else {
        const dur = view.getUint32(mdhdStart + 24, false);
        if (dur !== 0xFFFFFFFF && dur < 0x7FFFFFFF) {
          mdDur = dur;
        }
      }
      if (mdTimescale > 0 && mdDur > 0) {
        const converted = Math.round((mdDur / mdTimescale) * mvhdTimescale);
        if (converted > trakDuration) {
          trakDuration = converted;
        }
      }
    }

    if (tkhdDurOffset > 0 && trakDuration > 0) {
      if (tkhdVer === 1) {
        const curTkhdDur = view.getBigUint64(tkhdDurOffset, false);
        if (curTkhdDur > BigInt(mvhdTimescale * 86400 * 100) || curTkhdDur === 0n) {
          view.setBigUint64(tkhdDurOffset, BigInt(trakDuration), false);
        }
      } else {
        const curTkhdDur = view.getUint32(tkhdDurOffset, false);
        if (curTkhdDur > mvhdTimescale * 86400 * 100 || curTkhdDur === 0) {
          view.setUint32(tkhdDurOffset, trakDuration, false);
        }
      }
    }

    if (trakDuration > maxTrackDuration) {
      maxTrackDuration = trakDuration;
    }

    curTrakPos = find4CC(u8, 'trak', curTrakPos + 4, moovEnd);
  }

  let needsFix = false;
  if (mvhdVer === 1) {
    const curDurHi = view.getUint32(mvhdDurOffset, false);
    if (curDurHi === 0xFFFFFFFF) needsFix = true;
    const curDur = view.getBigUint64(mvhdDurOffset, false);
    if (curDur > BigInt(mvhdTimescale * 86400 * 100) || (curDur === 0n && maxTrackDuration > 0)) {
      needsFix = true;
    }
  } else {
    const curDur = view.getUint32(mvhdDurOffset, false);
    if (curDur === 0xFFFFFFFF || curDur > mvhdTimescale * 86400 * 100 || (curDur === 0 && maxTrackDuration > 0)) {
      needsFix = true;
    }
  }

  if (needsFix && maxTrackDuration > 0) {
    console.log(`[CONTAINER-REFINERY] Normalizing abnormal mvhd duration to ${maxTrackDuration} (timescale: ${mvhdTimescale}, ${(maxTrackDuration / mvhdTimescale).toFixed(2)}s)`);
    if (mvhdVer === 1) {
      view.setBigUint64(mvhdDurOffset, BigInt(maxTrackDuration), false);
    } else {
      view.setUint32(mvhdDurOffset, maxTrackDuration, false);
    }
  }

  return u8;
}

export function patchVideoDolbyVision(inputBytes) {
  let preparedBytes = inputBytes;
  try {
    preparedBytes = insertDvvCBoxProperlyBrowser(inputBytes);
    console.log('[WANXZYY-PATCHER] dvvC Dolby Vision Profile 8.4 atom injected successfully (+32 bytes)');
  } catch (err) {
    console.warn('[WANXZYY-PATCHER] Gagal menyisipkan dvvC:', err.message);
  }

  const patcher = globalThis.WanxzyyMp4Patcher || globalThis.ReinMp4Patcher;
  let finalBytes = preparedBytes;

  if (patcher && patcher.patchWithReport) {
    try {
      const report = patcher.patchWithReport(preparedBytes);
      if (report && report.bytes && report.bytes.length > 0) {
        console.log('[WANXZYY-PATCHER] Patch report:', report.report);
        finalBytes = report.bytes;
      }
    } catch (err) {
      console.warn('[WANXZYY-PATCHER] Patch failed:', err.message);
    }
  } else {
    console.warn('[WANXZYY-PATCHER] Patcher engine not available');
  }

  // Normalisasi durasi container mvhd & tkhd agar terbebas dari bug 512 juta jam dan thumbnail Explorer muncul
  try {
    finalBytes = normalizeContainerDurationBrowser(finalBytes);
  } catch (err) {
    console.warn('[CONTAINER-REFINERY] Gagal menormalisasi durasi mvhd:', err.message);
  }

  return finalBytes;
}

export const injectDolbyVisionBitstreamAndContainer = patchVideoDolbyVision;

export default {
  patchVideoDolbyVision,
  injectDolbyVisionBitstreamAndContainer,
  normalizeContainerDurationBrowser
};
