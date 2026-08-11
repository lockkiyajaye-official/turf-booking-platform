import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
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

  Widget _roleCard({
    required String title,
    required IconData icon,
    required bool selected,
    required VoidCallback onTap,
    required AppColors colors,
    required TextTheme textTheme,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(vertical: 14.h),
          decoration: BoxDecoration(
            color: selected ? const Color(0xFFE43434) : colors.background,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? const Color(0xFFE43434) : colors.textGrey.withOpacity(0.2),
              width: 1.5,
            ),
            boxShadow: selected
                ? [
                    BoxShadow(
                      color: const Color(0xFFE43434).withOpacity(0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: Column(
            children: [
              Icon(icon, color: selected ? Colors.white : colors.textGrey, size: 22.sp),
              SizedBox(height: 6.h),
              Text(
                title,
                style: textTheme.bodyMedium?.copyWith(
                  color: selected ? Colors.white : colors.textGrey,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final controller = Get.find<AuthViewmodel>();

    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(height: 12.h),

              // ── LOGO with subtle shadow ──
              Container(
                width: 80.w,
                height: 80.h,
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
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
                  child: Image.asset(
                    AppAssets.appLogo,
                    width: 80.w,
                    height: 80.h,
                    fit: BoxFit.contain,
                  ),
                ),
              ),

              SizedBox(height: 16.h),
              Text('Join the Community', style: textTheme.titleLarge),
              SizedBox(height: 4.h),
              Text(
                'Create your account to start playing',
                style: textTheme.bodyMedium?.copyWith(color: colors.textGrey),
                textAlign: TextAlign.center,
              ),

              SizedBox(height: 24.h),

              // ── SELECT ROLE HEADER & CARDS (WITH HORIZONTAL PADDING) ──
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Select Role",
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: colors.textTitle,
                  ),
                ),
              ),
              SizedBox(height: 10.h),
              Obx(() {
                final selected = controller.selectedRole.value;

                return Row(
                  children: [
                    _roleCard(
                      title: "User",
                      icon: Icons.person_outline,
                      selected: selected == 'user',
                      onTap: () => controller.selectedRole.value = 'user',
                      colors: colors,
                      textTheme: textTheme,
                    ),
                    SizedBox(width: 12.w),
                    _roleCard(
                      title: "Owner",
                      icon: Icons.sports_soccer,
                      selected: selected == 'turf_owner',
                      onTap: () => controller.selectedRole.value = 'turf_owner',
                      colors: colors,
                      textTheme: textTheme,
                    ),
                  ],
                );
              }),

              SizedBox(height: 20.h),

              // ── FORM GROUP ──
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// FIRST NAME / LAST NAME
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "First Name",
                              style: textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: colors.textTitle,
                              ),
                            ),
                            SizedBox(height: 8.h),
                            MyTextField(
                              controller: controller.firstNameController,
                              height: 50.h,
                              type: TextInputType.name,
                              fillColor: colors.background,
                              hintText: "First name",
                              prefixIcon: Icon(
                                Icons.person_outline,
                                color: colors.textGrey,
                              ),
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
                              style: textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: colors.textTitle,
                              ),
                            ),
                            SizedBox(height: 8.h),
                            MyTextField(
                              controller: controller.lastNameController,
                              height: 50.h,
                              type: TextInputType.name,
                              fillColor: colors.background,
                              hintText: "Last name",
                              prefixIcon: Icon(
                                Icons.person_outline,
                                color: colors.textGrey,
                              ),
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
                    style: textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: controller.phoneController,
                    height: 50.h,
                    width: double.infinity,
                    type: TextInputType.phone,
                    fillColor: colors.background,
                    hintText: "Enter your phone number",
                    prefixIcon: Icon(
                      Icons.phone_outlined,
                      color: colors.textGrey,
                    ),
                  ),

                  SizedBox(height: 16.h),

                  /// EMAIL
                  Text(
                    "Email",
                    style: textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: controller.emailController,
                    height: 50.h,
                    width: double.infinity,
                    type: TextInputType.emailAddress,
                    fillColor: colors.background,
                    hintText: "Enter your email",
                    prefixIcon: Icon(
                      Icons.email_outlined,
                      color: colors.textGrey,
                    ),
                  ),

                  SizedBox(height: 16.h),

                  /// PASSWORD
                  Text(
                    "Password",
                    style: textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: controller.passwordController,
                    height: 50.h,
                    width: double.infinity,
                    type: TextInputType.visiblePassword,
                    fillColor: colors.background,
                    hintText: "Enter your password",
                    obscureText: _obscurePassword,
                    prefixIcon: Icon(
                      Icons.lock_outline,
                      color: colors.textGrey,
                    ),
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
                        activeColor: const Color(0xFFE43434),
                        onChanged: (value) =>
                            setState(() => _agreedToTerms = value ?? false),
                      ),
                      Expanded(
                        child: RichText(
                          text: TextSpan(
                            style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                            children: [
                              const TextSpan(text: "I agree to the "),
                              TextSpan(
                                text: "Terms and Conditions",
                                style: TextStyle(
                                  color: const Color(0xFFE43434),
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

                  /// CONTINUE BUTTON
                  Obx(
                    () => MyButtons(
                      text: controller.isLoading.value
                          ? "Sending OTP..."
                          : "Continue",
                      height: 50.h,
                      width: double.infinity,
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
                    ),
                  ),

                  SizedBox(height: 20.h),

                  /// LOGIN LINK
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Already have an account?",
                        style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                      ),
                      TextButton(
                        onPressed: () => Get.back(),
                        child: Text(
                          "Login",
                          style: textTheme.bodySmall?.copyWith(
                            color: const Color(0xFFE43434),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 16.h),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
