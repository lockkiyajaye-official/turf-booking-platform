import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/data/services/turf_service.dart';
import 'package:mobile/views/widgets/my_text_field.dart';
import 'package:mobile/views/widgets/my_buttons.dart';

class AddTurfPage extends StatefulWidget {
  const AddTurfPage({super.key});

  @override
  State<AddTurfPage> createState() => _AddTurfPageState();
}

class _AddTurfPageState extends State<AddTurfPage> {
  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _lengthController = TextEditingController();
  final _widthController = TextEditingController();

  final List<String> _allSports = [
    'Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Volleyball',
  ];
  final List<String> _selectedSports = [];

  final List<String> _allAmenities = [
    'Parking', 'Changing Rooms', 'Floodlights', 'Cafeteria',
    'Washrooms', 'First Aid', 'WiFi', 'Water',
  ];
  final List<String> _selectedAmenities = [];

  bool _isLoading = false;

  final TurfService _turfService = TurfService();

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _lengthController.dispose();
    _widthController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    final address = _addressController.text.trim();
    final price = _priceController.text.trim();

    if (name.isEmpty || address.isEmpty || price.isEmpty) {
      Get.snackbar('Error', 'Please fill all required fields',
          backgroundColor: Colors.red.shade100,
          snackPosition: SnackPosition.BOTTOM);
      return;
    }
    if (_selectedSports.isEmpty) {
      Get.snackbar('Error', 'Please select at least one sport',
          backgroundColor: Colors.red.shade100,
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    final token = Get.find<AuthViewmodel>().token.value;
    setState(() => _isLoading = true);

    try {
      final data = <String, dynamic>{
        'name': name,
        'address': address,
        'description': _descriptionController.text.trim(),
        'pricePerHour': double.tryParse(price) ?? 0,
        'sports': _selectedSports,
        'amenities': _selectedAmenities,
        if (_lengthController.text.isNotEmpty &&
            _widthController.text.isNotEmpty)
          'dimensions': {
            'length': double.tryParse(_lengthController.text) ?? 0,
            'width': double.tryParse(_widthController.text) ?? 0,
          },
      };

      final res = await _turfService.createTurf(token: token, data: data);
      if (res['success']) {
        Get.snackbar('Success', 'Turf created successfully!',
            backgroundColor: Colors.green.shade100,
            snackPosition: SnackPosition.BOTTOM);
        Get.back();
      } else {
        Get.snackbar('Error', res['message'] ?? 'Failed to create turf',
            backgroundColor: Colors.red.shade100,
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(),
          backgroundColor: Colors.red.shade100,
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          color: colors.textTitle,
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Add New Turf',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(20.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Basic Info ───────────────────────────────────
            _SectionHeader(title: 'Basic Information', textTheme: textTheme),
            SizedBox(height: 12.h),

            _FieldLabel(label: 'Turf Name *', textTheme: textTheme, colors: colors),
            SizedBox(height: 8.h),
            MyTextField(
              controller: _nameController,
              height: 50.h,
              type: TextInputType.text,
              fillColor: colors.white,
              hintText: 'e.g. Green Arena Football Turf',
              prefixIcon: Icon(Icons.sports_soccer_outlined, color: colors.textGrey),
            ),

            SizedBox(height: 16.h),
            _FieldLabel(label: 'Address *', textTheme: textTheme, colors: colors),
            SizedBox(height: 8.h),
            MyTextField(
              controller: _addressController,
              height: 50.h,
              type: TextInputType.streetAddress,
              fillColor: colors.white,
              hintText: 'Full address',
              prefixIcon: Icon(Icons.location_on_outlined, color: colors.textGrey),
            ),

            SizedBox(height: 16.h),
            _FieldLabel(label: 'Description', textTheme: textTheme, colors: colors),
            SizedBox(height: 8.h),
            Container(
              decoration: BoxDecoration(
                color: colors.white,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE8E8E8)),
              ),
              child: TextField(
                controller: _descriptionController,
                maxLines: 3,
                style: textTheme.bodyMedium,
                decoration: InputDecoration(
                  hintText: 'Describe your turf...',
                  hintStyle: TextStyle(color: colors.textGrey, fontSize: 14.sp),
                  contentPadding: EdgeInsets.all(14.w),
                  border: InputBorder.none,
                ),
              ),
            ),

            SizedBox(height: 24.h),

            // ── Pricing ──────────────────────────────────────
            _SectionHeader(title: 'Pricing', textTheme: textTheme),
            SizedBox(height: 12.h),

            _FieldLabel(label: 'Price per Hour (₹) *', textTheme: textTheme, colors: colors),
            SizedBox(height: 8.h),
            MyTextField(
              controller: _priceController,
              height: 50.h,
              type: TextInputType.number,
              fillColor: colors.white,
              hintText: 'e.g. 800',
              prefixIcon: Icon(Icons.currency_rupee_rounded, color: colors.textGrey),
            ),

            SizedBox(height: 24.h),

            // ── Dimensions ───────────────────────────────────
            _SectionHeader(title: 'Dimensions (optional)', textTheme: textTheme),
            SizedBox(height: 12.h),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _FieldLabel(label: 'Length (m)', textTheme: textTheme, colors: colors),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _lengthController,
                        height: 50.h,
                        type: TextInputType.number,
                        fillColor: colors.white,
                        hintText: '100',
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 12.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _FieldLabel(label: 'Width (m)', textTheme: textTheme, colors: colors),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _widthController,
                        height: 50.h,
                        type: TextInputType.number,
                        fillColor: colors.white,
                        hintText: '64',
                      ),
                    ],
                  ),
                ),
              ],
            ),

            SizedBox(height: 24.h),

            // ── Sports ───────────────────────────────────────
            _SectionHeader(title: 'Sports Available *', textTheme: textTheme),
            SizedBox(height: 12.h),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: _allSports.map((sport) {
                final selected = _selectedSports.contains(sport);
                return GestureDetector(
                  onTap: () => setState(() {
                    selected
                        ? _selectedSports.remove(sport)
                        : _selectedSports.add(sport);
                  }),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: EdgeInsets.symmetric(
                        horizontal: 14.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: selected ? colors.primary : colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: selected
                            ? colors.primary
                            : const Color(0xFFE8E8E8),
                      ),
                    ),
                    child: Text(
                      sport,
                      style: textTheme.bodySmall?.copyWith(
                        color: selected ? Colors.white : colors.textGrey,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            SizedBox(height: 24.h),

            // ── Amenities ────────────────────────────────────
            _SectionHeader(title: 'Amenities', textTheme: textTheme),
            SizedBox(height: 12.h),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: _allAmenities.map((amenity) {
                final selected = _selectedAmenities.contains(amenity);
                return GestureDetector(
                  onTap: () => setState(() {
                    selected
                        ? _selectedAmenities.remove(amenity)
                        : _selectedAmenities.add(amenity);
                  }),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: EdgeInsets.symmetric(
                        horizontal: 14.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: selected
                          ? const Color(0xFF4F46E5)
                          : colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: selected
                            ? const Color(0xFF4F46E5)
                            : const Color(0xFFE8E8E8),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (selected) ...[
                          const Icon(Icons.check_rounded,
                              size: 14, color: Colors.white),
                          SizedBox(width: 4.w),
                        ],
                        Text(
                          amenity,
                          style: textTheme.bodySmall?.copyWith(
                            color:
                                selected ? Colors.white : colors.textGrey,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),

            SizedBox(height: 32.h),

            // ── Submit ───────────────────────────────────────
            MyButtons(
              text: _isLoading ? 'Creating Turf...' : 'Create Turf',
              height: 52.h,
              width: double.infinity,
              onTap: _isLoading ? null : _submit,
              textStyle: textTheme.bodyMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
              backgroundColor: _isLoading
                  ? const Color(0xFFE43434).withOpacity(0.5)
                  : const Color(0xFFE43434),
            ),

            SizedBox(height: 32.h),
          ],
        ),
      ),
    );
  }
}

// ── Shared widgets ───────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  final String title;
  final TextTheme textTheme;
  const _SectionHeader({required this.title, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String label;
  final TextTheme textTheme;
  final AppColors colors;
  const _FieldLabel(
      {required this.label,
      required this.textTheme,
      required this.colors});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: textTheme.bodySmall?.copyWith(
        fontWeight: FontWeight.w600,
        color: colors.textTitle,
      ),
    );
  }
}