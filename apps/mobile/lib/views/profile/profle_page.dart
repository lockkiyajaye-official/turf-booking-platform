import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/my_turf_page.dart';
import 'package:mobile/views/booking/owner_finances_page.dart';
import 'package:mobile/views/profile/about_page.dart';
import 'package:mobile/views/profile/cancellation_page.dart';
import 'package:mobile/views/profile/edit_profile_page.dart';
import 'package:mobile/views/profile/favorite_venues_page.dart';
import 'package:mobile/views/profile/notification_settings_page.dart';
import 'package:mobile/views/profile/support_page.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  void initState() {
    super.initState();
    final vm = Get.find<AuthViewmodel>();
    final isOwner = vm.currentUser['role']?.toString().toLowerCase() == 'turf_owner';
    if (isOwner) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Get.find<OwnerViewmodel>().fetchFinancesSummary();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final vm = Get.find<AuthViewmodel>();
    final ownerVm = Get.find<OwnerViewmodel>();

    return Scaffold(
      backgroundColor: colors.white,
      appBar: AppBar(
        backgroundColor: colors.white,
        automaticallyImplyLeading: false,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'My Profile',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: colors.textTitle,
          ),
        ),
      ),
      body: Obx(() {
        final currentUser = vm.currentUser;
        final role = currentUser['role']?.toString().toLowerCase() ?? 'user';
        final isOwner = role == 'turf_owner';
        final isApproved = currentUser['isApproved'] == true;
        final businessName = currentUser['businessName'] as String?;
        final businessAddress = currentUser['businessAddress'] as String?;

        final List<_ProfileMenuItem> menuItems = isOwner
            ? [
                _ProfileMenuItem(
                  icon: Icons.person_outline_rounded,
                  label: 'Edit Profile',
                  onTap: () => Get.to(() => const EditProfilePage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.account_balance_wallet_outlined,
                  label: 'Finances & Payouts',
                  onTap: () => Get.to(() => const OwnerFinancesPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.sports_soccer_rounded,
                  label: 'My Turf Listings',
                  onTap: () => Get.to(() => const MyTurfsPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.notifications_outlined,
                  label: 'Notification Settings',
                  onTap: () => Get.to(() => const NotificationSettingsPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.help_outline_rounded,
                  label: 'Help & Support',
                  onTap: () => Get.to(() => const SupportPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.info_outline_rounded,
                  label: 'About App',
                  onTap: () => Get.to(() => const AboutPage()),
                ),
              ]
            : [
                _ProfileMenuItem(
                  icon: Icons.person_outline_rounded,
                  label: 'Edit Profile',
                  onTap: () => Get.to(() => const EditProfilePage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.favorite_border_rounded,
                  label: 'Favorite Venues',
                  onTap: () => Get.to(() => const FavoriteVenuesPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.notifications_outlined,
                  label: 'Notification Settings',
                  onTap: () => Get.to(() => const NotificationSettingsPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.cancel_outlined,
                  label: 'Cancellation & Reschedule',
                  onTap: () => Get.to(() => const CancellationPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.help_outline_rounded,
                  label: 'Help & Support',
                  onTap: () => Get.to(() => const SupportPage()),
                ),
                _ProfileMenuItem(
                  icon: Icons.info_outline_rounded,
                  label: 'About App',
                  onTap: () => Get.to(() => const AboutPage()),
                ),
              ];

        return SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 12.h),
          child: Column(
            children: [
              // ── AVATAR + NAME + ROLE BADGES ──────────────────
              Center(
                child: Column(
                  children: [
                    Container(
                      width: 84.w,
                      height: 84.w,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFFE43434),
                          width: 2.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFE43434).withOpacity(0.15),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: Builder(builder: (_) {
                          final avatarUrl = currentUser['avatarUrl'] as String?;
                          if (avatarUrl != null && avatarUrl.isNotEmpty) {
                            if (avatarUrl.startsWith('data:image')) {
                              try {
                                final base64Data = avatarUrl.split(',').last;
                                final bytes = base64Decode(base64Data);
                                return Image.memory(bytes, fit: BoxFit.cover);
                              } catch (_) {}
                            }
                            return Image.network(
                              avatarUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) =>
                                  _DefaultAvatar(colors: colors),
                            );
                          }
                          return _DefaultAvatar(colors: colors);
                        }),
                      ),
                    ),

                    SizedBox(height: 12.h),

                    // Name
                    Builder(builder: (_) {
                      final first = currentUser['firstName'] as String? ?? '';
                      final last = currentUser['lastName'] as String? ?? '';
                      final name = '${first.trim()} ${last.trim()}'.trim();
                      return Text(
                        name.isEmpty ? 'User' : name,
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: colors.textTitle,
                        ),
                      );
                    }),

                    SizedBox(height: 4.h),

                    // Email
                    Text(
                      currentUser['email'] as String? ?? '',
                      style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                    ),

                    SizedBox(height: 10.h),

                    // Role Badges
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: isOwner
                                ? const Color(0xFF1E293B)
                                : colors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            isOwner ? 'TURF OWNER' : 'PLAYER',
                            style: TextStyle(
                              color: isOwner ? Colors.white : colors.primary,
                              fontSize: 10.sp,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        if (isOwner) ...[
                          SizedBox(width: 8.w),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                            decoration: BoxDecoration(
                              color: isApproved
                                  ? Colors.green.withOpacity(0.12)
                                  : Colors.orange.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isApproved
                                      ? Icons.check_circle_rounded
                                      : Icons.schedule_rounded,
                                  size: 12.sp,
                                  color: isApproved ? Colors.green : Colors.orange,
                                ),
                                SizedBox(width: 4.w),
                                Text(
                                  isApproved ? 'APPROVED' : 'PENDING APPROVAL',
                                  style: TextStyle(
                                    color: isApproved ? Colors.green : Colors.orange,
                                    fontSize: 10.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 20.h),

              // ── OWNER FINANCES CARD ──────────────────────────
              if (isOwner) ...[
                Container(
                  padding: EdgeInsets.all(16.w),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Wallet Balance',
                            style: textTheme.bodySmall?.copyWith(
                              color: colors.textGrey,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          SizedBox(height: 4.h),
                          Obx(
                            () => Text(
                              '₹${ownerVm.walletBalance.value.toStringAsFixed(2)}',
                              style: textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w900,
                                color: colors.textTitle,
                              ),
                            ),
                          ),
                        ],
                      ),
                      ElevatedButton.icon(
                        onPressed: () => Get.to(() => const OwnerFinancesPage()),
                        icon: const Icon(Icons.payments_outlined, size: 16),
                        label: const Text('Finances'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE43434),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
                          textStyle: TextStyle(
                            fontSize: 12.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 16.h),

                if (businessName != null && businessName.isNotEmpty)
                  Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(14.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE8E8E8)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.storefront_rounded,
                                color: colors.primary, size: 18.sp),
                            SizedBox(width: 8.w),
                            Text(
                              businessName,
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colors.textTitle,
                              ),
                            ),
                          ],
                        ),
                        if (businessAddress != null && businessAddress.isNotEmpty) ...[
                          SizedBox(height: 4.h),
                          Text(
                            businessAddress,
                            style: textTheme.bodySmall?.copyWith(
                              color: colors.textGrey,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                SizedBox(height: 16.h),
              ],

              // ── MENU LIST ──────────────────────────────────
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: menuItems.length + 1, // +1 for logout
                separatorBuilder: (context, index) =>
                    const Divider(height: 1, color: Color(0xFFF1F5F9)),
                itemBuilder: (context, index) {
                  // Logout
                  if (index == menuItems.length) {
                    return _MenuTile(
                      icon: Icons.logout_rounded,
                      label: 'Logout',
                      labelColor: colors.error,
                      iconColor: colors.error,
                      onTap: () {
                        Get.dialog(
                          AlertDialog(
                            title: const Text('Logout'),
                            content: const Text(
                              'Are you sure you want to logout?',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Get.back(),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                onPressed: () {
                                  Get.back();
                                  vm.logout();
                                },
                                child: Text(
                                  'Logout',
                                  style: TextStyle(color: colors.error),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  }

                  final item = menuItems[index];
                  return _MenuTile(
                    icon: item.icon,
                    label: item.label,
                    onTap: item.onTap,
                  );
                },
              ),

              SizedBox(height: 32.h),
            ],
          ),
        );
      }),
    );
  }
}

// ── Menu tile widget ──────────────────────────────────────────
class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? labelColor;
  final Color? iconColor;

  const _MenuTile({
    required this.icon,
    required this.label,
    required this.onTap,
    this.labelColor,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 14.h, horizontal: 4.w),
        child: Row(
          children: [
            Icon(icon, size: 22.sp, color: iconColor ?? colors.textTitle),
            SizedBox(width: 14.w),
            Expanded(
              child: Text(
                label,
                style: textTheme.bodyMedium?.copyWith(
                  color: labelColor ?? colors.textTitle,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Icon(Icons.chevron_right_rounded, size: 20.sp, color: colors.textGrey),
          ],
        ),
      ),
    );
  }
}

// ── Default avatar ───────────────────────────────────────────
class _DefaultAvatar extends StatelessWidget {
  final AppColors colors;
  const _DefaultAvatar({required this.colors});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: colors.background,
      child: Icon(Icons.person_rounded, size: 44.sp, color: colors.textGrey),
    );
  }
}

class _ProfileMenuItem {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
  });
}
