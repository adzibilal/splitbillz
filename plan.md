# 📑 Splitbillz MVP Product Plan (Next.js + Supabase + n8n)

## 📌 Project Overview
**Splitbillz** adalah aplikasi web "no-auth" untuk pembagian tagihan (split bill) secara praktis.
- **Objective:** Menghilangkan friction registrasi bagi pengguna saat makan bersama.
- **Frontend:** Next.js (App Router)
- **Backend/DB:** Supabase (PostgreSQL, Storage, & Realtime)
- **OCR Engine:** n8n Workflow (External Webhook)
- **Auth Strategy:** Supabase Anonymous Auth (Persistent session tanpa email/password).

---

## 🎭 Actor & Detailed Flow

### 1. Bill Host (The Organizer)
1. **Initiation:** User membuka app, otomatis mendapatkan *Anonymous Session*.
2. **Upload:** Host mengunggah foto struk ke Supabase Storage.
3. **OCR Trigger:** App mengirim URL foto ke **n8n Webhook**.
4. **Verification (Status: `PENDING_OCR`):** - Menunggu n8n selesai melakukan `INSERT` data item ke database.
   - Host mengedit nama item, harga, atau menambah pajak/service charge.
5. **Sharing (Status: `OPEN`):**
   - Host men-generate shareable link.
   - Host memilih item miliknya sendiri (*Self-assign*).
6. **Review (Status: `REVIEW`):**
   - Host mengunci bill agar Contributor tidak bisa mengubah pilihan lagi.
   - Memasukkan info pembayaran (Nomor Rekening/E-wallet).
7. **Settlement (Status: `FINALIZED`):**
   - Bill terkunci total. Host memantau konfirmasi bayar dari teman-temannya.

### 2. Contributor (The Guest)
1. **Join:** Klik link dari Host, otomatis mendapatkan *Anonymous Session*.
2. **Identification:** Input nama panggilan (disimpan sebagai alias di session).
3. **Selection (Status: `OPEN`):**
   - Memilih item yang dimakan. 
   - Jika item dibagi (e.g. 1 Pizza berdua), sistem menghitung pembagian harga otomatis.
4. **Wait (Status: `REVIEW`):** Melihat ringkasan sementara sambil menunggu Host melakukan validasi.
5. **Payment (Status: `FINALIZED`):**
   - Melihat total final + pajak.
   - Melihat instruksi transfer Host.
   - Klik "I have Paid" untuk notifikasi ke Host.

---

## 🛠 Technical Specifications

### Database Schema (Supabase)
```sql
-- Bills Table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id UUID REFERENCES auth.users,
  status VARCHAR DEFAULT 'PENDING_OCR', -- PENDING_OCR, OPEN, REVIEW, FINALIZED
  payment_info JSONB, -- { "bank": "BCA", "account": "123456", "name": "Adzi" }
  tax_service_rate NUMERIC DEFAULT 0, -- Combined tax & service percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items Table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
  name TEXT,
  price NUMERIC,
  qty INT DEFAULT 1
);

-- Assignments Table
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  user_name TEXT -- Alias nama contributor
);
```

n8n Logic
Endpoint: POST /webhook/splitbillz-ocr

Payload: { "bill_id": "UUID", "image_url": "STRING" }

Action: n8n melakukan OCR -> Parsing JSON via AI/Function -> Direct Insert ke tabel items menggunakan Supabase Node.

🔒 Security & RLS (Row Level Security)
Bills: SELECT diizinkan jika user memiliki Link ID. UPDATE hanya jika auth.uid() == host_id.

Items: SELECT diizinkan untuk semua partisipan bill. INSERT diizinkan untuk Host & n8n.

Assignments: INSERT & DELETE hanya diizinkan jika auth.uid() == user_id.

💡 Cursor IDE Reference Notes
Gunakan supabase.auth.signInAnonymously() pada level root layout atau saat pertama kali berinteraksi dengan Bill.

Gunakan Supabase Realtime (.on('postgres_changes', ...) ) pada komponen daftar item agar perubahan dari Contributor lain langsung terlihat.

Pastikan logika kalkulasi harga item yang di-split dilakukan secara konsisten di sisi Client dan Server.