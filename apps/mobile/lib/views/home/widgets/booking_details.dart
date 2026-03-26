import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/data/models/amentity_item.dart';
import 'package:mobile/data/models/day_item.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/views/home/widgets/amentity_chip.dart';
import 'package:mobile/views/widgets/my_buttons.dart';

class TurfDetailsPage extends StatefulWidget {
  final TurfModel turf;

  const TurfDetailsPage({super.key, required this.turf});

  @override
  State<TurfDetailsPage> createState() => _TurfDetailsPageState();
}

class _TurfDetailsPageState extends State<TurfDetailsPage> {
  int _playerCount = 10;
  int _selectedDayIndex = 0;
  int _selectedSlotIndex = 1;
  int _currentImageIndex = 0;

  late final List<String> _imageUrls;

  final List<DayItem> _days = [
    DayItem(day: 'Mon', date: '01'),
    DayItem(day: 'Tue', date: '02'),
    DayItem(day: 'Wed', date: '03'),
    DayItem(day: 'Thu', date: '04'),
    DayItem(day: 'Fri', date: '05'),
    DayItem(day: 'Sat', date: '06'),
    DayItem(day: 'Sun', date: '07'),
  ];

  late final List<String> _slots;
  late final List<AmenityItem> _amenities;

  IconData _getIconForAmenity(String name) {
    switch (name.toLowerCase()) {
      case 'washrooms':
      case 'washroom':
        return Icons.bathtub_outlined;
      case 'parking':
        return Icons.local_parking_outlined;
      case 'cctv & safety':
      case 'cctv':
        return Icons.videocam_outlined;
      case 'night lights':
      case 'lights':
        return Icons.lightbulb_outline;
      case 'water':
        return Icons.water_drop_outlined;
      default:
        return Icons.check_circle_outline;
    }
  }

  @override
  void initState() {
    super.initState();
    _imageUrls = widget.turf.images.isNotEmpty
        ? widget.turf.images
        : [
            'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80',
          ];
    _slots = widget.turf.availableSlots.isNotEmpty
        ? widget.turf.availableSlots
        : [
            '9:00AM',
            '10:00AM',
            '11:00AM',
            '12:00PM',
            '1:00PM',
            '2:00PM',
            '3:00PM',
            '6:00PM',
          ];
    
    _amenities = widget.turf.amenities.isNotEmpty
        ? widget.turf.amenities.map((a) => AmenityItem(icon: _getIconForAmenity(a), label: a)).toList()
        : [
            AmenityItem(icon: Icons.bathtub_outlined, label: 'Washrooms'),
            AmenityItem(icon: Icons.lightbulb_outline, label: 'Night Lights'),
            AmenityItem(icon: Icons.local_parking_outlined, label: 'Parking'),
            AmenityItem(icon: Icons.videocam_outlined, label: 'CCTV & Safety'),
          ];
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final primaryGreen = const Color(0xFF0DAA6C); // Matching screenshot green exactly

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Turf Details',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1C1C1E),
            fontSize: 16.sp,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 8.h),

              // ── Image carousel ─────────────────────────
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(
                      height: 260.h,
                      child: PageView.builder(
                        itemCount: _imageUrls.length,
                        onPageChanged: (i) => setState(() => _currentImageIndex = i),
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
                  ),
                  // Dot indicators
                  Positioned(
                    bottom: 16.h,
                    left: 0,
                    right: 0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _imageUrls.length,
                        (i) => Container(
                          margin: EdgeInsets.symmetric(horizontal: 4.w),
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentImageIndex == i
                                ? Colors.white
                                : Colors.white.withOpacity(0.4),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              SizedBox(height: 16.h),

              // ── Turf Title & Subtitle ─────────────────
              Text(
                widget.turf.name,
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 20.sp,
                  color: const Color(0xFF454555), // Dark bluish grey
                ),
              ),
              SizedBox(height: 4.h),
              Text(
                widget.turf.description.isNotEmpty ? widget.turf.description : 'Cricket Turf',
                style: textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[700],
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w500,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: 8.h),

              // Rating + Location
              Row(
                children: [
                  const Icon(Icons.star, color: Color(0xFFFFC107), size: 14),
                  SizedBox(width: 4.w),
                  Text(
                    '${widget.turf.rating ?? 0.0} (${widget.turf.totalReviews})',
                    style: textTheme.bodySmall?.copyWith(
                      color: Colors.grey[600],
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 4.h),
              Text(
                widget.turf.address,
                style: textTheme.bodySmall?.copyWith(
                  color: Colors.grey[600],
                  fontSize: 12.sp,
                  letterSpacing: -0.2,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              SizedBox(height: 24.h),

              // ── Amenities ─────────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Amenities',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF454555),
                      fontSize: 14.sp,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, color: primaryGreen, size: 16),
                      SizedBox(width: 4.w),
                      Text(
                        'View on Map',
                        style: textTheme.bodySmall?.copyWith(
                          color: primaryGreen,
                          fontWeight: FontWeight.w600,
                          fontSize: 12.sp,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 16.h),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _amenities.map((a) => Padding(
                    padding: EdgeInsets.only(right: 12.w),
                    child: AmenityChip(item: a),
                  )).toList(),
                ),
              ),

              SizedBox(height: 24.h),

              // ── Number of players ─────────────────
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: primaryGreen.withOpacity(0.35), width: 1.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Number of Players',
                          style: textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF454555),
                            fontSize: 13.sp,
                          ),
                        ),
                        SizedBox(height: 2.h),
                        Text(
                          'Max 14 players allowed',
                          style: textTheme.bodySmall?.copyWith(
                            color: Colors.grey[500],
                            fontSize: 10.sp,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: primaryGreen, width: 1.5),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: () {
                              if (_playerCount > 1) setState(() => _playerCount--);
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                              decoration: BoxDecoration(color: primaryGreen),
                              child: const Icon(Icons.remove, color: Colors.white, size: 14),
                            ),
                          ),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 14.w),
                            child: Text(
                              '$_playerCount',
                              style: TextStyle(
                                color: primaryGreen,
                                fontWeight: FontWeight.bold,
                                fontSize: 13.sp,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              if (_playerCount < 14) setState(() => _playerCount++);
                            },
                            child: Container(
                              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                              decoration: BoxDecoration(color: primaryGreen),
                              child: const Icon(Icons.add, color: Colors.white, size: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 24.h),

              // ── Select Date ───────────────────────
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Date',
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF454555),
                      fontSize: 13.sp,
                    ),
                  ),
                  Row(
                    children: [
                      Text(
                        'January 2026',
                        style: textTheme.bodySmall?.copyWith(
                          color: primaryGreen,
                          fontWeight: FontWeight.w600,
                          fontSize: 12.sp,
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Icon(Icons.keyboard_arrow_down, color: primaryGreen, size: 18),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 16.h),

              // Days List
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: _days.asMap().entries.map((e) {
                  int i = e.key;
                  var day = e.value;
                  bool isSelected = _selectedDayIndex == i;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedDayIndex = i),
                    child: Container(
                      width: 44.w,
                      height: 50.h,
                      decoration: BoxDecoration(
                        color: isSelected ? primaryGreen : Colors.white,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? primaryGreen : primaryGreen.withOpacity(0.4),
                          width: 1.2,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            day.day,
                            style: TextStyle(
                              fontSize: 10.sp,
                              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                              color: isSelected ? Colors.white : primaryGreen,
                            ),
                          ),
                          Text(
                            day.date,
                            style: TextStyle(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.white : primaryGreen,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

              SizedBox(height: 16.h),
              Divider(color: Colors.grey[200], thickness: 1, height: 1),
              SizedBox(height: 20.h),

              // ── Slots Available ─────────────────
              Text(
                'Slots Available',
                style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF454555),
                  fontSize: 13.sp,
                ),
              ),
              SizedBox(height: 16.h),
              Wrap(
                spacing: 12.w,
                runSpacing: 12.h,
                children: _slots.asMap().entries.map((e) {
                  int i = e.key;
                  var slot = e.value;
                  bool isSelected = _selectedSlotIndex == i;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedSlotIndex = i),
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                      decoration: BoxDecoration(
                        color: isSelected ? primaryGreen : Colors.white,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: isSelected ? primaryGreen : primaryGreen.withOpacity(0.4),
                        ),
                      ),
                      child: Text(
                        slot,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey[700],
                          fontSize: 11.sp,
                          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              SizedBox(height: 32.h),

              // ── Continue Button ─────────────────
              SizedBox(
                width: double.infinity,
                height: 48.h,
                child: MyButtons(
                  text: "Continue",
                  height: 48.h, // Ignored since Parent forces height
                  width: double.infinity, // Ignored since Parent forces width
                  onTap: () {},
                  textStyle: textTheme.bodyMedium!.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                  backgroundColor: const Color(0xFFE33A3A), // Match the red from screenshot
                ),
              ),
              
              SizedBox(height: 40.h),
            ],
          ),
        ),
      ),
    );
  }
}



