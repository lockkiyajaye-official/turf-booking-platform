import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';

class OtpVerificationPage extends StatefulWidget {
  const OtpVerificationPage({super.key});

  @override
  State<OtpVerificationPage> createState() => _OtpVerificationPageState();
}

class _OtpVerificationPageState extends State<OtpVerificationPage> {
  final List<TextEditingController> _otpControllers = List.generate(
    6,
    (index) => TextEditingController(),
  );

  final List<FocusNode> _focusNodes = List.generate(6, (index) => FocusNode());

  // Read once at initState — plain String, not reactive
  String _destination = '';

  @override
  void initState() {
    super.initState();
    final controller = Get.find<AuthViewmodel>();
    final email = controller.emailController.text.trim();
    final phone = controller.phoneController.text.trim();
    // FIX: read TextEditingController.text here (plain String),
    // never inside Obx — TextEditingController is NOT a GetX observable
    _destination = email.isNotEmpty ? email : phone;
  }

  @override
  void dispose() {
    for (var c in _otpControllers) c.dispose();
    for (var n in _focusNodes) n.dispose();
    super.dispose();
  }

  void _onOtpChanged(String value, int index) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
  }

  String get _fullOtp => _otpControllers.map((c) => c.text).join();

  void _clearFields() {
    for (var c in _otpControllers) c.clear();
    _focusNodes[0].requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final controller = Get.find<AuthViewmodel>();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: colors.textTitle),
          onPressed: () => Get.back(),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 40.h),

            Text(
              'Verify Your OTP',
              style: textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: colors.textTitle,
              ),
            ),

            SizedBox(height: 12.h),

            // Plain Text — _destination is a String set in initState, NOT reactive.
            // Do NOT wrap in Obx; TextEditingController.text has no GetX stream.
            Text(
              'We sent a 6-digit code to $_destination',
              style: textTheme.bodyMedium?.copyWith(color: colors.textGrey),
              textAlign: TextAlign.center,
            ),

            SizedBox(height: 40.h),

            // OTP boxes
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: List.generate(6, (index) {
                return SizedBox(
                  width: 44.w,
                  height: 54.h,
                  child: TextField(
                    controller: _otpControllers[index],
                    focusNode: _focusNodes[index],
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    
                    maxLength: 1,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: colors.textTitle,
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                            contentPadding: EdgeInsets.zero, 

                      filled: true,
                      fillColor: Colors.grey.shade100,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                            color: Color(0xFFE43434), width: 2),
                      ),
                    ),
                    onChanged: (value) => _onOtpChanged(value, index),
                  ),
                );
              }),
            ),

            SizedBox(height: 24.h),

            // Obx is correct here — only controller.isLoading.value is reactive
            Obx(() => TextButton(
                  onPressed: controller.isLoading.value
                      ? null
                      : () {
                          _clearFields();
                          controller.resendOtp();
                        },
                  child: Text(
                    'Resend OTP',
                    style: textTheme.bodyMedium?.copyWith(
                      color: controller.isLoading.value
                          ? Colors.grey
                          : const Color(0xFFE43434),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                )),

            SizedBox(height: 32.h),

            Obx(() => MyButtons(
                  text: controller.isLoading.value
                      ? "Verifying..."
                      : "Verify & Create Account",
                  height: 50.h,
                  width: double.infinity,
                  onTap: controller.isLoading.value
                      ? null
                      : () async {
                          final otp = _fullOtp;
                          if (otp.length < 6) {
                            Get.snackbar(
                              "Invalid OTP",
                              "Please enter the complete 6-digit OTP",
                              snackPosition: SnackPosition.BOTTOM,
                            );
                            return;
                          }
                          await controller.verifyOtpAndRegister(otp);
                        },
                  textStyle: textTheme.bodyLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                  backgroundColor: const Color(0xFFE43434),
                )),

            SizedBox(height: 16.h),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Wrong details? ',
                  style:
                      textTheme.bodyMedium?.copyWith(color: colors.textGrey),
                ),
                TextButton(
                  onPressed: () => Get.back(),
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.zero,
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: Text(
                    'Go Back',
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