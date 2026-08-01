class DashboardStatsModel {
  final double totalRevenue;
  final int totalBookings;
  final int activeTurfs;
  final int pendingBookings;
  final double walletBalance;

  DashboardStatsModel({
    required this.totalRevenue,
    required this.totalBookings,
    required this.activeTurfs,
    required this.pendingBookings,
    required this.walletBalance,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    return DashboardStatsModel(
      totalRevenue: json['totalRevenue'] != null ? double.tryParse(json['totalRevenue'].toString()) ?? 0.0 : 0.0,
      totalBookings: json['totalBookings'] ?? 0,
      activeTurfs: json['activeTurfs'] ?? 0,
      pendingBookings: json['pendingBookings'] ?? 0,
      walletBalance: json['walletBalance'] != null ? double.tryParse(json['walletBalance'].toString()) ?? 0.0 : 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalRevenue': totalRevenue,
      'totalBookings': totalBookings,
      'activeTurfs': activeTurfs,
      'pendingBookings': pendingBookings,
      'walletBalance': walletBalance,
    };
  }
}
