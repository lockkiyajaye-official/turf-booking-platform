import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  late bool _emailBookings;
  late bool _emailPayments;
  late bool _emailPromos;

  @override
  void initState() {
    super.initState();
    final user = _authVm.currentUser;
    _emailBookings = user['emailBookings'] as bool? ?? true;
    _emailPayments = user['emailPayments'] as bool? ?? true;
    _emailPromos = user['emailPromos'] as bool? ?? false;
  }

  Future<void> _updateSetting(String key, bool value) async {
    setState(() {
      if (key == 'emailBookings') _emailBookings = value;
      if (key == 'emailPayments') _emailPayments = value;
      if (key == 'emailPromos') _emailPromos = value;
    });

    await _authVm.updateNotifications({
      'emailBookings': _emailBookings,
      'emailPayments': _emailPayments,
      'emailPromos': _emailPromos,
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: colors.textTitle, size: 20),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Notification Settings',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.all(16.w),
        children: [
          Container(
            decoration: BoxDecoration(
              color: colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE8E8E8)),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  activeColor: colors.primary,
                  title: Text(
                    'Booking Confirmations',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  subtitle: Text(
                    'Receive email notifications when your bookings are confirmed',
                    style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                  ),
                  value: _emailBookings,
                  onChanged: (val) => _updateSetting('emailBookings', val),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  activeColor: colors.primary,
                  title: Text(
                    'Payment Receipts',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  subtitle: Text(
                    'Receive email receipts for completed transactions',
                    style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                  ),
                  value: _emailPayments,
                  onChanged: (val) => _updateSetting('emailPayments', val),
                ),
                const Divider(height: 1),
                SwitchListTile(
                  activeColor: colors.primary,
                  title: Text(
                    'Promotions & Updates',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  subtitle: Text(
                    'Receive promotional offers and turf availability announcements',
                    style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                  ),
                  value: _emailPromos,
                  onChanged: (val) => _updateSetting('emailPromos', val),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
