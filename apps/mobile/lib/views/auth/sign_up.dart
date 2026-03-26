import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/routes/app_paths.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class SignUp extends StatefulWidget {
  const SignUp({super.key});

  @override
  State<SignUp> createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> {
  bool _obscurePassword = true;
  bool _agreedToTerms = false;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final controller = Get.find<AuthViewmodel>();

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 60.h),

            Image.asset(AppAssets.appLogo),

            SizedBox(height: 12.h),
            Text('Join the Community', style: textTheme.titleLarge),

            SizedBox(height: 6.h),
            Text(
              'Create your account to start playing',
              style: textTheme.bodyMedium,
            ),

            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.sp),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(height: 32.h),

                  /// FIRST NAME / LAST NAME
                  Row(
                    children: [
                       Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "First Name",
                              style: textTheme.bodyMedium
                                  ?.copyWith(fontWeight: FontWeight.w600),
                            ),
                            SizedBox(height: 8.h),
                            MyTextField(
                              controller: controller.firstNameController,
                              height: 50.h,
                              type: TextInputType.name,
                              fillColor: colors.background,
                              hintText: "First name",
                              prefixIcon: Icon(Icons.person_outline,
                                  color: colors.textGrey),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Last Name",
                              style: textTheme.bodyMedium
                                  ?.copyWith(fontWeight: FontWeight.w600),
                            ),
                            SizedBox(height: 8.h),
                            MyTextField(
                              controller: controller.lastNameController,
                              height: 50.h,
                              type: TextInputType.name,
                              fillColor: colors.background,
                              hintText: "Last name",
                              prefixIcon: Icon(Icons.person_outline,
                                  color: colors.textGrey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 16.h),

                  /// PHONE
                  Text(
                    "Phone Number",
                    style: textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: controller.phoneController,
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.phone,
                    fillColor: colors.background,
                    hintText: "Enter your phone number",
                    prefixIcon:
                        Icon(Icons.phone_outlined, color: colors.textGrey),
                  ),

                  SizedBox(height: 16.h),

                  /// EMAIL
                  Text(
                    "Email",
                    style: textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: controller.emailController,
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.emailAddress,
                    fillColor: colors.background,
                    hintText: "Enter your email",
                    prefixIcon:
                        Icon(Icons.email_outlined, color: colors.textGrey),
                  ),

                  SizedBox(height: 16.h),

                  /// PASSWORD
                  Text(
                    "Password",
                    style: textTheme.bodyMedium
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: controller.passwordController,
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.visiblePassword,
                    fillColor: colors.background,
                    hintText: "Enter your password",
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
                  ),

                  SizedBox(height: 12.h),

                  /// TERMS
                  Row(
                    children: [
                      Checkbox(
                        value: _agreedToTerms,
                        activeColor: colors.primary,
                        onChanged: (value) =>
                            setState(() => _agreedToTerms = value ?? false),
                      ),
                      Expanded(
                        child: RichText(
                          text: TextSpan(
                            style: textTheme.bodySmall,
                            children: [
                              const TextSpan(text: "I agree to the "),
                              TextSpan(
                                text: "Terms and Conditions",
                                style: TextStyle(
                                  color: colors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 16.h),

                  /// SEND OTP BUTTON
                  /// This validates the form, sends an OTP to the email,
                  /// and only on success navigates to OtpVerificationPage.
                  /// The actual account creation happens AFTER OTP is verified.
                  Obx(() => MyButtons(
                        text: controller.isLoading.value
                            ? "Sending OTP..."
                            : "Continue",
                        height: 50.h,
                        width: 360.w,
                        onTap: (controller.isLoading.value || !_agreedToTerms)
                            ? null
                            : () => controller.requestRegistrationOtp(),
                        textStyle: textTheme.bodyMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                        backgroundColor: !_agreedToTerms
                            ? const Color(0xFFE43434).withOpacity(0.5)
                            : const Color(0xFFE43434),
                      )),

                  SizedBox(height: 20.h),

                  /// LOGIN LINK
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Already have an account?",
                        style: textTheme.bodyMedium,
                      ),
                      TextButton(
                        onPressed: () => Get.back(),
                        child: Text(
                          "Login",
                          style: textTheme.bodyMedium?.copyWith(
                            color: colors.primary,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 24.h),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}   