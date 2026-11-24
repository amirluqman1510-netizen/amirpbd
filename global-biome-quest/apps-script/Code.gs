/**
 * GLOBAL BIOME QUEST — Penerima rekod ke Google Sheets
 * Tampal kod ini dalam Extensions > Apps Script pada Google Sheet guru.
 * Panduan penuh: PANDUAN.md
 */

const SHEET_NAME = 'Rekod';
const TIMEZONE = 'Asia/Kuala_Lumpur';
const HEADERS = [
  'ID', 'Tarikh & Masa', 'Nama', 'Kelas', 'Markah', 'Betul', 'Jumlah Soalan',
  'Peratus', 'Masa Menjawab (saat)', 'Masa Menjawab (mm:ss)',
  'P1 Ekspedisi Flora', 'P2 Peta Iklim', 'P3 Jejak Fauna', 'P4 Cabaran KBAT',
  'Diterima Pada'
];

/** Jalankan SEKALI secara manual (butang Run) untuk sediakan sheet & beri kebenaran. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(TIMEZONE);
  getSheet_();
  Logger.log('Sedia. Sekarang Deploy > New deployment > Web app.');
}

/** Ujian ringkas: buka URL /exec dalam browser. */
function doGet() {
  return json_({ ok: true, app: 'Global Biome Quest', message: 'Penerima rekod aktif.' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const err = validate_(d);
    if (err) return json_({ ok: false, error: err });

    const sh = getSheet_();
    const last = sh.getLastRow();
    if (last > 1) {
      const dup = sh.getRange(2, 1, last - 1, 1)
        .createTextFinder(String(d.id)).matchEntireCell(true).findNext();
      if (dup) return json_({ ok: true, duplicate: true });
    }

    const st = Array.isArray(d.stages) ? d.stages : [];
    sh.appendRow([
      safe_(d.id),
      new Date(Number(d.date)),
      safe_(d.name),
      safe_(d.cls),
      Number(d.score),
      Number(d.correct),
      Number(d.total),
      Number(d.pct) / 100,
      Number(d.duration),
      mmss_(Number(d.duration)),
      num_(st[0]), num_(st[1]), num_(st[2]), num_(st[3]),
      new Date()
    ]);
    return json_({ ok: true });
  } catch (ex) {
    return json_({ ok: false, error: String(ex) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ---------- helper ---------- */
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f3e6c4');
    sh.setFrozenRows(1);
    sh.getRange('A:A').setNumberFormat('@');            // ID sebagai teks
    sh.getRange('B:B').setNumberFormat('dd/mm/yyyy hh:mm');
    sh.getRange('H:H').setNumberFormat('0%');
    sh.getRange('O:O').setNumberFormat('dd/mm/yyyy hh:mm:ss');
  }
  return sh;
}

function validate_(d) {
  if (!d || typeof d !== 'object') return 'Data tidak sah';
  if (!d.id || String(d.id).length > 40) return 'ID tidak sah';
  if (!d.name || String(d.name).length > 60) return 'Nama tidak sah';
  if (!d.cls || String(d.cls).length > 30) return 'Kelas tidak sah';
  const total = Number(d.total), correct = Number(d.correct), score = Number(d.score);
  if (!(total > 0 && total <= 50)) return 'Jumlah soalan tidak sah';
  if (!(correct >= 0 && correct <= total)) return 'Bilangan betul tidak sah';
  if (!(score >= 0 && score <= 100)) return 'Markah tidak sah';
  if (!(Number(d.duration) >= 0 && Number(d.duration) < 86400)) return 'Masa tidak sah';
  if (isNaN(new Date(Number(d.date)).getTime())) return 'Tarikh tidak sah';
  return '';
}

/** Elak formula injection: teks bermula = + - @ dijadikan teks biasa. */
function safe_(v) {
  const s = String(v == null ? '' : v).trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function num_(v) { const n = Number(v); return isNaN(n) ? '' : n; }
function mmss_(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  return ('0' + Math.floor(sec / 60)).slice(-2) + ':' + ('0' + (sec % 60)).slice(-2);
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
