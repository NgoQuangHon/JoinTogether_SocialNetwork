# JoinTogether_SocialNetwork

## 1. Yêu cầu

- [Node.js](https://nodejs.org/) >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

## 2. Clone & cài đặt

```bash
git clone https://github.com/DinhTrongPhuc/JoinTogether_SocialNetwork.git
cd JoinTogether_SocialNetwork

# Backend
cd backend
npm install

# Frontend
cd ../frontend/JoinTogether-app
npm install
```

## 3. Chạy database (Docker)

```bash
cd backend
docker compose up -d
```

Lần đầu Docker sẽ tự chạy file `src/config/file.sql` để tạo các bảng.

## 4. Chạy backend

```bash
cd backend
npm run dev
```

Backend chạy tại `http://localhost:5000`.

## 5. Chạy frontend

Mở terminal riêng:

```bash
cd frontend/JoinTogether-app
npm run dev
```

Frontend chạy tại `http://localhost:5173`.

## 6. Migration (khi có cập nhật database)

Mỗi lần có file SQL mới trong `backend/src/config/migration_*.sql`, chạy:

```bash
Get-Content backend/src/config/migration_ten_file.sql | docker exec -i community_postgres psql -U postgres -d community_db
```

## Testing

```bash
cd backend
npm test          # chạy tất cả test
npm run test:watch
```

**Cấu trúc test:**
- `tests/unit/` — Unit tests
- `tests/integration/` — Integration tests (mock database, không cần Docker)