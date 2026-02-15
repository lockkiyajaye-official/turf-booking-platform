import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class OtpVerificationPage extends StatefulWidget {
  const OtpVerificationPage({super.key});

  @override
  State<OtpVerificationPage> createState() => _OtpVerificationPageState();
}

class _OtpVerificationPageState extends State<OtpVerificationPage> {
  final List<TextEditingController> _otpControllers = List.generate(
    4,
    (index) => TextEditingController(),
  );

  final List<FocusNode> _focusNodes = List.generate(
    4,
    (index) => FocusNode(),
  );

  @override
  void dispose() {
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onOtpChanged(String value, int index) {
    if (value.isNotEmpty && index < 3) {
      // Move to next field
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      // Move to previous field on backspace
      _focusNodes[index - 1].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colors.textTitle),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 40.h),
            
            // Title
            Text(
              'Verify Your OTP',
              style: textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: colors.textTitle,
              ),
            ),
            
            SizedBox(height: 12.h),
            
            // Subtitle
            Text(
              'We sent a 4-digit code to your phone number',
              style: textTheme.bodyMedium?.copyWith(
                color: colors.textGrey,
              ),
              textAlign: TextAlign.center,
            ),
            
            SizedBox(height: 40.h),
            
            // OTP Input Fields
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(4, (index) {
                return SizedBox(
                  width: 60.w,
                  height: 60.h,
                  child: MyTextField(
                    height: 60.h,
                    width: 60.w,
                    type: TextInputType.number,
                    fillColor: Colors.grey.shade100,
                    hintText: '',
                    controller: _otpControllers[index],
                    focusNode: _focusNodes[index],
                    onChanged: (value) => _onOtpChanged(value, index),
                    hintStyle: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: colors.textTitle,
                    ),
                  ),
                );
              }),
            ),
            
            SizedBox(height: 24.h),
            
            // Resend OTP Text
            Text(
              'Resend OTP in 30 seconds',
              style: textTheme.bodyMedium?.copyWith(
                color: colors.textGrey,
              ),
            ),
            
            SizedBox(height: 32.h),
            
            // Verify Button
            MyButtons(
              text: "Verify OTP",
              height: 50.h,
              width: double.infinity,
              onTap: () {
                // Handle OTP verification
                final otp = _otpControllers
                    .map((controller) => controller.text)
                    .join();
                print('OTP: $otp');
              },
              textStyle: textTheme.bodyLarge?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
              backgroundColor:colors.primary,
            ),
            
            SizedBox(height: 16.h),
            
            // Change Phone Number
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Entered wrong number? ',
                  style: textTheme.bodyMedium?.copyWith(
                    color: colors.textGrey,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    // Handle change phone number
                    Navigator.pop(context);
                  },
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                      child: Text(
                    'Change Phone',
                    style: textTheme.bodyMedium?.copyWith(
                      color: Colors.red,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}