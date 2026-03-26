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
  bool _obscurePassword = true; // ← FIX 1: added missing state variable

  bool _looksLikePhone(String value) {
    final cleaned = value.replaceAll(RegExp(r'[\s\-\(\)]'), '');
    if (cleaned.startsWith('+')) return true;
    if (cleaned.length >= 6 && RegExp(r'^\d+$').hasMatch(cleaned)) return true;
    return false;
  }

  void _onIdentityChanged(String value) {
    final isPhone = _looksLikePhone(value.trim());
    if (isPhone != _isPhone) {
      setState(() => _isPhone = isPhone);
    }
  }

  @override
  void dispose() {
    _identityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final controller = Get.find<AuthViewmodel>();

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            SizedBox(height: 60.h),

            // Logo
            Image.asset(AppAssets.appLogo),

            SizedBox(height: 16.h),
            Text('Welcome Back', style: textTheme.titleLarge),

            SizedBox(height: 8.h),
            Text(
              'Login to continue your game',
              style: textTheme.bodyMedium,
            ),

            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: 32.h),

                  /// EMAIL OR PHONE
                  const Text("Email or Phone Number"),
                  SizedBox(height: 8.h),

                  MyTextField(
                    controller: _identityController,
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.text,
                    fillColor: colors.background,
                    hintText: "Enter your email or phone number",
                    onChanged: _onIdentityChanged,
                    prefixIcon: Icon(
                      _isPhone ? Icons.phone_outlined : Icons.person_outline,
                      color: colors.textGrey,
                    ),
                  ),

                  SizedBox(height: 16.h),

                  // ── Email mode: show password field ──────────
                  if (!_isPhone) ...[
                    const Text("Password"),
                    SizedBox(height: 8.h),

                    // FIX 2: closed MyTextField properly; moved Forgot Password
                    //        and Login Button outside of it
                    MyTextField(
                      controller: controller.passwordController,
                      height: 50.h,
                      width: 360.w,
                      type: TextInputType.text,
                      fillColor: colors.background,
                      hintText: "Enter your Password",
                      obscureText: _obscurePassword,
                      prefixIcon:
                          Icon(Icons.lock_outline, color: colors.textGrey),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: colors.textGrey,
                        ),
                        onPressed: () =>
                            setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ), // ← FIX 2: MyTextField closes here

                    /// FORGOT PASSWORD
                    Align(
                      alignment: Alignment.bottomRight,
                      child: TextButton(
                        onPressed: () {},
                        child: const Text(
                          "Forgot Password?",
                          style: TextStyle(color: Color(0xFFE43434)),
                        ),
                      ),
                    ),

                    /// LOGIN BUTTON
                    Obx(() => MyButtons(
                          text: controller.isLoading.value
                              ? "Signing in..."
                              : "Sign in",
                          height: 50.h,
                          width: 360.w,
                          onTap: controller.isLoading.value
                              ? null
                              : () {
                                  controller.emailController.text =
                                      _identityController.text.trim();
                                  controller.login();
                                },
                          textStyle: textTheme.bodyMedium?.copyWith(
                            color: Colors.white,
                          ),
                          backgroundColor: const Color(0xFFE43434),
                        )),
                  ], // ← FIX 3: email block closes here

                  // ── Phone mode: show OTP flow ───────────────
                  if (_isPhone) ...[
                    Obx(() {
                      final otpSent = controller.otpSent.value;
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (otpSent) ...[
                            const Text("OTP"),
                            SizedBox(height: 8.h),
                            MyTextField(
                              controller: controller.otpController,
                              height: 50.h,
                              width: 360.w,
                              type: TextInputType.phone,
                              fillColor: colors.background,
                              hintText: "Enter the OTP sent to your phone",
                              prefixIcon: Icon(
                                Icons.lock_outline,
                                color: colors.textGrey,
                              ),
                            ),
                            SizedBox(height: 16.h),
                          ],

                          if (!otpSent)
                            MyButtons(
                              text: controller.isLoading.value
                                  ? "Sending OTP..."
                                  : "Send OTP",
                              height: 50.h,
                              width: 360.w,
                              onTap: controller.isLoading.value
                                  ? null
                                  : () {
                                      controller.phoneController.text =
                                          _identityController.text.trim();
                                      controller.requestPhoneOtp();
                                    },
                              textStyle: textTheme.bodyMedium?.copyWith(
                                color: Colors.white,
                              ),
                              backgroundColor: const Color(0xFFE74C3C),
                            )
                          else
                            Column(
                              children: [
                                MyButtons(
                                  text: controller.isLoading.value
                                      ? "Signing in..."
                                      : "Sign in",
                                  height: 50.h,
                                  width: 360.w,
                                  onTap: controller.isLoading.value
                                      ? null
                                      : () {
                                          controller.phoneController.text =
                                              _identityController.text.trim();
                                          controller.loginWithPhoneOtp();
                                        },
                                  textStyle: textTheme.bodyMedium?.copyWith(
                                    color: Colors.white,
                                  ),
                                  backgroundColor: const Color(0xFFE74C3C),
                                ),
                                TextButton(
                                  onPressed: controller.isLoading.value
                                      ? null
                                      : () {
                                          controller.phoneController.text =
                                              _identityController.text.trim();
                                          controller.requestPhoneOtp();
                                        },
                                  child: Text(
                                    "Resend OTP",
                                    style: textTheme.bodySmall?.copyWith(
                                      color: const Color(0xFFE74C3C),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                        ],
                      );
                    }),
                  ],

                  SizedBox(height: 16.h),

                  /// DIVIDER
                  Row(
                    children: [
                      Expanded(
                        child: Container(height: 1.h, color: colors.textGrey),
                      ),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12.w),
                        child: Text(
                          "Or sign in with",
                          style: textTheme.bodySmall?.copyWith(
                            color: colors.textTitle,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(height: 1.h, color: colors.textGrey),
                      ),
                    ],
                  ),

                  SizedBox(height: 20.h),

                  /// SOCIAL LOGIN
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(width: 25.w,),
                      SocialLogin(
                        text: "Google",
                        asset: AppAssets.google,
                        onTap: () {},
                      ),
                      SizedBox(width: 25.w),
                      SocialLogin(
                        text: "Facebook",
                        asset: AppAssets.facebook,
                        onTap: () {},
                      ),
                    ],
                  ),

                  SizedBox(height: 20.h),

                  /// SIGN UP
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account?"),
                      TextButton(
                        onPressed: () {
                          Get.toNamed(RoutePaths.signup);
                        },
                        child: const Text(
                          "Sign Up",
                          style: TextStyle(color: Color(0xFFE43434)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}