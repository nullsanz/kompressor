/**
 * DOLBY VISION PROFILE 8.4 (HLG) & CONTAINER INJECTOR (BROWSER & WORKER NATIVE)
 *
 * Menginjeksikan atom Dolby Vision `dvvC` (Profile 8.4 BL+RPU HLG Compatible)
 * dan Apple QuickTime brand (`qt  `) ke dalam container MP4.
 *
 * Bekerja 100% native di browser via Uint8Array & DataView tanpa dependency eksternal.
 * Menjadikan video TikTok JJ & Instagram Story memicu hardware EDR / Dolby Vision
 * Peak Brightness (Layar HP Penonton Otomatis SILAU & Cerah Maksimal di iPhone & AMOLED).
 */

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
 * Injeksi DOVIDecoderConfigurationRecord (dvvC) ke dalam visual sample entry hvc1/hev1/avc1
 *
 * @param {Uint8Array|ArrayBuffer} inputBytes
 * @returns {Uint8Array}
 */
export function injectDolbyVisionProfile8(inputBytes) {
  const dvvC = new Uint8Array([
    0x00, 0x00, 0x00, 0x18, // size: 24 bytes
    0x64, 0x76, 0x76, 0x43, // 4CC: 'dvvC'
    0x01,                   // dv_version_major: 1
    0x00,                   // dv_version_minor: 0
    0x10, 0x25,             // profile 8, level 4, rpu=1, el=0, bl=1
    0x40,                   // bl_signal_compatibility_id: 4 (HLG), reserved: 0
    0x00, 0x00, 0x00, 0x00, // reserved
    0x00, 0x00, 0x00, 0x00, // reserved
    0x00, 0x00, 0x00        // reserved
  ]);

  let buf = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  let view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // 1. Patch ftyp to major_brand 'qt  ' (Apple QuickTime)
  const ftypIdx = find4CC(buf, 'ftyp');
  if (ftypIdx !== -1 && ftypIdx <= 8) {
    buf[ftypIdx + 4] = 0x71; // 'q'
    buf[ftypIdx + 5] = 0x74; // 't'
    buf[ftypIdx + 6] = 0x20; // ' '
    buf[ftypIdx + 7] = 0x20; // ' '
    view.setUint32(ftypIdx + 8, 512, false);
    if (buf.length >= ftypIdx + 16) {
      buf[ftypIdx + 12] = 0x71;
      buf[ftypIdx + 13] = 0x74;
      buf[ftypIdx + 14] = 0x20;
      buf[ftypIdx + 15] = 0x20;
    }
  }

  // 2. Cari sample entry hvc1 atau hev1 atau avc1
  let visualIdx = find4CC(buf, 'hvc1');
  if (visualIdx === -1) visualIdx = find4CC(buf, 'hev1');
  if (visualIdx === -1) visualIdx = find4CC(buf, 'avc1');
  if (visualIdx === -1) {
    console.warn('[DOVI-PATCHER] Visual sample entry (hvc1/hev1/avc1) tidak ditemukan.');
    return buf;
  }

  // 3. Cari sub-box konfigurasi hvcC atau avcC
  let confIdx = find4CC(buf, 'hvcC', visualIdx);
  if (confIdx === -1) confIdx = find4CC(buf, 'avcC', visualIdx);
  if (confIdx === -1) {
    console.warn('[DOVI-PATCHER] hvcC/avcC box tidak ditemukan di dalam sample entry.');
    return buf;
  }

  const confSize = view.getUint32(confIdx - 4, false);
  const insertPos = (confIdx - 4) + confSize;

  // Cek apakah atom dvvC sudah ada
  if (find4CC(buf, 'dvvC', visualIdx) !== -1) {
    console.log('[DOVI-PATCHER] dvvC box sudah ada sebelumnya.');
    return buf;
  }

  // 4. Sisipkan box dvvC tepat setelah hvcC / avcC
  const delta = dvvC.length; // 24 bytes
  let patched = new Uint8Array(buf.length + delta);
  patched.set(buf.subarray(0, insertPos), 0);
  patched.set(dvvC, insertPos);
  patched.set(buf.subarray(insertPos), insertPos + delta);

  let pView = new DataView(patched.buffer, patched.byteOffset, patched.byteLength);

  // 5. Update ukuran box induk (ancestors)
  function updateParentSize(name) {
    let pos = find4CC(patched, name);
    while (pos !== -1 && pos < insertPos) {
      const boxStart = pos - 4;
      if (boxStart >= 0) {
        const curSize = pView.getUint32(boxStart, false);
        if (boxStart + curSize >= insertPos) {
          pView.setUint32(boxStart, curSize + delta, false);
        }
      }
      pos = find4CC(patched, name, pos + 4);
    }
  }

  ['hvc1', 'hev1', 'avc1', 'stsd', 'stbl', 'minf', 'mdia', 'trak', 'moov'].forEach(updateParentSize);

  // 6. Rekalkulasi offset tabel chunk stco (32-bit) dan co64 (64-bit)
  const moovIdx = find4CC(patched, 'moov');
  const mdatIdx = find4CC(patched, 'mdat');
  if (moovIdx !== -1 && mdatIdx !== -1 && moovIdx < mdatIdx) {
    let stcoPos = find4CC(patched, 'stco');
    while (stcoPos !== -1) {
      const entryCount = pView.getUint32(stcoPos + 8, false);
      let tablePos = stcoPos + 12;
      for (let i = 0; i < entryCount; i++) {
        const oldOffset = pView.getUint32(tablePos, false);
        if (oldOffset >= insertPos) {
          pView.setUint32(tablePos, oldOffset + delta, false);
        }
        tablePos += 4;
      }
      stcoPos = find4CC(patched, 'stco', tablePos);
    }

    let co64Pos = find4CC(patched, 'co64');
    while (co64Pos !== -1) {
      const entryCount = pView.getUint32(co64Pos + 8, false);
      let tablePos = co64Pos + 12;
      for (let i = 0; i < entryCount; i++) {
        const oldOffset = pView.getBigUint64(tablePos, false);
        if (oldOffset >= BigInt(insertPos)) {
          pView.setBigUint64(tablePos, oldOffset + BigInt(delta), false);
        }
        tablePos += 8;
      }
      co64Pos = find4CC(patched, 'co64', tablePos);
    }
  }

  return patched;
}

/**
 * Patch video lengkap: Injeksi Dolby Vision Profile 8.4 + Wanxzyy Uploader Refinery
 *
 * @param {Uint8Array|ArrayBuffer} inputBytes
 * @returns {Promise<Uint8Array>}
 */
export async function patchVideoDolbyVision(inputBytes) {
  // Step 1: Injeksi Dolby Vision Profile 8.4
  let patched = injectDolbyVisionProfile8(inputBytes);

  // Step 2: Muat Wanxzyy / Rein patcher
  try {
    if (!globalThis.WanxzyyMp4Patcher && !globalThis.ReinMp4Patcher) {
      await import('./mp4DolbyVisionPatcher.js');
    }
    const patcher = globalThis.WanxzyyMp4Patcher || globalThis.ReinMp4Patcher;
    if (patcher && typeof patcher.patchContainer === 'function') {
      const refineryRes = patcher.patchContainer(patched);
      if (refineryRes && refineryRes.length > 0) {
        patched = new Uint8Array(refineryRes);
        // Pastikan brand tetap 'qt  ' untuk playback Apple HDR
        const ftypIdx = find4CC(patched, 'ftyp');
        if (ftypIdx !== -1 && ftypIdx <= 8) {
          patched[ftypIdx + 4] = 0x71;
          patched[ftypIdx + 5] = 0x74;
          patched[ftypIdx + 6] = 0x20;
          patched[ftypIdx + 7] = 0x20;
          new DataView(patched.buffer, patched.byteOffset, patched.byteLength).setUint32(ftypIdx + 8, 512, false);
        }
      }
    }
  } catch (err) {
    console.warn('[DOVI-PATCHER] Wanxzyy secondary refinery pass skipped:', err.message);
  }

  return patched;
}

export default {
  injectDolbyVisionProfile8,
  patchVideoDolbyVision
};
