# Backend Setup Guide

## PostgreSQL Integration

The backend now uses PostgreSQL instead of SQLite. Follow these steps to set up:

### 1. Install PostgreSQL

Make sure PostgreSQL is installed and running on your system.

### 2. Create Database

```sql
CREATE DATABASE turf_booking;
```

### 3. Install Dependencies

```bash
npm install
```

This will install `pg` (PostgreSQL driver) and other required dependencies.

### 4. Environment Configuration

Create a `.env` file in `apps/backend/` with the following:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=turf_booking

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 5. Run Migrations

The application uses TypeORM's `synchronize` option in development, which will automatically create/update tables. In production, set `NODE_ENV=production` and use migrations.

### 6. Seed Database

After starting the server, you can seed the database with dummy data:

```bash
# Make a POST request to /seeding (requires admin authentication)
# Or use the admin account created by seeding:
# Email: admin@turfbooking.com
# Password: admin123
```

## Authentication System

### User Types

1. **Admin**: Uses email/password authentication
   - Login: `POST /auth/admin/login`
   - Can manage all users and approve turf owners

2. **Normal Users**: Uses mobile OTP (primary) or email OTP
   - Request OTP: `POST /auth/otp/phone/request` or `POST /auth/otp/email/request`
   - Register: `POST /auth/register/phone` or `POST /auth/register/email`
   - Login: `POST /auth/login/phone` or `POST /auth/login/email`

3. **Turf Owners**: Uses mobile OTP (primary) or email OTP
   - Same endpoints as normal users
   - Must be approved by admin before publishing turfs
   - Approval: `POST /users/turf-owners/:id/approve` (admin only)

### OTP System

- **Development**: OTPs are logged to console, not actually sent
- **Production**: Set `NODE_ENV=production` and configure SMS/Email services
  - For SMS: Configure Twilio credentials in `.env`
  - For Email: Configure email service credentials in `.env`

## Turf Management

### Draft/Published System

- New turfs are created as **drafts** by default
- Turf owners can view their drafts via `GET /turfs/my-turfs`
- To publish: `POST /turfs/:id/publish` (requires admin approval)
- To unpublish: `POST /turfs/:id/unpublish`

### Approval Workflow

1. Turf owner signs up → Account created but `isApproved = false`
2. Turf owner can create turfs, but they remain as drafts
3. Admin approves turf owner → `POST /users/turf-owners/:id/approve`
4. Approved turf owner can publish turfs

## API Endpoints

### Authentication
- `POST /auth/otp/phone/request` - Request phone OTP
- `POST /auth/otp/email/request` - Request email OTP
- `POST /auth/register/phone` - Register with phone OTP
- `POST /auth/register/email` - Register with email OTP
- `POST /auth/login/phone` - Login with phone OTP
- `POST /auth/login/email` - Login with email OTP
- `POST /auth/admin/login` - Admin login (email/password)

### Users (Admin only)
- `GET /users` - Get all users
- `GET /users/statistics` - Get user statistics
- `GET /users/turf-owners` - Get all turf owners
- `POST /users/turf-owners/:id/approve` - Approve turf owner
- `POST /users/turf-owners/:id/reject` - Reject turf owner

### Dashboard (Turf Owner only)
- `GET /dashboard/statistics` - Get dashboard statistics
- `GET /dashboard/bookings` - Get bookings with filters

### Turfs
- `GET /turfs` - Get all published turfs (includes drafts for authenticated owners)
- `GET /turfs/my-turfs` - Get owner's turfs (drafts included)
- `POST /turfs/:id/publish` - Publish a turf
- `POST /turfs/:id/unpublish` - Unpublish a turf

### Seeding
- `POST /seeding` - Seed database with dummy data (Admin only)

## Seeded Data

After running the seeding endpoint, you'll have:

- **1 Admin**: admin@turfbooking.com / admin123
- **5 Normal Users**: user1@example.com to user5@example.com
- **4 Turf Owners**: 
  - 2 approved (can publish turfs)
  - 2 pending (need admin approval)
- **Multiple Turfs**: Mix of published and draft turfs
- **10 Bookings**: Various statuses and dates

## Development Notes

- OTPs are logged to console in development mode
- Database schema is auto-synced in development (`synchronize: true`)
- In production, disable `synchronize` and use migrations
- All turf owners need admin approval before publishing turfs
