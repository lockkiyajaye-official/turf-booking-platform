import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile/core/constants/app_constants.dart';

class UploadcareUploadResult {
  final String uuid;
  final String cdnUrl;
  final String originalFilename;

  UploadcareUploadResult({
    required this.uuid,
    required this.cdnUrl,
    required this.originalFilename,
  });

  @override
  String toString() => 'UploadcareUploadResult(uuid: $uuid, cdnUrl: $cdnUrl)';
}

class UploadcareService {
  static const String _uploadUrl =
      'https://upload.uploadcare.com/base/?jsonerrors=1';

  String get _publicKey => AppConstants.uploadcarePublicKey;
  String get _cdnBaseUrl => AppConstants.uploadcareCdnUrl;

  /// Ensures legacy or misconfigured CDN URLs (e.g. ucarecdn.com) point to the
  /// project's active CDN host (e.g. *.ucarecd.net).
  static String normalizeCdnUrl(String url) {
    final trimmed = url.trim();
    if (trimmed.isEmpty) return trimmed;
    const legacyHttps = 'https://ucarecdn.com';
    const legacyHttp = 'http://ucarecdn.com';
    final targetCdn = AppConstants.uploadcareCdnUrl;

    if (trimmed.startsWith(legacyHttps)) {
      return trimmed.replaceFirst(legacyHttps, targetCdn);
    }
    if (trimmed.startsWith(legacyHttp)) {
      return trimmed.replaceFirst(legacyHttp, targetCdn);
    }
    return trimmed;
  }

  static MediaType _resolveMediaType(String fileName) {
    final ext = fileName.contains('.')
        ? fileName.split('.').last.toLowerCase()
        : 'jpg';
    switch (ext) {
      case 'png':
        return MediaType('image', 'png');
      case 'webp':
        return MediaType('image', 'webp');
      case 'gif':
        return MediaType('image', 'gif');
      case 'svg':
        return MediaType('image', 'svg+xml');
      case 'heic':
        return MediaType('image', 'heic');
      case 'heif':
        return MediaType('image', 'heif');
      case 'jpeg':
      case 'jpg':
      default:
        return MediaType('image', 'jpeg');
    }
  }

  static String _ensureFileName(String fileName) {
    var name = fileName.trim();
    // Strip any leading directories (important for iOS and Android temporary paths)
    if (name.contains('/')) {
      name = name.split('/').last;
    }
    if (name.contains('\\')) {
      name = name.split('\\').last;
    }
    if (name.isEmpty) {
      name = 'image_${DateTime.now().millisecondsSinceEpoch}.jpg';
    }
    if (!name.contains('.')) {
      name = '$name.jpg';
    }
    return name;
  }

  /// Upload an [XFile] (from ImagePicker) to Uploadcare and return the result with CDN URL.
  Future<UploadcareUploadResult> uploadXFile(
    XFile file, {
    bool store = true,
  }) async {
    final bytes = await file.readAsBytes();
    if (bytes.isEmpty) {
      throw Exception('Selected image file is empty (0 bytes).');
    }
    String name = file.name.trim();
    if (name.isEmpty && file.path.isNotEmpty) {
      name = file.path.split('/').last.split('\\').last;
    }
    if (name.isEmpty) {
      name = 'image_${DateTime.now().millisecondsSinceEpoch}.jpg';
    }
    return uploadBytes(bytes, fileName: name, store: store);
  }

  /// Upload a local [File] to Uploadcare and return the result with CDN URL.
  Future<UploadcareUploadResult> uploadFile(
    File file, {
    String? customFileName,
    bool store = true,
  }) async {
    if (!await file.exists()) {
      throw Exception('Selected file does not exist on device: ${file.path}');
    }
    final bytes = await file.readAsBytes();
    if (bytes.isEmpty) {
      throw Exception('Selected file is empty (0 bytes): ${file.path}');
    }
    final fileName = customFileName ??
        (file.uri.pathSegments.isNotEmpty
            ? file.uri.pathSegments.last
            : file.path.split('/').last.split('\\').last);
    return uploadBytes(bytes, fileName: fileName, store: store);
  }

  /// Upload raw bytes with a specified filename to Uploadcare.
  Future<UploadcareUploadResult> uploadBytes(
    Uint8List bytes, {
    required String fileName,
    bool store = true,
  }) async {
    if (bytes.isEmpty) {
      throw Exception('Cannot upload empty byte buffer.');
    }

    final safeFileName = _ensureFileName(fileName);
    final mediaType = _resolveMediaType(safeFileName);

    final uri = Uri.parse(_uploadUrl);
    final request = http.MultipartRequest('POST', uri);

    request.fields['UPLOADCARE_PUB_KEY'] = _publicKey;
    request.fields['UPLOADCARE_STORE'] = store ? '1' : '0';

    request.files.add(
      http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: safeFileName,
        contentType: mediaType,
      ),
    );

    final client = http.Client();
    try {
      final streamedResponse = await client.send(request).timeout(
        const Duration(seconds: 60),
        onTimeout: () => throw TimeoutException(
          'Image upload timed out after 60 seconds. Please check your internet connection.',
        ),
      );

      final response = await http.Response.fromStream(streamedResponse).timeout(
        const Duration(seconds: 30),
        onTimeout: () => throw TimeoutException(
          'Reading upload response timed out.',
        ),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final Map<String, dynamic> body = jsonDecode(response.body);

        if (body['error'] != null) {
          final err = body['error'];
          final msg = err is Map
              ? (err['content'] ?? err['detail'] ?? err.toString())
              : err.toString();
          throw Exception('Uploadcare returned error: $msg');
        }

        final String? uuid = body['file'] as String? ??
            body[safeFileName] as String? ??
            body[fileName] as String? ??
            body.values.firstWhere(
              (v) => v is String && v.length >= 32,
              orElse: () => null,
            ) as String?;

        if (uuid == null || uuid.isEmpty) {
          throw Exception('Failed to parse Uploadcare file UUID from response: ${response.body}');
        }

        final cdnUrl = '$_cdnBaseUrl/$uuid/';
        return UploadcareUploadResult(
          uuid: uuid,
          cdnUrl: cdnUrl,
          originalFilename: safeFileName,
        );
      } else {
        dynamic errorBody;
        try {
          final decoded = jsonDecode(response.body);
          if (decoded is Map && decoded['error'] != null) {
            final err = decoded['error'];
            errorBody = err is Map
                ? (err['content'] ?? err['detail'] ?? err.toString())
                : err.toString();
          } else {
            errorBody = decoded;
          }
        } catch (_) {
          errorBody = response.body;
        }
        throw Exception('Uploadcare upload failed (${response.statusCode}): $errorBody');
      }
    } finally {
      client.close();
    }
  }

  /// Upload multiple [XFile]s sequentially.
  Future<List<UploadcareUploadResult>> uploadXFiles(
    List<XFile> files, {
    bool store = true,
  }) async {
    final results = <UploadcareUploadResult>[];
    for (final f in files) {
      final res = await uploadXFile(f, store: store);
      results.add(res);
    }
    return results;
  }

  /// Upload multiple [File]s sequentially.
  Future<List<UploadcareUploadResult>> uploadFiles(
    List<File> files, {
    bool store = true,
  }) async {
    final results = <UploadcareUploadResult>[];
    for (final f in files) {
      final res = await uploadFile(f, store: store);
      results.add(res);
    }
    return results;
  }
}
