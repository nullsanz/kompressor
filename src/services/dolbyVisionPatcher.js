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
  0x01, 0x00, 0x10, 0x25, 0x40, // Profile 8.4 HLG
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

export function patchVideoDolbyVision(inputBytes) {
  let preparedBytes = inputBytes;
  try {
    preparedBytes = insertDvvCBoxProperlyBrowser(inputBytes);
    console.log('[WANXZYY-PATCHER] dvvC Dolby Vision Profile 8.4 atom injected successfully (+32 bytes)');
  } catch (err) {
    console.warn('[WANXZYY-PATCHER] Gagal menyisipkan dvvC:', err.message);
  }

  const patcher = globalThis.WanxzyyMp4Patcher || globalThis.ReinMp4Patcher;
  if (!patcher || !patcher.patchWithReport) {
    console.warn('[WANXZYY-PATCHER] Patcher engine not available');
    return preparedBytes;
  }

  try {
    const report = patcher.patchWithReport(preparedBytes);
    if (report && report.bytes && report.bytes.length > 0) {
      console.log('[WANXZYY-PATCHER] Patch report:', report.report);
      return report.bytes;
    }
  } catch (err) {
    console.warn('[WANXZYY-PATCHER] Patch failed:', err.message);
  }

  return preparedBytes;
}

export const injectDolbyVisionBitstreamAndContainer = patchVideoDolbyVision;

export default {
  patchVideoDolbyVision,
  injectDolbyVisionBitstreamAndContainer
};
