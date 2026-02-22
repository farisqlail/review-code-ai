# AI Code Review Assistant

Proyek fullstack sederhana untuk melakukan review kode otomatis menggunakan Groq API (model `llama-3.3-70b-versatile`) dengan frontend React + Vite dan backend Express.js sebagai proxy yang aman.

## Struktur Project

```bash
project-root/
  backend/
    server.js          # Express server & endpoint /api/review (SSE)
    groqService.js     # Integrasi Groq SDK & system prompt
    .env               # GROQ_API_KEY
    package.json
  frontend/
    src/
      components/
        CodeEditor.jsx
        ReviewResult.jsx
        LanguageSelector.jsx
      App.jsx
      main.jsx
    index.html
    package.json
    vite.config.js
  README.md
```

## Prasyarat

- Node.js LTS dan npm terinstall
- Koneksi internet
- API key Groq yang valid

---

## Setup Backend (Express + Groq SDK)

Masuk ke folder backend:

```bash
cd backend
```

Install dependensi (sudah dilakukan jika menggunakan repo ini apa adanya, jalankan jika perlu):

```bash
npm install
```

Isi file `.env` dengan API key Groq Anda:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Jalankan server backend:

```bash
npm start
```

Backend akan berjalan di:

```text
http://localhost:5000
```

Endpoint utama:

- `POST /api/review`  
  Body JSON:

  ```json
  {
    "code": "string berisi kode",
    "language": "JavaScript"
  }
  ```

  Response berupa stream SSE (`text/event-stream`) yang berisi token-token teks review secara bertahap.

Backend:

- Menggunakan `groq-sdk` dengan model `llama-3.3-70b-versatile`
- `max_tokens: 4096`
- `temperature: 0.3`
- `stream: true`
- Menggunakan `dotenv` dan `cors`
- API key Groq hanya ada di backend dan tidak pernah dikirim ke frontend

---

## Setup Frontend (React + Vite + Tailwind CSS)

Masuk ke folder frontend:

```bash
cd frontend
```

Install dependensi:

```bash
npm install
```

Dependensi utama:

- React + Vite
- Tailwind CSS
- `react-markdown` untuk render hasil review dalam format Markdown

Jalankan dev server:

```bash
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:5173
```

Pastikan backend (`npm start` di folder `backend`) juga berjalan agar tombol "Review Code" berfungsi.

---

## Cara Pakai Aplikasi

1. Jalankan backend:

   ```bash
   cd backend
   npm start
   ```

2. Jalankan frontend:

   ```bash
   cd frontend
   npm run dev
   ```

3. Buka browser ke `http://localhost:5173`.

4. Pilih bahasa pemrograman di dropdown:

   - JavaScript
   - TypeScript
   - Python
   - Java
   - Go
   - PHP
   - dan beberapa bahasa lain

5. Paste kode Anda di textarea besar.

6. Klik tombol **"Review Code"**.

7. Hasil review akan tampil bertahap (streaming) di sisi kanan, dengan section:

   - 🐛 Bugs & Errors  
   - ⚡ Performance Issues  
   - 🔒 Security Vulnerabilities  
   - 📝 Code Quality & Best Practices  
   - ✅ Improved Code Example  

8. Untuk menyalin contoh perbaikan kode, klik tombol **Copy** di section **✅ Improved Code Example**.

---

## Detail Teknis Penting

- **Keamanan API Key**
  - `GROQ_API_KEY` hanya disimpan di `.env` pada folder backend.
  - Frontend hanya memanggil endpoint `http://localhost:5000/api/review`.
  - API key tidak pernah terekspos ke browser.

- **Streaming dengan SSE**
  - Backend mengembalikan response dengan header `Content-Type: text/event-stream`.
  - Response berupa event `data: { "token": "..." }` yang dikirim bertahap.
  - Frontend membaca stream menggunakan `ReadableStream` dari `fetch` dan menggabungkan token menjadi teks Markdown.

- **Render Markdown**
  - Komponen `ReviewResult` menggunakan `react-markdown` untuk merender teks review.
  - Markdown dipecah menjadi beberapa section berdasarkan judul:
    - 🐛 Bugs & Errors
    - ⚡ Performance Issues
    - 🔒 Security Vulnerabilities
    - 📝 Code Quality & Best Practices
    - ✅ Improved Code Example

- **Tailwind CSS**
  - Menggunakan Tailwind 4 dengan import di `src/index.css`:

    ```css
    @import "tailwindcss";
    ```

  - Komponen menggunakan utility class Tailwind untuk layout, warna, dan tipografi.

---

## Scripts Penting

### Backend

```bash
cd backend
npm start   # Menjalankan server Express di port 5000
```

### Frontend

```bash
cd frontend
npm run dev     # Menjalankan Vite dev server di port 5173
npm run build   # Build produksi
npm run preview # Preview build produksi
```

---

## Catatan Tambahan

- Jika terjadi error koneksi atau review tidak muncul:
  - Pastikan backend dan frontend sama-sama berjalan.
  - Pastikan nilai `GROQ_API_KEY` di `.env` benar.
  - Cek console browser dan terminal backend untuk pesan error.

- Anda bebas menyesuaikan styling, menambah bahasa pemrograman, atau menambah fitur lain seperti:
  - Simpan riwayat review.
  - Upload file kode.
  - Pengaturan tingkat kedalaman review.

