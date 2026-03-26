import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final vm = Get.find<AuthViewmodel>();

    final List<_ProfileMenuItem> menuItems = [
      _ProfileMenuItem(
        icon: Icons.person_outline,
        label: 'Edit Profile',
        onTap: () => Get.toNamed('/profile/edit'),
      ),
      _ProfileMenuItem(
        icon: Icons.language_outlined,
        label: 'Language settings',
        onTap: () => Get.toNamed('/settings/language'),
      ),
      _ProfileMenuItem(
        icon: Icons.favorite_border_rounded,
        label: 'Favorite Venue',
        onTap: () => Get.toNamed('/favorites'),
      ),
      _ProfileMenuItem(
        icon: Icons.notifications_outlined,
        label: 'Notification settings',
        onTap: () => Get.toNamed('/settings/notifications'),
      ),
      _ProfileMenuItem(
        icon: Icons.edit_outlined,
        label: 'Change Password',
        onTap: () => Get.toNamed('/settings/change-password'),
      ),
      _ProfileMenuItem(
        icon: Icons.cancel_outlined,
        label: 'Cancellation/Reschedule',
        onTap: () => Get.toNamed('/bookings/cancellation'),
      ),
      _ProfileMenuItem(
        icon: Icons.help_outline_rounded,
        label: 'Help & Support',
        onTap: () => Get.toNamed('/support'),
      ),
      _ProfileMenuItem(
        icon: Icons.info_outline_rounded,
        label: 'About app',
        onTap: () => Get.toNamed('/about'),
      ),
    ];

    return Scaffold(
      backgroundColor: colors.white,
      appBar: AppBar(
        backgroundColor: colors.white,
        automaticallyImplyActions: false,
        automaticallyImplyLeading: false,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Profile Page',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            color: colors.textTitle,
          ),
        ),
      ),
      body: Column(
        children: [
          SizedBox(height: 16.h),

          // ── Avatar + Name + Email ──────────────────────────
          Center(
            child: Column(
              children: [
                // Avatar
                Container(
                  width: 80.w,
                  height: 80.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: const Color(0xFFE8E8E8),
                      width: 2,
                    ),
                  ),
                  child: ClipOval(
                    child: Obx(() {
                      final avatarUrl =
                          vm.currentUser['avatarUrl'] as String?;
                      if (avatarUrl != null && avatarUrl.isNotEmpty) {
                        return Image.network(
                          avatarUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _DefaultAvatar(colors: colors),
                        );
                      }
                      return _DefaultAvatar(colors: colors);
                    }),
                  ),
                ),

                SizedBox(height: 10.h),

                // Name
                Obx(() {
                  final first =
                      vm.currentUser['firstName'] as String? ?? '';
                  final last =
                      vm.currentUser['lastName'] as String? ?? '';
                  final name =
                      '${first.trim()} ${last.trim()}'.trim();
                  return Text(
                    name.isEmpty ? 'User' : name,
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: colors.textTitle,
                    ),
                  );
                }),

                SizedBox(height: 4.h),

                // Email
                Obx(() {
                  final email =
                      vm.currentUser['email'] as String? ?? '';
                  return Text(
                    email,
                    style: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                    ),
                  );
                }),
              ],
            ),
          ),

          SizedBox(height: 24.h),

          // ── Menu items ─────────────────────────────────────
          Expanded(
            child: ListView.separated(
              physics: const NeverScrollableScrollPhysics(),
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              itemCount: menuItems.length + 1, // +1 for logout
              separatorBuilder: (_, __) => Divider(
                height: 1,
                color: const Color(0xFFF0F0F0),
              ),
              itemBuilder: (context, index) {
                // Last item = Logout (red)
                if (index == menuItems.length) {
                  return _MenuTile(
                    icon: Icons.logout_rounded,
                    label: 'Logout',
                    labelColor: colors.error ?? Colors.red,
                    iconColor: colors.error ?? Colors.red,
                    onTap: () {
                      Get.dialog(
                        AlertDialog(
                          title: const Text('Logout'),
                          content: const Text(
                              'Are you sure you want to logout?'),
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
                                style: TextStyle(
                                    color:
                                        colors.error ?? Colors.red),
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
          ),
        ],
      ),
    );
  }
}

// ── Menu tile ────────────────────────────────────────────────
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
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 14.h),
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: iconColor ?? colors.textTitle,
            ),
            SizedBox(width: 14.w),
            Expanded(
              child: Text(
                label,
                style: textTheme.bodyMedium?.copyWith(
                  color: labelColor ?? colors.textTitle,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              size: 20,
              color: colors.textGrey,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Default avatar fallback ──────────────────────────────────
class _DefaultAvatar extends StatelessWidget {
  final AppColors colors;
  const _DefaultAvatar({required this.colors});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: colors.background,
      child: Icon(
        Icons.person_rounded,
        size: 40,
        color: colors.textGrey,
      ),
    );
  }
}

// ── Data model ───────────────────────────────────────────────
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