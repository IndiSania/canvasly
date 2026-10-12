# Canvasly — Digital Art Studio

Canvasly adalah aplikasi studio menggambar digital berbasis React JS yang berjalan langsung di browser. Proyek ini dirancang sebagai referensi portofolio PPLG dengan antarmuka gelap, panel properti, pemilih warna, dan kanvas gambar.

## Fitur

- Menggambar bebas dengan pointer atau mouse.
- Brush dan eraser dengan pengaturan ukuran serta opacity.
- Tool ellipse, palet warna, dan custom color picker.
- Undo/redo (tombol maupun Ctrl+Z / Ctrl+Y).
- Impor gambar untuk diedit di kanvas.
- Ekspor karya sebagai PNG.
- Simpan proyek dalam format `.canvasly` (JSON yang berisi gambar dan metadata).
- Pengaturan zoom, toggle grid, dan panel layer sederhana.
- Desain responsif untuk desktop dan layar kecil.

## Persyaratan

- Node.js versi 18 atau lebih baru.
- npm (biasanya ikut terpasang dengan Node.js).

## Cara menjalankan di Windows

1. Ekstrak ZIP ke folder pilihan, misalnya `C:\xampp\htdocs\canvasly`.
2. Buka folder `canvasly` di Visual Studio Code.
3. Buka terminal di VS Code.
4. Jalankan:

   ```bash
   npm install
   npm run dev
   ```

5. Buka alamat lokal yang ditampilkan oleh Vite di terminal, biasanya `http://localhost:5173`.

Untuk membuat build produksi:

```bash
npm run build
npm run preview
```

Hasil build akan berada di folder `dist`.

## Catatan teknis

- Canvasly menggunakan React, Vite, dan Lucide React.
- Tidak membutuhkan XAMPP, PHP, atau database untuk dijalankan.
- Data gambar dibuat dan diproses di browser. Tombol **Save project** mengunduh file proyek; fitur ini bukan penyimpanan cloud.
- Panel Layers pada versi referensi ini merupakan UI/struktur layer sederhana; coretan saat ini berada pada satu kanvas raster, sehingga layer belum terpisah secara independen.
- Google Fonts memerlukan koneksi internet untuk memuat font pilihan; aplikasi tetap memiliki font fallback.

## Struktur folder

```text
canvasly/
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

## Lisensi

Proyek pembelajaran dan portofolio. Silakan kembangkan sesuai kebutuhan.
