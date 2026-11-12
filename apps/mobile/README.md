# Lock Kiya Jaye - Mobile App (Flutter)

Flutter mobile application for the Turf Booking Platform.

---

## Getting Started

### Prerequisites

- Flutter SDK (version 3.x or higher)
- Android SDK & Platform Tools (`adb`)
- Android Studio / VS Code with Flutter extensions
- Physical Android phone or Android Emulator

---

## Environment Configuration

Create or update `.env` in `apps/mobile/.env`:

```env
# Point to local backend (port 3100)
API_URL=http://127.0.0.1:3100

# Or point to production backend
# API_URL=https://api.lockkiyajaye.com

# Google Sign-In Client ID
GOOGLE_SERVER_CLIENT_ID=your-google-server-client-id

# Razorpay Key
RAZORPAY="your-razorpay-key"

# Uploadcare Key
UPLOADCARE_PUBLIC_KEY="your-uploadcare-key"
```

---

## Testing on Physical Android Device (USB Debugging)

When running the backend on your host computer (Mac/PC) and testing on an actual physical Android phone connected via USB:

### 1. Enable USB Debugging on your phone
- Go to **Settings** > **About Phone** and tap **Build Number** 7 times to enable Developer Options.
- In **Developer Options**, turn on **USB Debugging**.
- Connect your phone to your Mac via USB and accept the debugging prompt on the phone screen.

### 2. Reverse Port Forwarding (`adb reverse`)
> [!IMPORTANT]
> On a physical phone, `127.0.0.1` refers to the **phone itself**, not your Mac. To route requests from `http://127.0.0.1:3100` over the USB cable to your Mac backend, you **must** run:
>
> ```bash
> adb reverse tcp:3100 tcp:3100
> ```

Verify the port forward is active:
```bash
adb reverse --list
# Output should show: UsbFfs tcp:3100 tcp:3100
```

> [!NOTE]
> Whenever you **disconnect and reconnect the USB cable**, or **reboot the phone**, active reverse port forwards are cleared by Android. Re-run `adb reverse tcp:3100 tcp:3100` before resuming tests.

### 3. Run the App
Ensure your backend is running on port 3100, then start the Flutter app:

```bash
cd apps/mobile
flutter pub get
flutter run
```

---

## Testing on Android Emulator

If you are using the official Android Studio emulator instead of a physical phone:
- The Android emulator uses `10.0.2.2` as the special alias to reach the host computer's loopback interface (`127.0.0.1`).
- You can either:
  - Run `adb reverse tcp:3100 tcp:3100` (works on emulator as well), or
  - Set `API_URL=http://10.0.2.2:3100` in `apps/mobile/.env`

---

## Troubleshooting

### Connection Refused / Cannot reach backend
1. Check if backend is running on port 3100:
   ```bash
   curl http://127.0.0.1:3100
   ```
2. Verify ADB detects your phone:
   ```bash
   adb devices
   ```
3. Re-apply the port forward:
   ```bash
   adb reverse tcp:3100 tcp:3100
   ```
4. Verify from the phone shell:
   ```bash
   adb shell '(printf "GET / HTTP/1.1\r\nHost: 127.0.0.1:3100\r\nConnection: close\r\n\r\n"; sleep 1) | toybox nc 127.0.0.1 3100'
   ```
   Should output `HTTP/1.1 200 OK Hello World!`.
