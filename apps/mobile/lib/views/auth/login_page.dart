import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/auth/widgets/social_login.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

import '../../routes/app_paths.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 60.h),
            Image.asset(AppAssets.appLogo),
            Text('Welcome Back'),

            SizedBox(height: 16.h),
            Text('Login to continue your game'),

            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.sp),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  SizedBox(height: 32.h),
                  Text("Email or Phone Number"),
                  SizedBox(height: 8.h),

                  MyTextField(
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.text,
                    fillColor: colors.background,
                    hintText: "Enter your email or phone",
                    prefixIcon: Icon(
                      Icons.person_outline,
                      color: colors.textGrey,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  Text("Password"),
                  SizedBox(height: 8.h),
                  MyTextField(
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.text,
                    fillColor: colors.background,
                    hintText: "Enter your Password",
                    prefixIcon: Icon(
                      Icons.person_outline,
                      color: colors.textGrey,
                    ),
                  ),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: TextButton(
                      onPressed: () {},
                      child: Text("Forgot Password?"),
                    ),
                  ),
                  MyButtons(
                    text: "Sign in",
                    height: 50.h,
                    width: 360.w,
                    onTap: () {
                      Get.toNamed(RoutePaths.otpVerification);
                    },
                    textStyle: textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                    ),
                    backgroundColor: colors.primary,
                  ),
                  SizedBox(height: 16.h),
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
                  Row(
                    children: [
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

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Don't have an account?"),
                      TextButton(onPressed: () {
                        Get.toNamed(RoutePaths.signup);
                      }, child: Text("Sign Up")),
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
