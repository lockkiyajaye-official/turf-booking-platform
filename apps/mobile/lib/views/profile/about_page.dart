import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/profile/privacy_policy_page.dart';
import 'package:mobile/views/profile/terms_conditions_page.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({super.key});

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
          icon: Icon(
            Icons.arrow_back_ios_new,
            color: colors.textTitle,
            size: 20,
          ),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'About App',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20.w),
        child: Column(
          children: [
            SizedBox(height: 20.h),
            Center(
              child: Image.asset(
                AppAssets.appLogo,
                height: 80.h,
                errorBuilder: (context, error, stackTrace) =>
                    Icon(Icons.sports_soccer, size: 64, color: colors.primary),
              ),
            ),
            SizedBox(height: 16.h),
            Text(
              'Lockkiyajaye',
              style: textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: colors.textTitle,
              ),
            ),
            SizedBox(height: 4.h),
            Text(
              'Version 1.0.0 (Build 100)',
              style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
            ),
            SizedBox(height: 24.h),
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE8E8E8)),
              ),
              child: Text(
                'Book your favorite sports venues seamlessly with instant slot reservations, real-time availability, and password-less authentication.',
                style: textTheme.bodyMedium?.copyWith(
                  color: colors.textTitle,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            SizedBox(height: 24.h),
            ListTile(
              tileColor: colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: Color(0xFFE8E8E8)),
              ),
              title: Text(
                'Terms & Conditions',
                style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              trailing: Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: colors.textGrey,
              ),
              onTap: () => Get.to(() => const TermsConditionsPage()),
            ),
            SizedBox(height: 12.h),
            ListTile(
              tileColor: colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: Color(0xFFE8E8E8)),
              ),
              title: Text(
                'Privacy Policy',
                style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              trailing: Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: colors.textGrey,
              ),
              onTap: () => Get.to(() => const PrivacyPolicyPage()),
            ),
            SizedBox(height: 40.h),
            Text(
              '© 2026 LockKiyaJaye. All rights reserved.',
              style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
            ),
          ],
        ),
      ),
    );
  }
}
