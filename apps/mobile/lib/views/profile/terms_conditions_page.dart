import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';

class TermsConditionsPage extends StatelessWidget {
  const TermsConditionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    final sections = [
      {
        'title': '1. Acceptance of Terms',
        'content':
            'By accessing or using the Lockkiyajaye mobile application and platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.',
      },
      {
        'title': '2. User Accounts & Registration',
        'content':
            'You must create an account to book turfs and sports slots. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      },
      {
        'title': '3. Turf Bookings & Reservations',
        'content':
            'All slot bookings made via Lockkiyajaye are subject to venue availability and owner approval. Booking confirmations will be issued electronically upon successful payment or slot reservation.',
      },
      {
        'title': '4. Cancellation & Refund Policy',
        'content':
            'Cancellations made within the allowable window specified by the venue policy are eligible for refunds or rescheduling. Non-refundable slots or late cancellations may incur forfeiture of paid fees as per venue rules.',
      },
      {
        'title': '5. User Responsibilities & Code of Conduct',
        'content':
            'Users must respect the rules and regulations of participating turf venues. Any damage caused to venue property, inappropriate behavior, or misuse of services may result in account suspension.',
      },
      {
        'title': '6. Limitation of Liability',
        'content':
            'Lockkiyajaye operates as a booking platform connecting players with venue owners. We are not liable for personal injuries, lost belongings, or venue quality disputes during physical usage of facilities.',
      },
      {
        'title': '7. Modifications to Terms',
        'content':
            'We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the platform following modifications constitutes acceptance of the updated terms.',
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
          'Terms & Conditions',
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
                    'Terms & Conditions',
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
                    'Please read these terms and conditions carefully before using our platform.',
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
                'If you have questions regarding our Terms, contact support@lockkiyajaye.com',
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
