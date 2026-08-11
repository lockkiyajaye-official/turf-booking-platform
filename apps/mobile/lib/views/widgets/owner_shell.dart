import 'package:flutter/material.dart';
import 'package:mobile/views/booking/my_turf_page.dart';
import 'package:mobile/views/home/owner_dashboard.dart';
import 'package:mobile/views/profile/profle_page.dart';
import 'package:mobile/views/widgets/floating_nav_bar.dart';

class OwnerShell extends StatefulWidget {
  const OwnerShell({super.key});

  @override
  State<OwnerShell> createState() => _OwnerShellState();
}

class _OwnerShellState extends State<OwnerShell> {
  int _currentIndex = 0;

  final _pages = const [
    OwnerDashboardPage(),
    MyTurfsPage(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: FloatingNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}