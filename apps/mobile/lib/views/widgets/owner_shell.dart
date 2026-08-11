import 'package:flutter/material.dart';
import 'package:mobile/views/booking/my_turf_page.dart';
import 'package:mobile/views/booking/owner_booking_page.dart';
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
    OwnerBookingsPage(),
    ProfilePage(),
  ];

  static const _ownerNavItems = [
    FloatingNavItem(label: 'Home', icon: Icons.dashboard_rounded),
    FloatingNavItem(label: 'My Turfs', icon: Icons.sports_soccer_rounded),
    FloatingNavItem(label: 'Bookings', icon: Icons.confirmation_number_outlined),
    FloatingNavItem(label: 'Profile', icon: Icons.person_outline_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: FloatingNavBar(
        currentIndex: _currentIndex,
        items: _ownerNavItems,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}