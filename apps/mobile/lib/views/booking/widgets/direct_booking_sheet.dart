import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';

void showDirectBookingModal(
  BuildContext context, {
  required OwnerViewmodel vm,
  TurfModel? preselectedTurf,
}) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) =>
        DirectBookingSheet(vm: vm, preselectedTurf: preselectedTurf),
  );
}

class DirectBookingSheet extends StatefulWidget {
  final OwnerViewmodel vm;
  final TurfModel? preselectedTurf;

  const DirectBookingSheet({super.key, required this.vm, this.preselectedTurf});

  @override
  State<DirectBookingSheet> createState() => _DirectBookingSheetState();
}

class _DirectBookingSheetState extends State<DirectBookingSheet> {
  TurfModel? _selectedTurf;
  DateTime _selectedDate = DateTime.now();
  String? _selectedSlot;
  List<String> _bookedSlots = [];
  bool _isLoadingSlots = false;
  bool _isSubmitting = false;
  int _fetchRequestId = 0;

  final TextEditingController _nameCtrl = TextEditingController();
  final TextEditingController _phoneCtrl = TextEditingController();
  final TextEditingController _priceCtrl = TextEditingController();
  final TextEditingController _notesCtrl = TextEditingController();

  String _paymentMethod = 'cash';

  @override
  void initState() {
    super.initState();
    _initTurf();
  }

  void _initTurf() {
    _selectedTurf = widget.preselectedTurf;
    if (_selectedTurf == null && widget.vm.myTurfs.isNotEmpty) {
      _selectedTurf = widget.vm.myTurfs.first;
    }

    if (_selectedTurf != null) {
      _priceCtrl.text = _selectedTurf!.pricePerHour.toStringAsFixed(0);
      _fetchBookedSlots();
    }
  }

  bool _isSlotBooked(String slot) {
    if (_bookedSlots.isEmpty) return false;
    final clean = slot.replaceAll(RegExp(r'\s+'), '').toLowerCase();
    return _bookedSlots.any((b) {
      final cleanB = b.replaceAll(RegExp(r'\s+'), '').toLowerCase();
      return cleanB == clean ||
          cleanB.contains(clean) ||
          clean.contains(cleanB);
    });
  }

  Future<void> _fetchBookedSlots() async {
    if (_selectedTurf == null) return;
    final currentRequestId = ++_fetchRequestId;
    setState(() {
      _isLoadingSlots = true;
      _selectedSlot = null;
    });

    final dateStr = _selectedDate.toIso8601String().split('T').first;
    final results = await Future.wait([
      widget.vm.fetchBookedSlots(_selectedTurf!.id, dateStr),
      // Minimum duration to guarantee user sees the smooth shimmer loading animation
      Future.delayed(const Duration(milliseconds: 350)),
    ]);

    if (!mounted || currentRequestId != _fetchRequestId) return;

    final slots = results[0] as List<String>;
    setState(() {
      _bookedSlots = slots;
      _isLoadingSlots = false;
    });
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _priceCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      _fetchBookedSlots();
    }
  }

  Future<void> _submitDirectBooking() async {
    if (_selectedTurf == null) {
      Get.snackbar('Error', 'Please select a turf');
      return;
    }
    if (_selectedSlot == null) {
      Get.snackbar('Error', 'Please select an available time slot');
      return;
    }
    if (_nameCtrl.text.trim().isEmpty) {
      Get.snackbar('Error', 'Please enter customer name');
      return;
    }

    final slotParts = _selectedSlot!.split('-');
    final startTime = slotParts[0].trim();
    final endTime = slotParts.length > 1 ? slotParts[1].trim() : '';

    setState(() {
      _isSubmitting = true;
    });

    final dateStr = _selectedDate.toIso8601String().split('T').first;
    final customPrice = double.tryParse(_priceCtrl.text.trim());

    final success = await widget.vm.createDirectBooking(
      turfId: _selectedTurf!.id,
      bookingDate: dateStr,
      startTime: startTime,
      endTime: endTime,
      customerName: _nameCtrl.text.trim(),
      customerPhone: _phoneCtrl.text.trim(),
      customPrice: customPrice,
      paymentMethod: _paymentMethod,
      notes: _notesCtrl.text.trim(),
    );

    if (mounted) {
      setState(() {
        _isSubmitting = false;
      });
      if (success) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final availableSlots = _selectedTurf?.availableSlots ?? [];
    final dateDisplay =
        '${_selectedDate.day.toString().padLeft(2, '0')}/${_selectedDate.month.toString().padLeft(2, '0')}/${_selectedDate.year}';

    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth >= 600;
    final double sheetPadding = 20.w * 2;
    final double availableWidth = screenWidth - sheetPadding;
    final int slotColumns = isTablet ? (screenWidth >= 1050 ? 5 : 4) : 3;
    final double slotSpacing = 8.w;
    final double slotRunSpacing = 8.h;
    final double slotItemWidth =
        (availableWidth - ((slotColumns - 1) * slotSpacing)) / slotColumns;
    final double slotItemHeight = 38.h;

    return Container(
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20.h,
        left: 20.w,
        right: 20.w,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20.h,
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.88,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(8.w),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3E8FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.storefront_rounded,
                  color: Color(0xFF7E22CE),
                  size: 22,
                ),
              ),
              SizedBox(width: 12.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Mark Direct Booking',
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: colors.textTitle,
                      ),
                    ),
                    Text(
                      'Lock slot for offline/walk-in players',
                      style: textTheme.bodySmall?.copyWith(
                        color: colors.textGrey,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),

          SizedBox(height: 12.h),

          // Offline disclaimer banner
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
            decoration: BoxDecoration(
              color: const Color(0xFFFBF7FF),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE9D5FF)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.info_outline_rounded,
                  color: Color(0xFF7E22CE),
                  size: 16,
                ),
                SizedBox(width: 8.w),
                Expanded(
                  child: Text(
                    'Direct payment is collected by you offline. It will not be added to your app wallet balance.',
                    style: TextStyle(
                      fontSize: 11.sp,
                      color: const Color(0xFF6B21A8),
                      height: 1.3,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: 14.h),

          // Scrollable fields
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Turf Picker
                  if (widget.vm.myTurfs.length > 1) ...[
                    Text(
                      'TURF FACILITY',
                      style: TextStyle(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w700,
                        color: colors.textGrey,
                        letterSpacing: 0.5,
                      ),
                    ),
                    SizedBox(height: 6.h),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 14.w),
                      decoration: BoxDecoration(
                        color: colors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE8E8E8)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<TurfModel>(
                          isExpanded: true,
                          value: _selectedTurf,
                          items: widget.vm.myTurfs.map((turf) {
                            return DropdownMenuItem<TurfModel>(
                              value: turf,
                              child: Text(
                                '${turf.name} (₹${turf.pricePerHour.toStringAsFixed(0)}/hr)',
                                style: textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _selectedTurf = val;
                                _priceCtrl.text = val.pricePerHour
                                    .toStringAsFixed(0);
                              });
                              _fetchBookedSlots();
                            }
                          },
                        ),
                      ),
                    ),
                    SizedBox(height: 14.h),
                  ],

                  // Date Picker Row
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'BOOKING DATE',
                              style: TextStyle(
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w700,
                                color: colors.textGrey,
                                letterSpacing: 0.5,
                              ),
                            ),
                            SizedBox(height: 6.h),
                            InkWell(
                              onTap: _pickDate,
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 14.w,
                                  vertical: 12.h,
                                ),
                                decoration: BoxDecoration(
                                  color: colors.background,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFFE8E8E8),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.calendar_today_rounded,
                                      size: 16.sp,
                                      color: colors.primary,
                                    ),
                                    SizedBox(width: 8.w),
                                    Text(
                                      dateDisplay,
                                      style: textTheme.bodyMedium?.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const Spacer(),
                                    Icon(
                                      Icons.edit_calendar_rounded,
                                      size: 16.sp,
                                      color: colors.textGrey,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 14.h),

                  // Slots Selection
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'SELECT SLOT (12-HOUR)',
                        style: TextStyle(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w700,
                          color: colors.textGrey,
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (_isLoadingSlots)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: 12.w,
                              height: 12.w,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  colors.primary,
                                ),
                              ),
                            ),
                            SizedBox(width: 6.w),
                            Text(
                              'Checking...',
                              style: textTheme.bodySmall?.copyWith(
                                color: colors.primary,
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                  SizedBox(height: 8.h),

                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 200),
                    child: _isLoadingSlots
                        ? Wrap(
                            key: const ValueKey('direct_slots_loading'),
                            spacing: slotSpacing,
                            runSpacing: slotRunSpacing,
                            children:
                                (availableSlots.isNotEmpty
                                        ? availableSlots
                                        : const [
                                            '09:00-10:00',
                                            '10:00-11:00',
                                            '11:00-12:00',
                                            '12:00-13:00',
                                            '13:00-14:00',
                                            '14:00-15:00',
                                          ])
                                    .map(
                                      (slot) => _ShimmerSlotCard(
                                        text: TimeHelper.formatTo12Hour(slot),
                                        width: slotItemWidth,
                                        height: slotItemHeight,
                                        primaryColor: colors.primary,
                                      ),
                                    )
                                    .toList(),
                          )
                        : availableSlots.isEmpty
                        ? Container(
                            key: const ValueKey('direct_slots_empty'),
                            width: double.infinity,
                            padding: EdgeInsets.all(12.w),
                            decoration: BoxDecoration(
                              color: colors.background,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              'No slots configured for this turf yet.',
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: colors.textGrey,
                              ),
                            ),
                          )
                        : Wrap(
                            key: const ValueKey('direct_slots_loaded'),
                            spacing: slotSpacing,
                            runSpacing: slotRunSpacing,
                            children: availableSlots.map((slot) {
                              final isBooked = _isSlotBooked(slot);
                              final isSelected = _selectedSlot == slot;
                              final displayTime = TimeHelper.formatTo12Hour(
                                slot,
                              );

                              return GestureDetector(
                                onTap: isBooked
                                    ? null
                                    : () {
                                        setState(() {
                                          _selectedSlot = isSelected
                                              ? null
                                              : slot;
                                        });
                                      },
                                child: Container(
                                  width: slotItemWidth,
                                  height: slotItemHeight,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    color: isBooked
                                        ? const Color(0xFFF0F0F0)
                                        : (isSelected
                                              ? colors.primary
                                              : Colors.white),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                      color: isBooked
                                          ? const Color(0xFFD0D0D0)
                                          : (isSelected
                                                ? colors.primary
                                                : colors.primary.withValues(
                                                    alpha: 0.4,
                                                  )),
                                    ),
                                  ),
                                  child: Text(
                                    displayTime,
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: isBooked
                                          ? Colors.grey[400]
                                          : (isSelected
                                                ? Colors.white
                                                : Colors.grey[700]),
                                      fontSize: 11.sp,
                                      fontWeight: isSelected
                                          ? FontWeight.w600
                                          : FontWeight.w500,
                                      decoration: isBooked
                                          ? TextDecoration.lineThrough
                                          : TextDecoration.none,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                  ),

                  SizedBox(height: 16.h),

                  // Customer Name & Phone
                  Text(
                    'CUSTOMER DETAILS',
                    style: TextStyle(
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w700,
                      color: colors.textGrey,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 6.h),
                  TextField(
                    controller: _nameCtrl,
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: colors.textTitle,
                      fontWeight: FontWeight.w500,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Customer Name (e.g. Vikram Sharma)',
                      hintStyle: TextStyle(
                        color: colors.textGrey,
                        fontSize: 13.sp,
                        fontWeight: FontWeight.normal,
                      ),
                      filled: true,
                      fillColor: colors.background,
                      prefixIcon: Icon(
                        Icons.person_outline_rounded,
                        color: colors.textGrey,
                        size: 20.sp,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 14.w,
                        vertical: 12.h,
                      ),
                    ),
                  ),
                  SizedBox(height: 8.h),
                  TextField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: colors.textTitle,
                      fontWeight: FontWeight.w500,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Phone Number (Optional)',
                      hintStyle: TextStyle(
                        color: colors.textGrey,
                        fontSize: 13.sp,
                        fontWeight: FontWeight.normal,
                      ),
                      filled: true,
                      fillColor: colors.background,
                      prefixIcon: Icon(
                        Icons.phone_outlined,
                        color: colors.textGrey,
                        size: 20.sp,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 14.w,
                        vertical: 12.h,
                      ),
                    ),
                  ),

                  SizedBox(height: 14.h),

                  // Price & Mode
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'TOTAL PRICE (₹)',
                              style: TextStyle(
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w700,
                                color: colors.textGrey,
                                letterSpacing: 0.5,
                              ),
                            ),
                            SizedBox(height: 6.h),
                            TextField(
                              controller: _priceCtrl,
                              keyboardType: TextInputType.number,
                              style: TextStyle(
                                fontSize: 13.sp,
                                color: colors.textTitle,
                                fontWeight: FontWeight.bold,
                              ),
                              decoration: InputDecoration(
                                hintText: 'Rate',
                                hintStyle: TextStyle(
                                  color: colors.textGrey,
                                  fontSize: 13.sp,
                                  fontWeight: FontWeight.normal,
                                ),
                                prefixText: '₹ ',
                                prefixStyle: TextStyle(
                                  color: colors.textTitle,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13.sp,
                                ),
                                filled: true,
                                fillColor: colors.background,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xFFE8E8E8),
                                  ),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                    color: Color(0xFFE8E8E8),
                                  ),
                                ),
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 14.w,
                                  vertical: 12.h,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PAYMENT MODE',
                              style: TextStyle(
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w700,
                                color: colors.textGrey,
                                letterSpacing: 0.5,
                              ),
                            ),
                            SizedBox(height: 6.h),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 12.w),
                              decoration: BoxDecoration(
                                color: colors.background,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: const Color(0xFFE8E8E8),
                                ),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  isExpanded: true,
                                  value: _paymentMethod,
                                  items: const [
                                    DropdownMenuItem(
                                      value: 'cash',
                                      child: Text('Cash at Venue'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'direct_upi',
                                      child: Text('Direct UPI'),
                                    ),
                                    DropdownMenuItem(
                                      value: 'offline',
                                      child: Text('Other Offline'),
                                    ),
                                  ],
                                  onChanged: (val) {
                                    if (val != null) {
                                      setState(() {
                                        _paymentMethod = val;
                                      });
                                    }
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 14.h),

                  // Notes
                  Text(
                    'NOTES (OPTIONAL)',
                    style: TextStyle(
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w700,
                      color: colors.textGrey,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 6.h),
                  TextField(
                    controller: _notesCtrl,
                    maxLines: 2,
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: colors.textTitle,
                      fontWeight: FontWeight.normal,
                    ),
                    decoration: InputDecoration(
                      hintText: 'e.g. Phone booking, advance collected',
                      hintStyle: TextStyle(
                        color: colors.textGrey,
                        fontSize: 13.sp,
                        fontWeight: FontWeight.normal,
                      ),
                      filled: true,
                      fillColor: colors.background,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE8E8E8)),
                      ),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 14.w,
                        vertical: 10.h,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          SizedBox(height: 14.h),

          // Confirm Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _submitDirectBooking,
              icon: _isSubmitting
                  ? SizedBox(
                      width: 16.w,
                      height: 16.h,
                      child: const CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.check_circle_rounded, color: Colors.white),
              label: Text(
                _isSubmitting ? 'Locking Slot...' : 'Confirm & Lock Slot',
                style: textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: colors.primary,
                padding: EdgeInsets.symmetric(vertical: 14.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ShimmerSlotCard extends StatefulWidget {
  final String text;
  final double width;
  final double height;
  final Color primaryColor;

  const _ShimmerSlotCard({
    required this.text,
    required this.width,
    required this.height,
    required this.primaryColor,
  });

  @override
  State<_ShimmerSlotCard> createState() => _ShimmerSlotCardState();
}

class _ShimmerSlotCardState extends State<_ShimmerSlotCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1300),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final val = _controller.value;
        return Container(
          width: widget.width,
          height: widget.height,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: widget.primaryColor.withValues(alpha: 0.35),
            ),
            gradient: LinearGradient(
              begin: Alignment(-2.2 + val * 4.4, 0),
              end: Alignment(-0.6 + val * 4.4, 0),
              colors: [
                Colors.white,
                widget.primaryColor.withValues(alpha: 0.12),
                Colors.white,
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
          ),
          child: Text(
            widget.text,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 11.sp,
              fontWeight: FontWeight.w500,
              letterSpacing: -0.2,
            ),
          ),
        );
      },
    );
  }
}
