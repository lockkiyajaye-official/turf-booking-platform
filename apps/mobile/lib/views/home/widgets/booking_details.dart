import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/amentity_item.dart';
import 'package:mobile/data/models/day_item.dart';
import 'package:mobile/views/home/widgets/amentity_chip.dart';
import 'package:mobile/views/home/widgets/counter_chip.dart';
import 'package:mobile/views/widgets/my_buttons.dart';

class TurfDetailsPage extends StatefulWidget {
  const TurfDetailsPage({super.key});

  @override
  State<TurfDetailsPage> createState() => _TurfDetailsPageState();
}

class _TurfDetailsPageState extends State<TurfDetailsPage> {
  int _playerCount = 10;
  int _selectedDayIndex = 1; 
  int _selectedSlotIndex = 1;
  int _currentImageIndex = 0;


  static const _primaryGreen = Color(0xFF2E7D32);

  final List<String> _imageUrls = [
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&q=80',
  ];

  final List<DayItem> _days = [
    DayItem(day: 'Mon', date: '01'),
    DayItem(day: 'Tue', date: '02'),
    DayItem(day: 'Wed', date: '03'),
    DayItem(day: 'Thu', date: '04'),
    DayItem(day: 'Fri', date: '05'),
    DayItem(day: 'Sat', date: '06'),
    DayItem(day: 'Sun', date: '07'),
  ];

  final List<String> _slots = [
    '9:00AM',
    '10:00AM',
    '11:00AM',
    '12:00PM',
    '1:00PM',
    '2:00PM',
    '3:00PM',
    '6:00PM',
  ];

  final List<AmenityItem> _amenities = [
    AmenityItem(icon: Icons.wc_outlined, label: 'Washrooms'),
    AmenityItem(icon: Icons.light_mode_outlined, label: 'Night Lights'),
    AmenityItem(icon: Icons.local_parking_outlined, label: 'Parking'),
    AmenityItem(icon: Icons.security_outlined, label: 'CCTV & Safety'),
  ];

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // ── Scrollable body ──────────────────────────────────
          Expanded(
            child: CustomScrollView(
              slivers: [
                // ── Image carousel ───────────────────────────
                SliverToBoxAdapter(
                  child: Stack(
                    children: [
                      SizedBox(
                        height: 240.h,
                        child: PageView.builder(
                          itemCount: _imageUrls.length,
                          onPageChanged: (i) =>
                              setState(() => _currentImageIndex = i),
                          itemBuilder: (context, index) {
                            return Image.network(
                              _imageUrls[index],
                              fit: BoxFit.cover,
                              width: double.infinity,
                              errorBuilder: (_, __, ___) => Container(
                                color: Colors.grey[200],
                                child: const Icon(
                                  Icons.sports_soccer,
                                  size: 48,
                                  color: Colors.grey,
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                      // Back button
                      Positioned(
                        top: 44.h,
                        left: 16.w,
                        child: GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Container(
                            width: 36.w,
                            height: 36.h,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.9),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.chevron_left, size: 22),
                          ),
                        ),
                      ),
                      // Title in appbar area
                      Positioned(
                        top: 50.h,
                        left: 0,
                        right: 0,
                        child: Center(
                          child: Text(
                            'Turf Details',
                            style: textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                              shadows: [
                                const Shadow(
                                  blurRadius: 6,
                                  color: Colors.black45,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      // Dot indicators
                      Positioned(
                        bottom: 12.h,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            _imageUrls.length,
                            (i) => AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              margin: EdgeInsets.symmetric(horizontal: 3.w),
                              width: _currentImageIndex == i ? 20.w : 7.w,
                              height: 7.h,
                              decoration: BoxDecoration(
                                color: _currentImageIndex == i
                                    ? Colors.white
                                    : Colors.white54,
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16.w),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: 14.h),

                        // ── Turf name & type ─────────────────
                        Text(
                          'Grandfield',
                          style: textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            fontSize: 22.sp,
                            color: const Color(0xFF1C1C1E),
                          ),
                        ),
                        SizedBox(height: 2.h),
                        Text(
                          'Cricket Turf',
                          style: textTheme.bodyMedium?.copyWith(
                            color: _primaryGreen,
                            fontWeight: FontWeight.w600,
                            fontSize: 13.sp,
                          ),
                        ),
                        SizedBox(height: 6.h),

                        // ── Rating + location ─────────────────
                        Row(
                          children: [
                            const Icon(
                              Icons.star,
                              color: Color(0xFFFFC107),
                              size: 16,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              '4.8 (150)',
                              style: textTheme.bodySmall?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: const Color(0xFF1C1C1E),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 4.h),
                        Text(
                          'HSR Layout, Koramangala, 2km',
                          style: textTheme.bodySmall?.copyWith(
                            color: Colors.grey[500],
                            fontSize: 12.sp,
                          ),
                        ),

                        SizedBox(height: 20.h),

                        // ── Amenities ─────────────────────────
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Amenities',
                              style: textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                fontSize: 15.sp,
                              ),
                            ),
                            Row(
                              children: [
                                Icon(
                                  Icons.location_on_outlined,
                                  size: 14,
                                  color: _primaryGreen,
                                ),
                                SizedBox(width: 4.w),
                                Text(
                                  'View on Map',
                                  style: textTheme.bodySmall?.copyWith(
                                    color: _primaryGreen,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 12.sp,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        SizedBox(height: 12.h),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: _amenities
                              .map((a) => AmenityChip(item: a))
                              .toList(),
                        ),

                        SizedBox(height: 20.h),

                        // ── Number of players ─────────────────
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 14.w,
                            vertical: 12.h,
                          ),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: Colors.grey[200]!,
                              width: 1.2,
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Number of Players',
                                    style: textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14.sp,
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      CounterButton(
                                        icon: Icons.remove,
                                        onTap: () {
                                          if (_playerCount > 1) {
                                            setState(() => _playerCount--);
                                          }
                                        },
                                        color: _primaryGreen,
                                      ),
                                      Padding(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: 16.w,
                                        ),
                                        child: Text(
                                          '$_playerCount',
                                          style: textTheme.titleMedium
                                              ?.copyWith(
                                                fontWeight: FontWeight.w700,
                                                fontSize: 16.sp,
                                              ),
                                        ),
                                      ),
                                      CounterButton(
                                        icon: Icons.add,
                                        onTap: () {
                                          if (_playerCount < 14) {
                                            setState(() => _playerCount++);
                                          }
                                        },
                                        color: _primaryGreen,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              SizedBox(height: 4.h),
                              Text(
                                'Max 14 players allowed',
                                style: textTheme.bodySmall?.copyWith(
                                  color: Colors.grey[400],
                                  fontSize: 11.sp,
                                ),
                              ),
                            ],
                          ),
                        ),

                        SizedBox(height: 20.h),

                        // ── Select Date ───────────────────────
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Select Date',
                              style: textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.w700,
                                fontSize: 15.sp,
                              ),
                            ),
                            Row(
                              children: [
                                Text(
                                  'January 2026',
                                  style: textTheme.bodySmall?.copyWith(
                                    color: _primaryGreen,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13.sp,
                                  ),
                                ),
                                SizedBox(width: 4.w),
                                Icon(
                                  Icons.keyboard_arrow_down,
                                  color: _primaryGreen,
                                  size: 18,
                                ),
                              ],
                            ),
                          ],
                        ),
                        SizedBox(height: 12.h),

                        // Day selector
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(
                            _days.length,
                            (i) => GestureDetector(
                              onTap: () =>
                                  setState(() => _selectedDayIndex = i),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                width: 40.w,
                                padding: EdgeInsets.symmetric(vertical: 8.h),
                                decoration: BoxDecoration(
                                  color: _selectedDayIndex == i
                                      ? _primaryGreen
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: _selectedDayIndex == i
                                        ? _primaryGreen
                                        : Colors.grey[200]!,
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      _days[i].day,
                                      style: TextStyle(
                                        fontSize: 11.sp,
                                        fontWeight: FontWeight.w500,
                                        color: _selectedDayIndex == i
                                            ? Colors.white
                                            : Colors.grey[600],
                                      ),
                                    ),
                                    SizedBox(height: 2.h),
                                    Text(
                                      _days[i].date,
                                      style: TextStyle(
                                        fontSize: 13.sp,
                                        fontWeight: FontWeight.w700,
                                        color: _selectedDayIndex == i
                                            ? Colors.white
                                            : const Color(0xFF1C1C1E),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),

                        SizedBox(height: 20.h),

                        // ── Slots Available ───────────────────
                        Text(
                          'Slots Available',
                          style: textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            fontSize: 15.sp,
                          ),
                        ),
                        SizedBox(height: 12.h),
                        Wrap(
                          spacing: 10.w,
                          runSpacing: 10.h,
                          children: List.generate(
                            _slots.length,
                            (i) => GestureDetector(
                              onTap: () =>
                                  setState(() => _selectedSlotIndex = i),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: EdgeInsets.symmetric(
                                  horizontal: 14.w,
                                  vertical: 9.h,
                                ),
                                decoration: BoxDecoration(
                                  color: _selectedSlotIndex == i
                                      ? _primaryGreen
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: _selectedSlotIndex == i
                                        ? _primaryGreen
                                        : Colors.grey[300]!,
                                  ),
                                ),
                                child: Text(
                                  _slots[i],
                                  style: TextStyle(
                                    fontSize: 12.sp,
                                    fontWeight: FontWeight.w600,
                                    color: _selectedSlotIndex == i
                                        ? Colors.white
                                        : const Color(0xFF3A3A3C),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),

                        SizedBox(height: 100.h), // space for bottom button
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          MyButtons(
            text: "Continue",
            height: 50.h,
            width: 361.w,
            onTap: (){},
            textStyle: textTheme.bodyMedium?.copyWith(color: colors.white),
            backgroundColor: colors.primary,
          ),
        ],
      ),
    );
  }
}



