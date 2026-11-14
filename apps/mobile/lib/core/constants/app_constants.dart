import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static String get baseUrl {
    final envUrl = dotenv.env['API_URL'];
    if (envUrl != null && envUrl.isNotEmpty) {
      return envUrl;
    }
    if (!kIsWeb && Platform.isAndroid) {
      return 'http://10.0.2.2:3100';
    }
    return 'http://127.0.0.1:3100';
  }

  static String get googleServerClientId =>
      (dotenv.env['GOOGLE_SERVER_CLIENT_ID'] ?? '')
          .trim()
          .replaceAll('"', '')
          .replaceAll("'", '');

  static String get uploadcarePublicKey {
    final raw = dotenv.env['UPLOADCARE_PUBLIC_KEY'];
    if (raw == null || raw.trim().isEmpty) {
      return 'a9831bda75d2449665e9';
    }
    return raw.trim().replaceAll('"', '').replaceAll("'", '');
  }

  static String get uploadcareCdnUrl {
    final raw = dotenv.env['UPLOADCARE_CDN_URL'];
    if (raw != null && raw.trim().isNotEmpty) {
      final sanitized =
          raw.trim().replaceAll('"', '').replaceAll("'", '');
      return sanitized.endsWith('/')
          ? sanitized.substring(0, sanitized.length - 1)
          : sanitized;
    }
    return 'https://4i7gf3hyhr.ucarecd.net';
  }
}

                                