import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/widgets/main_shell.dart';
import 'package:mobile/views/widgets/owner_shell.dart';

class RoleDeciderPage extends StatelessWidget {
  const RoleDeciderPage({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Get.find<AuthViewmodel>();

    final role = auth.currentUser['role'];

    if (role == 'turf_owner') {
      return const OwnerShell();
    } else {
      return const MainShell();
    }
  }
}