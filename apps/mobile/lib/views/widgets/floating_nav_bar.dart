import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';

class FloatingNavItem {
  final String label;
  final IconData icon;
  const FloatingNavItem({required this.label, required this.icon});
}

class FloatingNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<FloatingNavItem>? items;

  const FloatingNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.items,
  });

  static const List<FloatingNavItem> _defaultItems = [
    FloatingNavItem(label: 'Home', icon: Icons.home_rounded),
    FloatingNavItem(label: 'Explore', icon: Icons.search_rounded),
    FloatingNavItem(label: 'Favorites', icon: Icons.favorite_border_rounded),
    FloatingNavItem(label: 'Bookings', icon: Icons.calendar_today_outlined),
    FloatingNavItem(label: 'Profile', icon: Icons.person_outline_rounded),
  ];

  static const _primaryRed = Color(0xFFE53935);
  static const _unselectedColor = Color(0xFF5A5A63);

  @override
  Widget build(BuildContext context) {
    final navItems = items ?? _defaultItems;

    return SafeArea(
      top: false,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 8.h),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: List.generate(navItems.length, (index) {
            final isSelected = index == currentIndex;
            return _NavBarItem(
              item: navItems[index],
              isSelected: isSelected,
              selectedColor: _primaryRed,
              unselectedColor: _unselectedColor,
              onTap: () => onTap(index),
            );
          }),
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  final FloatingNavItem item;
  final bool isSelected;
  final Color selectedColor;
  final Color unselectedColor;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.item,
    required this.isSelected,
    required this.selectedColor,
    required this.unselectedColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isSelected ? selectedColor : unselectedColor;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              item.icon,
              color: color,
              size: 22.sp,
            ),
            SizedBox(height: 4.h),
            Text(
              item.label,
              style: TextStyle(
                color: color,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                fontSize: 11.sp,
              ),
            ),
          ],
        ),
      ),
    );
  }
}