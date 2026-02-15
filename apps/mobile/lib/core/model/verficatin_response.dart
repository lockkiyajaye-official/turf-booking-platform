
class VerifyOtpResponse {
  final bool success;
  final String message;
  final String? token;
  final String? errorCode;
  final String? user;

  VerifyOtpResponse({
    required this.success,
    required this.message,
    this.token,
    this.errorCode,
    this.user,
  });

  factory VerifyOtpResponse.fromJson(Map<String, dynamic> json) {
    return VerifyOtpResponse(
      success: json['success'] == true,
      message: json['message'] ?? '',
      token: json['token'],
      errorCode: json['errorCode'],
      user: json['user'] ,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'token': token,
      'errorCode': errorCode,
      'user': user,
    };
  }
}
