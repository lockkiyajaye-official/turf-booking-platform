import 'package:flutter/material.dart';
import 'package:mobile/views/home/home_page.dart';
import 'package:mobile/views/search/search_page.dart';
import 'package:mobile/views/widgets/floating_nav_bar.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});
  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final _pages = const [
    HomePage(),
    SearchPage(),
    Center(child: Text('Bookings')),
    Center(child: Text('Profile')),
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
