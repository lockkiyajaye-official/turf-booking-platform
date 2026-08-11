import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';

class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    final sections = [
      {
        'title': '1. Information We Collect',
        'content':
            'We collect personal details such as your name, email address, phone number, and account preferences when you sign up or log in. We also process booking details, transaction histories, and device identifiers.',
      },
      {
        'title': '2. How We Use Your Information',
        'content':
            'Your data is used to provide slot reservations, authenticate user accounts, send booking confirmations and reminders, improve application performance, and provide customer support.',
      },
      {
        'title': '3. Data Sharing & Third Parties',
        'content':
            'We do not sell your personal data. We only share necessary booking details with relevant turf venue owners for reservation fulfillment, and with trusted payment processing partners for secure transactions.',
      },
      {
        'title': '4. Data Security',
        'content':
            'We implement industry-standard encryption, secure authentication tokens, and strict access controls to protect your data against unauthorized access, disclosure, or alteration.',
      },
      {
        'title': '5. User Rights & Choices',
        'content':
            'You can view, edit, or update your personal account information at any time in your profile settings. You may also request account deletion or data retrieval by reaching out to our support team.',
      },
      {
        'title': '6. Updates to Privacy Policy',
        'content':
            'We may periodically update this policy to reflect changes in our legal obligations or application services. Notifications of significant updates will be communicated through the app.',
      },
    ];

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
          'Privacy Policy',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE8E8E8)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Privacy Policy',
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: colors.primary,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    'Last Updated: August 2026',
                    style: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                    ),
                  ),
                  SizedBox(height: 12.h),
                  Text(
                    'Your privacy is important to us. Learn how Lockkiyajaye collects, uses, and safeguards your data.',
                    style: textTheme.bodyMedium?.copyWith(
                      color: colors.textTitle,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 20.h),
            ...sections.map(
              (section) => Container(
                width: double.infinity,
                margin: EdgeInsets.only(bottom: 12.h),
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE8E8E8)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      section['title']!,
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: colors.textTitle,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      section['content']!,
                      style: textTheme.bodyMedium?.copyWith(
                        color: colors.textGrey,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24.h),
            Center(
              child: Text(
                'For privacy concerns, email privacy@lockkiyajaye.com',
                textAlign: TextAlign.center,
                style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
              ),
            ),
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }
}
