# Turf Booking Application

A comprehensive football turf booking platform with support for three user types: Admin, User, and Turf Owner.

## Features

### For Users

-   Browse and search turfs
-   View turf details (pricing, amenities, availability)
-   Book turfs with real-time availability
-   Manage bookings (view, cancel)
-   User onboarding process

### For Turf Owners

-   List multiple turfs with detailed information
-   Set pricing, time slots, and amenities
-   Manage turf listings
-   Business onboarding process

### For Admins

-   Full system access
-   Manage all users and turfs

### Additional Pages

-   Beautiful landing page
-   About page
-   Contact page
-   FAQ page

## Tech Stack

### Backend

-   NestJS
-   TypeORM with SQLite
-   JWT Authentication
-   Passport.js
-   Class Validator

### Frontend

-   React 19
-   TypeScript
-   React Router
-   Tailwind CSS
-   Axios
-   Lucide React Icons

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd apps/backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run start:dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd apps/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Mobile Setup (Flutter)

1. Navigate to the mobile directory:

```bash
cd apps/mobile
```

2. When testing on a **physical Android device via USB debugging**, forward the backend port:

```bash
adb reverse tcp:3100 tcp:3100
```

3. Run the Flutter app:

```bash
flutter pub get
flutter run
```

*(See [apps/mobile/README.md](apps/mobile/README.md) for detailed device & emulator instructions)*

## Environment Variables

### Backend

Create a `.env` file in `apps/backend/`:

```
JWT_SECRET=your-secret-key-here
PORT=3000
```

### Frontend

Create a `.env` file in `apps/frontend/`:

```
VITE_API_URL=http://localhost:3000
```

## Database

The application uses SQLite by default. The database file (`turf-booking.db`) will be created automatically in the backend directory when you first run the application.

For production, you can switch to PostgreSQL or MySQL by updating the TypeORM configuration in `apps/backend/src/app.module.ts`.

## User Roles

### Admin

-   Full system access
-   Can manage all users and turfs

### User

-   Can browse and book turfs
-   Must complete onboarding (phone, date of birth, address)

### Turf Owner

-   Can list and manage turfs
-   Must complete business onboarding (business name, address, phone, etc.)

## API Endpoints

### Authentication

-   `POST /auth/register` - Register new user
-   `POST /auth/login` - Login user
-   `POST /auth/onboarding/user` - Complete user onboarding
-   `POST /auth/onboarding/turf-owner` - Complete turf owner onboarding
-   `GET /auth/me` - Get current user profile

### Turfs

-   `GET /turfs` - Get all turfs (with optional filters)
-   `GET /turfs/:id` - Get turf details
-   `POST /turfs` - Create new turf (Turf Owner only)
-   `PATCH /turfs/:id` - Update turf
-   `DELETE /turfs/:id` - Delete turf
-   `GET /turfs/my-turfs` - Get owner's turfs
-   `GET /turfs/availability/:id` - Check turf availability

### Bookings

-   `GET /bookings` - Get user's bookings
-   `POST /bookings` - Create new booking
-   `GET /bookings/:id` - Get booking details
-   `PATCH /bookings/:id/status` - Update booking status
-   `PATCH /bookings/:id/cancel` - Cancel booking

## Project Structure

```
turf-booking/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── bookings/       # Booking module
│   │   │   ├── turfs/          # Turf module
│   │   │   ├── entities/       # Database entities
│   │   │   └── main.ts         # Application entry point
│   │   └── package.json
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── context/        # React context (Auth)
│   │   │   ├── pages/          # Page components
│   │   │   ├── services/       # API services
│   │   │   └── App.tsx         # Main app component
│   │   └── package.json
│   └── mobile/                # Flutter mobile application
└── README.md
```

## Development

### Backend

-   Run in development mode: `npm run start:dev`
-   Build: `npm run build`
-   Start production: `npm run start:prod`

### Frontend

-   Run in development mode: `npm run dev`
-   Build: `npm run build`
-   Preview production build: `npm run preview`

## License

This project is private and proprietary.
