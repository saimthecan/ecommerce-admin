# E-Commerce Admin Panel

Tam kapsamlı e-ticaret yönetim paneli. React + FastAPI + PostgreSQL (Neon).

## Özellikler

- 🔐 **Kimlik Doğrulama**: JWT tabanlı auth, rol bazlı erişim (admin/kullanıcı)
- 📦 **Ürün Yönetimi**: CRUD, kategoriler, varyantlar (renk/beden), görsel upload
- 🛒 **Sipariş Yönetimi**: Oluşturma, durum güncelleme, timeline geçmişi
- 💳 **Ödeme Entegrasyonu**: Stripe PaymentIntent, webhook, iade
- 📊 **Envanter**: Stok hareketleri, düşük stok uyarıları
- 📈 **Raporlar**: Satış trendi, en çok satan ürünler, tarih filtresi
- 🏠 **Adres Yönetimi**: Kullanıcı adresleri CRUD

## Teknoloji Stack

| Backend | Frontend |
|---------|----------|
| FastAPI | React + TypeScript |
| SQLAlchemy (async) | Redux Toolkit |
| PostgreSQL (Neon) | Vite |
| Alembic | TailwindCSS |
| Stripe API | React Router |

## Kurulum

### Gereksinimler
- Python 3.11+
- Node.js 20+
- PostgreSQL (veya Neon hesabı)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: source venv\Scripts\activate
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
python -m uvicorn app.main:app --reload

# .env dosyası oluştur
cp .env.example .env
# .env dosyasını düzenle

# Database migration
python -m alembic upgrade head

# İlk admin kullanıcısını oluştur
python -m app.db.init_db

# Sunucuyu başlat
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
SECRET_KEY=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Docker

```bash
# Production build
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| `/api/v1/auth/*` | Login, register, me |
| `/api/v1/products/*` | Ürün CRUD |
| `/api/v1/orders/*` | Sipariş yönetimi |
| `/api/v1/payments/*` | Stripe entegrasyonu |
| `/api/v1/inventory/*` | Stok hareketleri |
| `/api/v1/stats/*` | Raporlar |
| `/api/v1/addresses/*` | Adres yönetimi |

## Test

```bash
cd backend
python -m pytest tests/ -v
```

## Varsayılan Kullanıcı
- Email: `admin@example.com`
- Password: `admin123`

## Lisans
MIT