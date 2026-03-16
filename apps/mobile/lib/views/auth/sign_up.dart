import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class SignUp extends StatelessWidget {
  const SignUp({super.key});

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
            Text('Join the Community'),

            SizedBox(height: 16.h),
            Text('Create your account to start playing'),

            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.sp),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  SizedBox(height: 32.h),
                  Text("Full Name"),
                  SizedBox(height: 8.h),

                  MyTextField(
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.text,
                    fillColor: colors.background,
                    hintText: "Enter your full name",
                    prefixIcon: Icon(
                      Icons.person_outline,
                      color: colors.textGrey,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  Text("Phone Number"),
                  SizedBox(height: 8.h),
                  MyTextField(
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.text,
                    fillColor: colors.background,
                    hintText: "Enter your phone number",
                    prefixIcon: Icon(
                      Icons.phone_outlined,
                      color: colors.textGrey,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  Text("Email"),
                  SizedBox(height: 8.h),
                  MyTextField(
                    height: 50.h,
                    width: 360.w,
                    type: TextInputType.emailAddress,
                    fillColor: colors.background,
                    hintText: "Enter your Email",
                    prefixIcon: Icon(
                      Icons.email_outlined,
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
                      Icons.lock_outline,
                      color: colors.textGrey,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  Row(
                    children: [
                      Checkbox(value: false, onChanged: (value) {}),
                      Text("I agree to the Terms and Conditions"),
                    ],
                  ),
                  MyButtons(
                    text: "Create Account",
                    height: 50.h,
                    width: 360.w,
                    onTap: () {},
                    textStyle: textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                    ),
                    backgroundColor: colors.primary,
                  ),
                  SizedBox(height: 16.h),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text("Already have  an account?"),
                      TextButton(
                        onPressed: () {
                          Get.back();
                        },
                        child: Text("Login"),
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
