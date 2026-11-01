# DECISIONS.md

## Ringkasan Struktur src/
- `main.tsx`: Entry point, mount App.
- `App.tsx`: Router setup, shell utama.
- `components/`: Komponen UI (button, input, dll).
- `pages/`: Halaman aplikasi.
- `data/`: Mock data (akan diganti sistem API).
- `lib/`: Utilities (Supabase, client API).
- `types/`: TypeScript interfaces.

## Keputusan Ambigu
- `VITE_DEMO_MODE`: Pakai `true` jika Supabase env kosong, `false` default.
- Impor aset: Pindahkan semua aset dari `figma:asset/` ke `public/` atau `src/assets/`.
