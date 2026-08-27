import 'package:flutter/material.dart';
import 'package:mobile/views/booking/booking_page.dart';
import 'package:mobile/views/home/home_page.dart';
import 'package:mobile/views/profile/favorite_venues_page.dart';
import 'package:mobile/views/search/search_page.dart';
import 'package:mobile/views/widgets/floating_nav_bar.dart';
import 'package:mobile/views/profile/profle_page.dart';

class MainShell extends StatefulWidget {
  final int initialIndex;
  const MainShell({super.key, this.initialIndex = 0});
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  final _pages = const [
    HomePage(),
    SearchPage(),
    FavoriteVenuesPage(),
    BookingPage(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F2F7),
      body: _pages[_currentIndex],
      bottomNavigationBar: FloatingNavBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}
