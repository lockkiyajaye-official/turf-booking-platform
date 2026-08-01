class UserModel {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final String? phone;
  final String role;
  final bool? isApproved;
  final String onboardingStatus;
  
  // Turf owner specific
  final String? businessName;
  final String? businessAddress;
  final double? walletBalance;
  
  // User specific
  final String? profileImage;

  UserModel({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.phone,
    required this.role,
    this.isApproved,
    required this.onboardingStatus,
    this.businessName,
    this.businessAddress,
    this.walletBalance,
    this.profileImage,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'USER',
      isApproved: json['isApproved'],
      onboardingStatus: json['onboardingStatus'] ?? 'PENDING',
      businessName: json['businessName'],
      businessAddress: json['businessAddress'],
      walletBalance: json['walletBalance'] != null 
          ? double.tryParse(json['walletBalance'].toString()) 
          : null,
      profileImage: json['profileImage'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'phone': phone,
      'role': role,
      'isApproved': isApproved,
      'onboardingStatus': onboardingStatus,
      'businessName': businessName,
      'businessAddress': businessAddress,
      'walletBalance': walletBalance,
      'profileImage': profileImage,
    };
  }
}
