import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';

const _red = Color(0xFFE43434);
const _green = Color(0xFF2E7D32);
const _lightRed = Color(0xFFFFF0F0);
const _lightGreen = Color(0xFFE8F5E9);
const _lightAmber = Color(0xFFFFF8E1);
const _lightBlue = Color(0xFFE3F2FD);
const _lightGray = Color(0xFFF5F5F5);

enum _NotifType { booking, payment, reminder, cancellation, rebook, promo, profile, played }

class NotificationItem {
  final _NotifType type;
  final String title;
  final String description;
  final String time;
  final bool isUnread;

  const NotificationItem({
    required this.type,
    required this.title,
    required this.description,
    required this.time,
    this.isUnread = false,
  });
}

class NotificationPage extends StatefulWidget {
  const NotificationPage({super.key});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  final List<NotificationItem> _today = const [
    NotificationItem(
      type: _NotifType.booking,
      title: 'Booking Confirmed',
      description: 'Your slot at Grandfield Cricket Turf on Dec 20 is confirmed for 07:00–08:00 PM.',
      time: '2 mins ago',
      isUnread: true,
    ),
    NotificationItem(
      type: _NotifType.payment,
      title: 'Payment Successful',
      description: '₹650 paid for Pro Field booking on Dec 24. Receipt saved.',
      time: '15 mins ago',
      isUnread: true,
    ),
    NotificationItem(
      type: _NotifType.reminder,
      title: 'Match Reminder',
      description: 'Your game at Win Field starts in 2 hours. Don\'t be late!',
      time: '1 hour ago',
      isUnread: true,
    ),
    NotificationItem(
      type: _NotifType.cancellation,
      title: 'Booking Cancelled',
      description: 'Your booking at Kick Arena on Dec 14 was cancelled. Refund initiated.',
      time: '3 hours ago',
      isUnread: true,
    ),
  ];

  final List<NotificationItem> _yesterday = const [
    NotificationItem(
      type: _NotifType.rebook,
      title: 'Rebook Your Favourite',
      description: 'You played at Pro Arena last week. Same slot available this Sunday!',
      time: 'Yesterday, 4:30 PM',
    ),
    NotificationItem(
      type: _NotifType.promo,
      title: 'Weekend Offer',
      description: 'Book any turf this weekend and get 15% off. Use code WEEKEND15.',
      time: 'Yesterday, 10:00 AM',
    ),
    NotificationItem(
      type: _NotifType.profile,
      title: 'Profile Incomplete',
      description: 'Add your phone number to speed up future bookings and receive OTP faster.',
      time: 'Yesterday, 8:00 AM',
    ),
  ];

  final List<NotificationItem> _earlier = const [
    NotificationItem(
      type: _NotifType.played,
      title: 'Match Completed',
      description: 'Hope you had a great game at Win Arena! Rate your experience.',
      time: 'Dec 17, 9:00 PM',
    ),
  ];

  int get _unreadCount => _today.where((n) => n.isUnread).length;

  void _markAllRead() {
    // Call your viewmodel's markAllRead method here
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: const Color(0xFFF7F7F7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: GestureDetector(
          onTap: () => Get.back(),
          child: Container(
            margin: EdgeInsets.all(10.w),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: const Icon(Icons.arrow_back_ios_new, size: 14, color: Colors.black87),
          ),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Notifications',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: Colors.black87,
              ),
            ),
            if (_unreadCount > 0) ...[
              SizedBox(width: 8.w),
              Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(color: _red, shape: BoxShape.circle),
                alignment: Alignment.center,
                child: Text(
                  '$_unreadCount',
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ],
        ),
        centerTitle: true,
        actions: [
          GestureDetector(
            onTap: _markAllRead,
            child: Container(
              margin: EdgeInsets.only(right: 16.w),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _lightRed,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text(
                'Mark all read',
                style: TextStyle(color: _red, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(0.5),
          child: Container(height: 0.5, color: Colors.grey.shade100),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.fromLTRB(14.w, 0, 14.w, 24.h),
        children: [
          _SectionLabel(label: 'Today'),
          ..._today.map((n) => _NotifCard(item: n)),
          _SectionLabel(label: 'Yesterday'),
          ..._yesterday.map((n) => _NotifCard(item: n)),
          _SectionLabel(label: 'Earlier'),
          ..._earlier.map((n) => _NotifCard(item: n)),
        ],
      ),
    );
  }
}

/// Section date label
class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(4.w, 16.h, 4.w, 8.h),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Color(0xFFAAAAAA),
          letterSpacing: 0.7,
        ),
      ),
    );
  }
}

/// Individual notification card
class _NotifCard extends StatelessWidget {
  final NotificationItem item;
  const _NotifCard({required this.item});

  _NotifStyle get _style => _styleForType(item.type);

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      margin: EdgeInsets.only(bottom: 8.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: item.isUnread
            ? const BorderRadius.only(
                topRight: Radius.circular(14),
                bottomRight: Radius.circular(14),
                topLeft: Radius.circular(14),
                bottomLeft: Radius.circular(14),
              )
            : BorderRadius.circular(14),
  
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(12.w),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon container
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _style.iconBg,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(_style.icon, color: _style.iconColor, size: 20),
            ),

            SizedBox(width: 12.w),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: item.isUnread ? Colors.black87 : const Color(0xFF555555),
                    ),
                  ),
                  SizedBox(height: 3.h),
                  Text(
                    item.description,
                    style: textTheme.bodySmall?.copyWith(
                      color: Colors.grey.shade600,
                      height: 1.45,
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: 5.h),
                  Text(
                    item.time,
                    style: const TextStyle(fontSize: 10, color: Color(0xFFBBBBBB)),
                  ),
                ],
              ),
            ),

            // Unread dot
            if (item.isUnread) ...[
              SizedBox(width: 8.w),
              Container(
                width: 7,
                height: 7,
                margin: const EdgeInsets.only(top: 2),
                decoration: BoxDecoration(
                  color: _style.accentColor,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _NotifStyle {
  final Color iconBg;
  final Color iconColor;
  final Color accentColor;
  final IconData icon;

  const _NotifStyle({
    required this.iconBg,
    required this.iconColor,
    required this.accentColor,
    required this.icon,
  });
}

_NotifStyle _styleForType(_NotifType type) {
  switch (type) {
    case _NotifType.booking:
      return const _NotifStyle(
        iconBg: _lightGreen, iconColor: _green,
        accentColor: _green, icon: Icons.calendar_month_outlined,
      );
    case _NotifType.payment:
      return const _NotifStyle(
        iconBg: _lightRed, iconColor: _red,
        accentColor: _red, icon: Icons.credit_card_outlined,
      );
    case _NotifType.reminder:
      return const _NotifStyle(
        iconBg: _lightAmber, iconColor: Color(0xFFF59E0B),
        accentColor: _red, icon: Icons.notifications_outlined,
      );
    case _NotifType.cancellation:
      return const _NotifStyle(
        iconBg: _lightRed, iconColor: _red,
        accentColor: _red, icon: Icons.cancel_outlined,
      );
    case _NotifType.rebook:
      return const _NotifStyle(
        iconBg: _lightGreen, iconColor: _green,
        accentColor: _green, icon: Icons.replay_outlined,
      );
    case _NotifType.promo:
      return const _NotifStyle(
        iconBg: _lightRed, iconColor: _red,
        accentColor: _red, icon: Icons.local_offer_outlined,
      );
    case _NotifType.profile:
      return const _NotifStyle(
        iconBg: _lightBlue, iconColor: Color(0xFF1976D2),
        accentColor: Color(0xFF1976D2), icon: Icons.person_outline,
      );
    case _NotifType.played:
      return const _NotifStyle(
        iconBg: _lightGreen, iconColor: _green,
        accentColor: _green, icon: Icons.check_circle_outline,
      );
  }
}