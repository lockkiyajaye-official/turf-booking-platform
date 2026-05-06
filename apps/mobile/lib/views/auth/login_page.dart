import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/auth/widgets/social_login.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

import '../../routes/app_paths.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _identityController = TextEditingController();
  bool _isPhone = false;

  bool _looksLikePhone(String value) {
    final cleaned = value.replaceAll(RegExp(r'[\s\-\(\)]'), '');
    if (cleaned.startsWith('+')) return true;
    if (cleaned.length >= 6 && RegExp(r'^\d+$').hasMatch(cleaned)) return true;
    return false;
  }

  void _onIdentityChanged(String value) {
    final isPhone = _looksLikePhone(value.trim());
    if (isPhone != _isPhone) setState(() => _isPhone = isPhone);
  }

  @override
  void dispose() {
    _identityController.dispose();
    super.dispose();
  }

  Future<void> _handleSendOtp(AuthViewmodel controller) async {
    final value = _identityController.text.trim();
    if (_isPhone) {
      controller.phoneController.text = value;
      controller.emailController.text = '';
      await controller.requestPhoneOtp();
    } else {
      controller.emailController.text = value;
      controller.phoneController.text = '';
      await controller.requestEmailOtp();
    }

    if (controller.otpSent.value) {
      Get.toNamed(RoutePaths.otpVerification, arguments: {'mode': 'login'});
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final controller = Get.find<AuthViewmodel>();

    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              keyboardDismissBehavior:
                  ScrollViewKeyboardDismissBehavior.onDrag,
              child: ConstrainedBox(
                constraints:
                    BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 24.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Spacer(flex: 2),

                        // ── LOGO with subtle shadow to lift it off the page ──
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFE43434).withOpacity(0.15),
                                blurRadius: 24,
                                spreadRadius: 2,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Image.asset(AppAssets.appLogo),
                        ),

                        SizedBox(height: 20.h),
                        Text('Welcome Back', style: textTheme.titleLarge),
                        SizedBox(height: 6.h),
                        Text(
                          'Login to continue your game',
                          style: textTheme.bodyMedium
                              ?.copyWith(color: colors.textGrey),
                          textAlign: TextAlign.center,
                        ),

                        const Spacer(flex: 2),

                        // ── FORM GROUP with a light card background ──
                        Container(
                          width: double.infinity,
                          padding: EdgeInsets.all(20.w),
                          decoration: BoxDecoration(
                            color: colors.background,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: colors.textGrey.withOpacity(0.15),
                              width: 1,
                            ),
                            // Very subtle shadow so the form feels grounded
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.04),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Email or Phone Number",
                                style: textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: colors.textTitle,
                                ),
                              ),
                              SizedBox(height: 8.h),

                              MyTextField(
                                controller: _identityController,
                                height: 50.h,
                                width: double.infinity,
                                type: TextInputType.text,
                                fillColor: colors.background,
                                hintText:
                                    "Enter your email or phone number",
                                onChanged: _onIdentityChanged,
                                prefixIcon: Icon(
                                  _isPhone
                                      ? Icons.phone_outlined
                                      : Icons.person_outline,
                                  color: colors.textGrey,
                                ),
                              ),

                              SizedBox(height: 14.h),

                              Obx(() => MyButtons(
                                    text: controller.isLoading.value
                                        ? "Sending OTP..."
                                        : "Send OTP",
                                    height: 50.h,
                                    width: double.infinity,
                                    onTap: controller.isLoading.value
                                        ? null
                                        : () => _handleSendOtp(controller),
                                    textStyle: textTheme.bodyMedium
                                        ?.copyWith(color: Colors.white),
                                    backgroundColor:
                                        const Color(0xFFE43434),
                                  )),
                            ],
                          ),
                        ),

                        SizedBox(height: 24.h),

                        // ── DIVIDER ──
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                  height: 1.h, color: colors.textGrey.withOpacity(0.4)),
                            ),
                            Padding(
                              padding:
                                  EdgeInsets.symmetric(horizontal: 12.w),
                              child: Text(
                                "Or sign in with",
                                style: textTheme.bodySmall?.copyWith(
                                    color: colors.textTitle),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                  height: 1.h, color: colors.textGrey.withOpacity(0.4)),
                            ),
                          ],
                        ),

                        SizedBox(height: 20.h),

                        // ── GOOGLE ──
                        SocialLogin(
                          text: "Google",
                          asset: AppAssets.google,
                          onTap: () => controller.loginWithGoogle(),
                        ),

                        const Spacer(flex: 3),

                        // ── SIGN UP — anchored at bottom ──
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              "Don't have an account?",
                              style: textTheme.bodySmall
                                  ?.copyWith(color: colors.textGrey),
                            ),
                            TextButton(
                              onPressed: () =>
                                  Get.toNamed(RoutePaths.signup),
                              child: const Text(
                                "Sign Up",
                                style:
                                    TextStyle(color: Color(0xFFE43434)),
                              ),
                            ),
                          ],
                        ),

                        SizedBox(height: 8.h),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}