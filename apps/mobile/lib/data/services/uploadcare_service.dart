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
    if (url.isEmpty) return url;
    const legacy = 'https://ucarecdn.com';
    if (url.startsWith(legacy)) {
      return url.replaceFirst(legacy, AppConstants.uploadcareCdnUrl);
    }
    return url;
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
      case 'jpeg':
      case 'jpg':
      default:
        return MediaType('image', 'jpeg');
    }
  }

  static String _ensureFileName(String fileName) {
    var name = fileName.trim();
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
    final name = file.name.isNotEmpty
        ? file.name
        : 'image_${DateTime.now().millisecondsSinceEpoch}.jpg';
    return uploadBytes(bytes, fileName: name, store: store);
  }

  /// Upload a local [File] to Uploadcare and return the result with CDN URL.
  Future<UploadcareUploadResult> uploadFile(
    File file, {
    String? customFileName,
    bool store = true,
  }) async {
    final bytes = await file.readAsBytes();
    final fileName = customFileName ??
        (file.uri.pathSegments.isNotEmpty
            ? file.uri.pathSegments.last
            : 'image_${DateTime.now().millisecondsSinceEpoch}.jpg');
    return uploadBytes(bytes, fileName: fileName, store: store);
  }

  /// Upload raw bytes with a specified filename to Uploadcare.
  Future<UploadcareUploadResult> uploadBytes(
    Uint8List bytes, {
    required String fileName,
    bool store = true,
  }) async {
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

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final Map<String, dynamic> body = jsonDecode(response.body);
      final String? uuid = body['file'] as String? ??
          body[safeFileName] as String? ??
          body[fileName] as String? ??
          body.values.firstWhere(
            (v) => v is String && v.length >= 32,
            orElse: () => null,
          ) as String?;

      if (uuid == null || uuid.isEmpty) {
        throw Exception('Failed to parse Uploadcare file UUID from response');
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
        errorBody = jsonDecode(response.body);
      } catch (_) {
        errorBody = response.body;
      }
      throw Exception('Uploadcare upload failed: $errorBody');
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
