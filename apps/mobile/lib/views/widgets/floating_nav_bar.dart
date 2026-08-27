import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';

class FloatingNavItem {
  final String label;
  final IconData icon;
  const FloatingNavItem({required this.label, required this.icon});
}

class FloatingNavBar extends StatefulWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<FloatingNavItem>? items;

  const FloatingNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.items,
  });

  @override
  State<FloatingNavBar> createState() => _FloatingNavBarState();
}

class _FloatingNavBarState extends State<FloatingNavBar>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _bounce;
  late List<FloatingNavItem> _items;

  @override
  void initState() {
    super.initState();
    _items = widget.items ??
        const [
          FloatingNavItem(label: 'Home', icon: Icons.home_rounded),
          FloatingNavItem(label: 'Search', icon: Icons.search_rounded),
          FloatingNavItem(
              label: 'Bookings', icon: Icons.confirmation_number_outlined),
          FloatingNavItem(label: 'Profile', icon: Icons.person_outline_rounded),
        ];

    _controllers = List.generate(
      _items.length,
      (i) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 350),
      ),
    );
    _bounce = _controllers
        .map((c) => Tween<double>(begin: 1.0, end: 1.2)
            .animate(CurvedAnimation(parent: c, curve: Curves.easeOutBack)))
        .toList();

    if (widget.currentIndex < _controllers.length) {
      _controllers[widget.currentIndex].forward();
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _handleTap(int index) {
    if (index == widget.currentIndex) return;
    _controllers[widget.currentIndex].reverse();
    _controllers[index].forward();
    widget.onTap(index);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        margin: EdgeInsets.fromLTRB(18.w, 0, 18.w, 12.h),
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 24,
              spreadRadius: 1,
              offset: const Offset(0, 8),
            ),
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: List.generate(_items.length, (index) {
            return _NavBarItem(
              item: _items[index],
              isSelected: index == widget.currentIndex,
              bounce: _bounce[index],
              onTap: () => _handleTap(index),
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
  final Animation<double> bounce;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.item,
    required this.isSelected,
    required this.bounce,
    required this.onTap,
  });

  static const _primaryRed = Color(0xFFE53935);
  static const _unselectedColor = Color(0xFF9A9AA5);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: ScaleTransition(
        scale: bounce,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
          padding: EdgeInsets.symmetric(
            horizontal: isSelected ? 18.w : 12.w,
            vertical: 10.h,
          ),
          decoration: BoxDecoration(
            gradient: isSelected
                ? LinearGradient(
                    colors: [_primaryRed, _primaryRed.withOpacity(0.85)],
                  )
                : null,
            color: isSelected ? null : Colors.transparent,
            borderRadius: BorderRadius.circular(20),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: _primaryRed.withOpacity(0.35),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                item.icon,
                color: isSelected ? Colors.white : _unselectedColor,
                size: 22.sp,
              ),
              AnimatedSize(
                duration: const Duration(milliseconds: 250),
                curve: Curves.easeInOut,
                child: isSelected
                    ? Row(
                        children: [
                          SizedBox(width: 6.w),
                          Text(
                            item.label,
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 13.sp,
                            ),
                          ),
                        ],
                      )
                    : const SizedBox.shrink(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}