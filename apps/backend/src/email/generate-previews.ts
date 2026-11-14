import * as fs from 'fs';
import * as path from 'path';
import {
  renderOtpEmail,
  renderContactNotificationEmail,
  renderAdminResponseEmail,
  renderBookingConfirmationEmail,
} from './email-templates';

const outputDir = path.resolve(__dirname, '../../email-previews');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load logo as base64 for standalone HTML rendering
const logoPath = path.resolve(__dirname, '../../public/logo.png');
const logoUrl = fs.existsSync(logoPath)
  ? `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`
  : undefined;

// 1. OTP Email
const otpPreview = renderOtpEmail({
  otp: '849201',
  recipientEmail: 'athlete@example.com',
  expiresInMinutes: 10,
  frontendUrl: 'https://lockkiyajaye.com',
  logoUrl,
});
fs.writeFileSync(path.join(outputDir, 'preview-otp.html'), otpPreview.html);

// 2. Contact Notification Email (Admin)
const contactPreview = renderContactNotificationEmail({
  name: 'Rahul Sharma',
  email: 'rahul.sharma@gmail.com',
  subject: 'Corporate Tournament Inquiry for November',
  message:
    'Hi team, we are planning a 16-team corporate football tournament across 2 weekends in November. We would like to inquire about full-day slot block-outs, referee support, and special pricing packages for our company.',
  frontendUrl: 'https://lockkiyajaye.com',
  submittedAt: new Date(),
  logoUrl,
});
fs.writeFileSync(
  path.join(outputDir, 'preview-contact-notification.html'),
  contactPreview.html,
);

// 3. Admin Response Email (Customer)
const adminResponsePreview = renderAdminResponseEmail({
  customerName: 'Rahul Sharma',
  customerEmail: 'rahul.sharma@gmail.com',
  subject: 'Corporate Tournament Inquiry for November',
  adminResponse:
    'Hello Rahul,\n\nThank you for reaching out! We would love to host your corporate tournament. We have full weekend tournament slots with floodlight packages, FIFA-standard synthetic turf, and dedicated referee coordination.\n\nOur events coordinator will call you at your registered phone number today with our special corporate rates brochure.',
  respondedBy: 'Faiz (Operations Lead)',
  frontendUrl: 'https://lockkiyajaye.com',
  respondedAt: new Date(),
  logoUrl,
});
fs.writeFileSync(
  path.join(outputDir, 'preview-admin-response.html'),
  adminResponsePreview.html,
);

// 4. Booking Confirmation Email
const bookingPreview = renderBookingConfirmationEmail({
  bookingId: 'bk_98f412a883e2',
  customerName: 'Arjun Verma',
  turfName: 'All-Stars Turf Arena (Pitch 1)',
  turfLocation: 'Koramangala 4th Block, Naharlagun',
  bookingDate: 'Saturday, 12 Sept 2026',
  startTime: '19:00',
  endTime: '21:00',
  durationHours: 2,
  totalPrice: 2400,
  frontendUrl: 'https://lockkiyajaye.com',
  logoUrl,
});
fs.writeFileSync(
  path.join(outputDir, 'preview-booking-confirmation.html'),
  bookingPreview.html,
);

console.log('Email preview HTML files generated successfully in:', outputDir);
