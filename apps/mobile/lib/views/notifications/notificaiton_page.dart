import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/data/services/notification_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

const _red = Color(0xFFE43434);
const _green = Color(0xFF2E7D32);
const _lightRed = Color(0xFFFFF0F0);
const _lightGreen = Color(0xFFE8F5E9);
const _lightAmber = Color(0xFFFFF8E1);
const _lightBlue = Color(0xFFE3F2FD);

class NotificationPageItem {
  final String id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime createdAt;

  const NotificationPageItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationPageItem.fromJson(Map<String, dynamic> json) {
    return NotificationPageItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Notification',
      message: json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'system',
      isRead: json['isRead'] as bool? ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  final NotificationService _notificationService = NotificationService();
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  bool _isLoading = true;
  List<NotificationPageItem> _notifications = [];

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    setState(() => _isLoading = true);
    final result = await _notificationService.getNotifications(_authVm.token.value);
    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true && result['data'] is List) {
          _notifications = (result['data'] as List)
              .map((json) => NotificationPageItem.fromJson(json))
              .toList();
        }
      });
    }
  }

  Future<void> _markAllAsRead() async {
    final res = await _notificationService.markAllAsRead(_authVm.token.value);
    if (res['success'] == true) {
      _fetchNotifications();
    }
  }

  Future<void> _markAsRead(String id) async {
    final res = await _notificationService.markAsRead(_authVm.token.value, id);
    if (res['success'] == true) {
      _fetchNotifications();
    }
  }

  int get _unreadCount => _notifications.where((n) => !n.isRead).length;

  Widget _buildIcon(String type) {
    switch (type.toLowerCase()) {
      case 'booking':
        return Container(
          padding: const EdgeInsets.all(10),
          decoration: const BoxDecoration(color: _lightGreen, shape: BoxShape.circle),
          child: const Icon(Icons.check_circle_outline_rounded, color: _green, size: 22),
        );
      case 'payment':
        return Container(
          padding: const EdgeInsets.all(10),
          decoration: const BoxDecoration(color: _lightAmber, shape: BoxShape.circle),
          child: const Icon(Icons.payment_rounded, color: Color(0xFFF57F17), size: 22),
        );
      case 'promo':
        return Container(
          padding: const EdgeInsets.all(10),
          decoration: const BoxDecoration(color: _lightBlue, shape: BoxShape.circle),
          child: const Icon(Icons.local_offer_outlined, color: Color(0xFF1976D2), size: 22),
        );
      default:
        return Container(
          padding: const EdgeInsets.all(10),
          decoration: const BoxDecoration(color: _lightRed, shape: BoxShape.circle),
          child: const Icon(Icons.notifications_outlined, color: _red, size: 22),
        );
    }
  }

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 60) {
      return '${diff.inMinutes <= 0 ? 1 : diff.inMinutes} mins ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours} hrs ago';
    } else {
      return '${dt.day}/${dt.month}/${dt.year}';
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: const Color(0xFFF9F9FB),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF1C1C1E), size: 20),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Notifications',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1C1C1E),
          ),
        ),
        actions: [
          if (_unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text(
                'Mark all read',
                style: TextStyle(color: _red, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _red))
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey),
                      SizedBox(height: 12.h),
                      Text(
                        'No notifications yet',
                        style: textTheme.titleSmall?.copyWith(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchNotifications,
                  color: _red,
                  child: ListView.separated(
                    padding: EdgeInsets.all(16.w),
                    itemCount: _notifications.length,
                    separatorBuilder: (_, __) => SizedBox(height: 10.h),
                    itemBuilder: (context, index) {
                      final item = _notifications[index];
                      return GestureDetector(
                        onTap: () {
                          if (!item.isRead) {
                            _markAsRead(item.id);
                          }
                        },
                        child: Container(
                          padding: EdgeInsets.all(14.w),
                          decoration: BoxDecoration(
                            color: item.isRead ? Colors.white : const Color(0xFFFFF8F8),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: item.isRead ? const Color(0xFFEEEEEE) : _red.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildIcon(item.type),
                              SizedBox(width: 12.w),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            item.title,
                                            style: textTheme.titleSmall?.copyWith(
                                              fontWeight: item.isRead ? FontWeight.w600 : FontWeight.w800,
                                              color: const Color(0xFF1C1C1E),
                                            ),
                                          ),
                                        ),
                                        Text(
                                          _formatTime(item.createdAt),
                                          style: textTheme.bodySmall?.copyWith(
                                            color: Colors.grey[500],
                                            fontSize: 10.sp,
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(height: 4.h),
                                    Text(
                                      item.message,
                                      style: textTheme.bodySmall?.copyWith(
                                        color: Colors.grey[700],
                                        height: 1.4,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}