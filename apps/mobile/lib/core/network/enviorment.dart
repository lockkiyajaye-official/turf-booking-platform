
import 'package:mobile/core/network/app_enviorment.dart';

class Environment {
  static const String _env = String.fromEnvironment('ENV', defaultValue: 'dev');

  static AppEnvironment get current {
    switch (_env) {
      case 'prod':
        return AppEnvironment.prod;
      case 'stage':
        return AppEnvironment.stage;
      case 'test':
        return AppEnvironment.test;
      default:
        return AppEnvironment.dev;
    }
  }

  static bool get isProd => current == AppEnvironment.prod;
  static bool get isStage => current == AppEnvironment.stage;
  static bool get isTest => current == AppEnvironment.test;
  static bool get isDev => current == AppEnvironment.dev;
}
