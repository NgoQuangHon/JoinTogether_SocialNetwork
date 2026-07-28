# JoinTogether_SocialNetwork

Nhớ chạy npm install lại (đã cài thêm cors, helmet) và set JWT_SECRET thật trong .env trước khi deploy.

## Testing

All tests are in the `backend/` directory.

```bash
cd backend

# Install dependencies (first time)
npm install

# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run a specific test file
npx jest --config jest.config.ts tests/integration/auth.test.ts

# Run tests by name pattern
npx jest --config jest.config.ts --testNamePattern="register"
```

**Test structure:**
- `tests/unit/` — Unit tests for utilities and middlewares (AppError, authorization)
- `tests/integration/` — Integration tests using supertest for all API endpoints (auth, profile, activity, connection, chat, review, report, account, role/permission, admin audit log)

Tests mock the database layer (repositories and `pg.Pool`) so no actual database connection is required.