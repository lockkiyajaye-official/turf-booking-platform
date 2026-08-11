import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class SupportPage extends StatefulWidget {
  const SupportPage({super.key});

  @override
  State<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends State<SupportPage> {
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  late TextEditingController _subjectController;
  late TextEditingController _messageController;

  bool _isSubmitting = false;

  final List<Map<String, String>> _faqs = [
    {
      'question': 'How do I cancel or reschedule my booking?',
      'answer': 'Go to Profile > Cancellation/Reschedule, choose your upcoming booking, and tap Cancel Booking. You can re-book any available slot afterwards.'
    },
    {
      'question': 'When will my refund be processed?',
      'answer': 'Refunds for eligible cancellations are automatically processed within 5-7 business days back to your original payment method.'
    },
    {
      'question': 'How can I list my turf as an owner?',
      'answer': 'Register as a Turf Owner in the sign-up flow, or update your profile role to Turf Owner from settings.'
    },
  ];

  @override
  void initState() {
    super.initState();
    _subjectController = TextEditingController();
    _messageController = TextEditingController();
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    final subject = _subjectController.text.trim();
    final message = _messageController.text.trim();

    if (subject.isEmpty || message.isEmpty) {
      Get.snackbar('Error', 'Please fill in both subject and message', snackPosition: SnackPosition.BOTTOM);
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final user = _authVm.currentUser;
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/contact'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim(),
          'email': user['email'] ?? 'user@app.com',
          'subject': subject,
          'message': message,
        }),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        Get.snackbar('Success', 'Your support ticket has been submitted!', snackPosition: SnackPosition.BOTTOM);
        _subjectController.clear();
        _messageController.clear();
      } else {
        Get.snackbar('Error', 'Failed to submit support message', snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
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
          'Help & Support',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Frequently Asked Questions',
              style: textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: colors.textTitle,
              ),
            ),
            SizedBox(height: 12.h),
            ..._faqs.map(
              (faq) => Container(
                margin: EdgeInsets.only(bottom: 8.h),
                decoration: BoxDecoration(
                  color: colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFE8E8E8)),
                ),
                child: ExpansionTile(
                  title: Text(
                    faq['question']!,
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  children: [
                    Padding(
                      padding: EdgeInsets.all(12.w),
                      child: Text(
                        faq['answer']!,
                        style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24.h),
            Text(
              'Contact Support',
              style: textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: colors.textTitle,
              ),
            ),
            SizedBox(height: 12.h),
            MyTextField(
              height: 50.h,
              type: TextInputType.text,
              fillColor: colors.white,
              controller: _subjectController,
              hintText: 'e.g. Issue with payment',
            ),
            SizedBox(height: 16.h),
            MyTextField(
              height: 50.h,
              type: TextInputType.text,
              fillColor: colors.white,
              controller: _messageController,
              hintText: 'Describe your issue or question...',
            ),
            SizedBox(height: 24.h),
            MyButtons(
              text: _isSubmitting ? 'Submitting...' : 'Submit Support Ticket',
              height: 48.h,
              width: double.infinity,
              onTap: _isSubmitting ? () {} : _submitForm,
              backgroundColor: colors.primary,
              textStyle: textTheme.bodyMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 24.h),
          ],
        ),
      ),
    );
  }
}
