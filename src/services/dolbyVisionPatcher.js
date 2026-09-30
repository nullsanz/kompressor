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

export function patchVideoDolbyVision(inputBytes) {
  const patcher = globalThis.WanxzyyMp4Patcher || globalThis.ReinMp4Patcher;
  if (!patcher || !patcher.patchWithReport) {
    console.warn('[WANXZYY-PATCHER] Patcher engine not available');
    return inputBytes;
  }

  try {
    const report = patcher.patchWithReport(inputBytes);
    if (report && report.bytes && report.bytes.length > 0) {
      console.log('[WANXZYY-PATCHER] Patch report:', report.report);
      return report.bytes;
    }
  } catch (err) {
    console.warn('[WANXZYY-PATCHER] Patch failed:', err.message);
  }

  return inputBytes;
}

export const injectDolbyVisionBitstreamAndContainer = patchVideoDolbyVision;

export default {
  patchVideoDolbyVision,
  injectDolbyVisionBitstreamAndContainer
};
