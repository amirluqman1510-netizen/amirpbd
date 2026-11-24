# Panduan: Sambung Global Biome Quest ke Google Sheets

Masa setup: lebih kurang 10 minit. Percuma. Guna akaun Google guru (akaun DELIMa @moe-dl.edu.my atau Gmail biasa).

## 1. Sediakan Google Sheet
1. Buka https://sheets.new dan namakan, contohnya `Rekod Global Biome Quest`.
2. Klik **Extensions → Apps Script**.
3. Padam kod contoh yang ada, kemudian tampal semua kandungan fail `Code.gs`.
4. Klik ikon 💾 **Save**.

## 2. Jalankan setup (sekali sahaja)
1. Pilih fungsi `setup` di dropdown atas, kemudian klik **Run**.
2. Google akan minta kebenaran. Klik **Review permissions**, pilih akaun anda, kemudian **Allow**.
   - Kalau keluar amaran "Google hasn't verified this app", klik **Advanced → Go to (nama projek)**. Ini normal untuk skrip yang anda tulis sendiri.
3. Sheet bernama **Rekod** dengan tajuk lajur akan muncul.

## 3. Deploy sebagai Web App
1. Klik **Deploy → New deployment**.
2. Klik ikon ⚙️ dan pilih **Web app**.
3. Tetapkan:
   - **Execute as:** Me
   - **Who has access:** **Anyone** ← wajib, supaya murid tak perlu log masuk
4. Klik **Deploy** dan salin **Web app URL**. URL ini berakhir dengan `/exec`.
5. Uji dengan membuka URL tu dalam browser. Kalau berjaya, akan keluar `{"ok":true,...}`.

> **Akaun DELIMa:** sesetengah domain sekolah menghadkan pilihan "Anyone" (hanya ada "Anyone within moe-dl.edu.my"). Kalau begitu, guna Gmail peribadi, atau minta murid log masuk akaun DELIMa dulu.

## 4. Masukkan URL dalam game
Buka `global-biome-quest/index.html` dan cari baris ini:
```js
const SHEETS_URL = '';
```
Tampal URL anda:
```js
const SHEETS_URL = 'https://script.google.com/macros/s/AKfy..../exec';
```
Simpan, kemudian deploy semula ke Netlify (drag folder sekali lagi).

## 5. Semak
Main satu pusingan. Selepas skrin keputusan, satu baris baru sepatutnya muncul dalam sheet **Rekod** dalam beberapa saat.

## Cara ia berfungsi
- Setiap rekod disimpan dalam peranti murid **dan** dihantar ke Sheet.
- Kalau tiada internet, rekod ditanda ⏳. Ia akan dihantar secara automatik bila murid buka game semula dengan internet, atau bila guru tekan "Hantar semula" di halaman Rekod.
- Rekod yang sama tak akan masuk dua kali, sebab setiap rekod ada ID unik.

## Bila tukar kod Apps Script
Guna **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. Cara ini kekalkan URL yang sama. Kalau guna "New deployment", URL akan berubah dan perlu ditukar dalam game.

## Had yang perlu tahu
- URL Web App ada dalam kod HTML, jadi sesiapa yang tahu URL tu boleh hantar data palsu. Server ada validasi asas (julat markah, panjang nama dan sebagainya), tapi tak boleh sahkan identiti murid. Untuk kuiz kelas, risiko ni biasanya boleh diterima.
- Kuota Apps Script akaun percuma cukup untuk penggunaan sekolah (beribu-ribu request sehari).
