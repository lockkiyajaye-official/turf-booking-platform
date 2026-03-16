import 'package:mobile/core/storage/local_storage.dart';

class TokenReader {
  final LocalStorageService storage;

  TokenReader({required this.storage});

  String? get token => storage.getToken();
}
