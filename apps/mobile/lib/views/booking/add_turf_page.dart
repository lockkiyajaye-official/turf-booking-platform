import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/services/turf_service.dart';
import 'package:mobile/data/services/uploadcare_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/owner_detail_page.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';
import 'package:mobile/views/widgets/state_selection_sheet.dart';

class AddTurfPage extends StatefulWidget {
  const AddTurfPage({super.key});

  @override
  State<AddTurfPage> createState() => _AddTurfPageState();
}

class _AddTurfPageState extends State<AddTurfPage> {
  final _nameController = TextEditingController();
  final _priceController = TextEditingController();
  final _descriptionController = TextEditingController();

  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  String? _selectedState;
  final _pincodeController = TextEditingController();
  final _capacityController = TextEditingController();
  final _latitudeController = TextEditingController();
  final _longitudeController = TextEditingController();
  final _mapUrlController = TextEditingController();

  final _contactPhoneController = TextEditingController();
  final _contactEmailController = TextEditingController();
  final _rulesController = TextEditingController();
  final _slotSearchController = TextEditingController();

  final bool _cancellationPolicyEnabled = true;
  final _fullRefundHoursController = TextEditingController(text: '24');
  final _partialRefundHoursController = TextEditingController(text: '6');
  final _partialRefundPercentageController = TextEditingController(text: '50');

  final List<String> _allSports = [
    'Football',
    'Cricket',
    'Basketball',
    'Badminton',
    'Tennis',
    'Volleyball',
    'Hockey',
    'Rugby',
    'Table Tennis',
    'Squash',
    'Futsal',
  ];
  final List<String> _selectedSports = [];

  final List<String> _surfaceTypes = [
    'Artificial Turf',
    'Natural Grass',
    'Hybrid Grass',
    'Concrete',
    'Clay',
    'Synthetic',
  ];
  String _selectedSurfaceType = 'Artificial Turf';

  final List<String> _allAmenities = [
    'Parking',
    'Floodlights',
    'Changing Rooms',
    'Showers',
    'Drinking Water',
    'First Aid',
    'Cafeteria',
    'WiFi',
    'CCTV',
    'Referee Available',
    'Equipment Rental',
    'Spectator Seating',
    'Restrooms',
    'Security',
  ];
  final List<String> _selectedAmenities = [];

  final List<Map<String, dynamic>> _durationOptions = [
    {'label': '30 Mins', 'minutes': 30},
    {'label': '45 Mins', 'minutes': 45},
    {'label': '60 Mins (1 Hr)', 'minutes': 60},
    {'label': '90 Mins (1.5 Hr)', 'minutes': 90},
    {'label': '120 Mins (2 Hr)', 'minutes': 120},
  ];
  int _selectedDuration = 60;

  String _formatTime12H(int totalMins) {
    final h24 = (totalMins ~/ 60) % 24;
    final m = totalMins % 60;
    final period = h24 >= 12 ? 'PM' : 'AM';
    final h12 = h24 % 12 == 0 ? 12 : h24 % 12;
    final hStr = h12.toString().padLeft(2, '0');
    final mStr = m.toString().padLeft(2, '0');
    return '$hStr:$mStr $period';
  }

  int _parseStartMinutes12H(String slotStr) {
    final startPart = slotStr.split(' - ').first;
    final parts = startPart.split(' ');
    if (parts.length < 2) return 0;
    final timeStr = parts[0];
    final period = parts[1];
    final timeParts = timeStr.split(':');
    if (timeParts.length < 2) return 0;
    var h = int.tryParse(timeParts[0]) ?? 0;
    final m = int.tryParse(timeParts[1]) ?? 0;
    if (period == 'PM' && h < 12) h += 12;
    if (period == 'AM' && h == 12) h = 0;
    return h * 60 + m;
  }

  List<String> _generate24hSlots(int durationMinutes) {
    final List<String> slots = [];
    const totalMinutes = 24 * 60;
    int current = 0;
    while (current + durationMinutes <= totalMinutes) {
      final startStr = _formatTime12H(current);
      final endStr = _formatTime12H(current + durationMinutes);
      slots.add('$startStr - $endStr');
      current += durationMinutes;
    }
    return slots;
  }

  late List<String> _currentGeneratedSlots = _generate24hSlots(60);
  late List<String> _selectedSlots = List<String>.from(_currentGeneratedSlots);
  String _slotSearch = '';

  // ── Turf Image State ─────────────────────────────────────
  final ImagePicker _picker = ImagePicker();
  final List<String> _imageUrls = [];
  int _primaryImageIndex = 0;

  bool _isLoading = false;
  bool _isUploadingImages = false;
  final TurfService _turfService = TurfService();
  final UploadcareService _uploadcareService = UploadcareService();

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    _descriptionController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _capacityController.dispose();
    _latitudeController.dispose();
    _longitudeController.dispose();
    _mapUrlController.dispose();
    _contactPhoneController.dispose();
    _contactEmailController.dispose();
    _rulesController.dispose();
    _slotSearchController.dispose();
    _fullRefundHoursController.dispose();
    _partialRefundHoursController.dispose();
    _partialRefundPercentageController.dispose();
    super.dispose();
  }

  // ── Image Picker Helpers ─────────────────────────────────
  Future<void> _pickImage(ImageSource source) async {
    try {
      if (source == ImageSource.gallery) {
        final List<XFile> files = await _picker.pickMultiImage(
          imageQuality: 80,
        );
        if (files.isEmpty) return;

        setState(() => _isUploadingImages = true);
        try {
          for (final file in files) {
            final res = await _uploadcareService.uploadXFile(file);
            if (mounted) {
              setState(() {
                _imageUrls.add(res.cdnUrl);
              });
            }
          }
        } finally {
          if (mounted) setState(() => _isUploadingImages = false);
        }
      } else {
        final XFile? file = await _picker.pickImage(
          source: source,
          imageQuality: 80,
        );
        if (file == null) return;

        setState(() => _isUploadingImages = true);
        try {
          final res = await _uploadcareService.uploadXFile(file);
          if (mounted) {
            setState(() {
              _imageUrls.add(res.cdnUrl);
            });
          }
        } finally {
          if (mounted) setState(() => _isUploadingImages = false);
        }
      }
    } catch (e) {
      if (mounted) setState(() => _isUploadingImages = false);
      Get.snackbar(
        'Upload Error',
        'Could not upload image to Uploadcare: $e',
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  void _showAddUrlDialog() {
    final urlController = TextEditingController();
    Get.defaultDialog(
      title: 'Add Image URL',
      content: Padding(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
        child: TextField(
          controller: urlController,
          decoration: const InputDecoration(
            hintText: 'https://example.com/image.jpg',
            border: OutlineInputBorder(),
          ),
        ),
      ),
      textConfirm: 'Add',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFFE43434),
      onConfirm: () {
        final text = urlController.text.trim();
        if (text.isNotEmpty) {
          setState(() {
            _imageUrls.add(text);
          });
          Get.back();
        }
      },
    );
  }

  void _showImageSourcePicker(AppColors colors, TextTheme textTheme) {
    Get.bottomSheet(
      Material(
        color: colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        clipBehavior: Clip.antiAlias,
        child: SafeArea(
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40.w,
                  height: 4.h,
                  margin: EdgeInsets.only(bottom: 16.h),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0E0E0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Text(
                  'Upload Turf Photo',
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: colors.textTitle,
                  ),
                ),
                SizedBox(height: 16.h),
                ListTile(
                  leading: Container(
                    padding: EdgeInsets.all(8.w),
                    decoration: BoxDecoration(
                      color: colors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.camera_alt_rounded,
                      color: colors.primary,
                    ),
                  ),
                  title: Text('Take Photo', style: textTheme.bodyMedium),
                  onTap: () {
                    Get.back();
                    _pickImage(ImageSource.camera);
                  },
                ),
                ListTile(
                  leading: Container(
                    padding: EdgeInsets.all(8.w),
                    decoration: BoxDecoration(
                      color: colors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.photo_library_rounded,
                      color: colors.primary,
                    ),
                  ),
                  title: Text(
                    'Choose from Gallery',
                    style: textTheme.bodyMedium,
                  ),
                  onTap: () {
                    Get.back();
                    _pickImage(ImageSource.gallery);
                  },
                ),
                ListTile(
                  leading: Container(
                    padding: EdgeInsets.all(8.w),
                    decoration: BoxDecoration(
                      color: colors.primary.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.link_rounded, color: colors.primary),
                  ),
                  title: Text('Paste Image URL', style: textTheme.bodyMedium),
                  onTap: () {
                    Get.back();
                    _showAddUrlDialog();
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_isLoading) return;

    final name = _nameController.text.trim();
    final address = _addressController.text.trim();
    final price = _priceController.text.trim();

    if (name.isEmpty || address.isEmpty || price.isEmpty) {
      Get.snackbar(
        'Error',
        'Please fill all required fields (*)',
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    if (_selectedSports.isEmpty) {
      Get.snackbar(
        'Error',
        'Please select at least one sport',
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    if (_selectedSlots.isEmpty) {
      Get.snackbar(
        'Error',
        'Please select at least one available time slot',
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    if (_isUploadingImages) {
      Get.snackbar(
        'Please wait',
        'Photos are currently uploading to Uploadcare...',
        backgroundColor: Colors.amber.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final token = Get.find<AuthViewmodel>().token.value;
    setState(() => _isLoading = true);

    try {
      final List<String> uploadedImages = [];
      for (final img in _imageUrls) {
        if (img.startsWith('http://') || img.startsWith('https://')) {
          uploadedImages.add(UploadcareService.normalizeCdnUrl(img));
        } else {
          final res = await _uploadcareService.uploadFile(File(img));
          uploadedImages.add(res.cdnUrl);
        }
      }

      final List<String> orderedImages = List<String>.from(uploadedImages);
      if (orderedImages.isNotEmpty &&
          _primaryImageIndex < orderedImages.length) {
        final primary = orderedImages.removeAt(_primaryImageIndex);
        orderedImages.insert(0, primary);
      }

      final data = <String, dynamic>{
        'name': name,
        'pricePerHour': double.tryParse(price) ?? 0,
        'description': _descriptionController.text.trim(),
        'address': address,
        'city': _cityController.text.trim(),
        'state': _selectedState ?? _stateController.text.trim(),
        'pincode': _pincodeController.text.trim(),
        'capacity': int.tryParse(_capacityController.text.trim()),
        'surfaceType': _selectedSurfaceType,
        'sports': _selectedSports,
        'amenities': _selectedAmenities,
        'availableSlots': _selectedSlots,
        'images': orderedImages,
        'primaryImageIndex': 0,
        'rules': _rulesController.text.trim(),
        'contactPhone': _contactPhoneController.text.trim(),
        'contactEmail': _contactEmailController.text.trim(),
        'cancellationPolicyEnabled': _cancellationPolicyEnabled,
        'fullRefundHours':
            int.tryParse(_fullRefundHoursController.text.trim()) ?? 24,
        'partialRefundHours':
            int.tryParse(_partialRefundHoursController.text.trim()) ?? 6,
        'partialRefundPercentage':
            double.tryParse(_partialRefundPercentageController.text.trim()) ??
            50.0,
        if (_latitudeController.text.isNotEmpty)
          'latitude': double.tryParse(_latitudeController.text.trim()),
        if (_longitudeController.text.isNotEmpty)
          'longitude': double.tryParse(_longitudeController.text.trim()),
        if (_mapUrlController.text.trim().isNotEmpty) ...{
          'googleMapUrl': _mapUrlController.text.trim(),
          'mapUrl': _mapUrlController.text.trim(),
        },
      };

      final res = await _turfService.createTurf(token: token, data: data);
      if (res['success']) {
        if (Get.isRegistered<OwnerViewmodel>()) {
          Get.find<OwnerViewmodel>().fetchMyTurfs();
        }
        Get.snackbar(
          'Success',
          'Turf created successfully!',
          backgroundColor: Colors.green.shade100,
          snackPosition: SnackPosition.BOTTOM,
        );

        final turfData = res['data'] is Map<String, dynamic>
            ? (res['data']['turf'] is Map<String, dynamic>
                  ? res['data']['turf'] as Map<String, dynamic>
                  : res['data'] as Map<String, dynamic>)
            : null;

        final newTurf = turfData != null ? TurfModel.fromJson(turfData) : null;

        if (newTurf != null) {
          // Replace create page with detail page to prevent re-submitting on back
          Get.off(() => OwnerTurfDetailPage(turf: newTurf));
        } else {
          Get.back();
        }
      } else {
        Get.snackbar(
          'Error',
          res['message'] ?? 'Failed to create turf',
          backgroundColor: Colors.red.shade100,
          snackPosition: SnackPosition.BOTTOM,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    final filteredSlots = _currentGeneratedSlots
        .where((s) => s.toLowerCase().contains(_slotSearch.toLowerCase()))
        .toList();

    return PopScope(
      canPop: !_isLoading,
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          backgroundColor: colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
            color: colors.textTitle,
            onPressed: _isLoading ? null : () => Get.back(),
          ),
          title: Text(
            'Create New Listing',
            style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
          ),
          centerTitle: true,
        ),
        body: Stack(
          children: [
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 860),
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(20.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Section 1: Photos ─────────────────────────────
                      _SectionHeader(title: 'Photos', textTheme: textTheme),
                      SizedBox(height: 4.h),
                      Text(
                        'Upload photos for this turf. Tap any image to set as Primary Cover.',
                        style: textTheme.bodySmall?.copyWith(
                          color: colors.textGrey,
                          fontSize: 11.sp,
                        ),
                      ),
                      SizedBox(height: 12.h),

                      // Upload Button & Thumbnail Grid
                      SizedBox(
                        height: 110.h,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount:
                              _imageUrls.length +
                              1 +
                              (_isUploadingImages ? 1 : 0),
                          itemBuilder: (context, index) {
                            if (_isUploadingImages &&
                                index == _imageUrls.length) {
                              return Container(
                                width: 100.w,
                                margin: EdgeInsets.only(right: 10.w),
                                decoration: BoxDecoration(
                                  color: colors.background,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFFE0E0E0),
                                  ),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    SizedBox(
                                      width: 24.w,
                                      height: 24.w,
                                      child: const CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Color(0xFFE43434),
                                      ),
                                    ),
                                    SizedBox(height: 6.h),
                                    Text(
                                      'Uploading...',
                                      style: TextStyle(
                                        color: colors.textGrey,
                                        fontSize: 10.sp,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }

                            if (index ==
                                _imageUrls.length +
                                    (_isUploadingImages ? 1 : 0)) {
                              return GestureDetector(
                                onTap: _isUploadingImages
                                    ? null
                                    : () => _showImageSourcePicker(
                                        colors,
                                        textTheme,
                                      ),
                                child: Container(
                                  width: 100.w,
                                  margin: EdgeInsets.only(right: 10.w),
                                  decoration: BoxDecoration(
                                    color: colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: const Color(0xFFE43434),
                                      style: BorderStyle.solid,
                                      width: 1.5,
                                    ),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.add_a_photo_outlined,
                                        color: const Color(0xFFE43434),
                                        size: 28.sp,
                                      ),
                                      SizedBox(height: 6.h),
                                      Text(
                                        '+ Add Photo',
                                        style: TextStyle(
                                          color: const Color(0xFFE43434),
                                          fontSize: 11.sp,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }

                            final path = _imageUrls[index];
                            final isPrimary = index == _primaryImageIndex;

                            return GestureDetector(
                              onTap: () =>
                                  setState(() => _primaryImageIndex = index),
                              child: Container(
                                width: 100.w,
                                margin: EdgeInsets.only(right: 10.w),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isPrimary
                                        ? const Color(0xFFE43434)
                                        : const Color(0xFFE0E0E0),
                                    width: isPrimary ? 2.5 : 1,
                                  ),
                                ),
                                child: Stack(
                                  children: [
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: SizedBox(
                                        width: double.infinity,
                                        height: double.infinity,
                                        child: _buildImageWidget(path),
                                      ),
                                    ),
                                    if (isPrimary)
                                      Positioned(
                                        top: 6.h,
                                        left: 6.w,
                                        child: Container(
                                          padding: EdgeInsets.symmetric(
                                            horizontal: 6.w,
                                            vertical: 2.h,
                                          ),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFE43434),
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                          child: Text(
                                            '★ Cover',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 9.sp,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ),
                                    Positioned(
                                      top: 4.h,
                                      right: 4.w,
                                      child: GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            _imageUrls.removeAt(index);
                                            if (_primaryImageIndex >=
                                                _imageUrls.length) {
                                              _primaryImageIndex = 0;
                                            }
                                          });
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(
                                            color: Colors.black54,
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.close_rounded,
                                            color: Colors.white,
                                            size: 12,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 2: Basic Information ──────────────────
                      _SectionHeader(
                        title: 'Basic Information',
                        textTheme: textTheme,
                      ),
                      SizedBox(height: 12.h),

                      _FieldLabel(
                        label: 'Turf Name *',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _nameController,
                        height: 50.h,
                        type: TextInputType.text,
                        fillColor: colors.white,
                        hintText: 'e.g. Green Arena Football Ground',
                        prefixIcon: Icon(
                          Icons.sports_soccer_outlined,
                          color: colors.textGrey,
                        ),
                      ),

                      SizedBox(height: 16.h),
                      _FieldLabel(
                        label: 'Price per Hour (₹) *',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _priceController,
                        height: 50.h,
                        type: TextInputType.number,
                        fillColor: colors.white,
                        hintText: 'e.g. 1500',
                        prefixIcon: Icon(
                          Icons.currency_rupee_rounded,
                          color: colors.textGrey,
                        ),
                      ),

                      SizedBox(height: 16.h),
                      _FieldLabel(
                        label: 'Description *',
                        textTheme: textTheme,
                        colors: colors,
                      ),
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
                            hintStyle: TextStyle(
                              color: colors.textGrey,
                              fontSize: 14.sp,
                            ),
                            contentPadding: EdgeInsets.all(14.w),
                            border: InputBorder.none,
                          ),
                        ),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 3: Location ───────────────────────────
                      _SectionHeader(title: 'Location', textTheme: textTheme),
                      SizedBox(height: 12.h),

                      _FieldLabel(
                        label: 'Street Address *',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _addressController,
                        height: 50.h,
                        type: TextInputType.streetAddress,
                        fillColor: colors.white,
                        hintText: 'e.g., 42, MG Road, Near City Mall',
                        prefixIcon: Icon(
                          Icons.location_on_outlined,
                          color: colors.textGrey,
                        ),
                      ),

                      SizedBox(height: 16.h),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _FieldLabel(
                                  label: 'City *',
                                  textTheme: textTheme,
                                  colors: colors,
                                ),
                                SizedBox(height: 8.h),
                                MyTextField(
                                  controller: _cityController,
                                  height: 50.h,
                                  type: TextInputType.text,
                                  fillColor: colors.white,
                                  hintText: 'e.g. Naharlagun',
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _FieldLabel(
                                  label: 'State',
                                  textTheme: textTheme,
                                  colors: colors,
                                ),
                                SizedBox(height: 8.h),
                                MyTextField(
                                  controller: _stateController,
                                  height: 50.h,
                                  type: TextInputType.text,
                                  fillColor: colors.white,
                                  hintText: 'Select State',
                                  readOnly: true,
                                  onTap: () {
                                    showStateSelectionSheet(
                                      context,
                                      selectedState: _selectedState,
                                      onSelected: (val) {
                                        setState(() {
                                          _selectedState = val;
                                          _stateController.text = val;
                                        });
                                      },
                                    );
                                  },
                                  suffixIcon: Icon(
                                    Icons.keyboard_arrow_down_rounded,
                                    color: colors.textGrey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      SizedBox(height: 16.h),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _FieldLabel(
                                  label: 'Pincode',
                                  textTheme: textTheme,
                                  colors: colors,
                                ),
                                SizedBox(height: 8.h),
                                MyTextField(
                                  controller: _pincodeController,
                                  height: 50.h,
                                  type: TextInputType.number,
                                  fillColor: colors.white,
                                  hintText: 'e.g. 560001',
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _FieldLabel(
                                  label: 'Capacity (players)',
                                  textTheme: textTheme,
                                  colors: colors,
                                ),
                                SizedBox(height: 8.h),
                                MyTextField(
                                  controller: _capacityController,
                                  height: 50.h,
                                  type: TextInputType.number,
                                  fillColor: colors.white,
                                  hintText: 'e.g. 22',
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      SizedBox(height: 16.h),
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _FieldLabel(
                                  label: 'Latitude (optional)',
                                  textTheme: textTheme,
                                  colors: colors,
                                ),
                                SizedBox(height: 8.h),
                                MyTextField(
                                  controller: _latitudeController,
                                  height: 50.h,
                                  type: TextInputType.number,
                                  fillColor: colors.white,
                                  hintText: 'e.g. 12.9716',
                                ),
                              ],
                            ),
                          ),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _FieldLabel(
                                  label: 'Longitude (optional)',
                                  textTheme: textTheme,
                                  colors: colors,
                                ),
                                SizedBox(height: 8.h),
                                MyTextField(
                                  controller: _longitudeController,
                                  height: 50.h,
                                  type: TextInputType.number,
                                  fillColor: colors.white,
                                  hintText: 'e.g. 77.5946',
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 16.h),
                      _FieldLabel(
                        label: 'Google Maps Link / Map URL (optional)',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _mapUrlController,
                        height: 50.h,
                        type: TextInputType.url,
                        fillColor: colors.white,
                        hintText:
                            'e.g. https://maps.google.com/?q=12.9716,77.5946',
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 4: Sports & Surface ───────────────────
                      _SectionHeader(
                        title: 'Sports & Surface',
                        textTheme: textTheme,
                      ),
                      SizedBox(height: 12.h),

                      _FieldLabel(
                        label: 'Surface Type',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 14.w),
                        decoration: BoxDecoration(
                          color: colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE8E8E8)),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedSurfaceType,
                            isExpanded: true,
                            icon: Icon(
                              Icons.keyboard_arrow_down_rounded,
                              color: colors.textGrey,
                            ),
                            items: _surfaceTypes.map((type) {
                              return DropdownMenuItem<String>(
                                value: type,
                                child: Text(
                                  type,
                                  style: textTheme.bodyMedium?.copyWith(
                                    color: colors.textTitle,
                                  ),
                                ),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() => _selectedSurfaceType = val);
                              }
                            },
                          ),
                        ),
                      ),

                      SizedBox(height: 16.h),
                      _FieldLabel(
                        label: 'Sports Supported *',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
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
                                horizontal: 14.w,
                                vertical: 8.h,
                              ),
                              decoration: BoxDecoration(
                                color: selected
                                    ? const Color(0xFFE43434)
                                    : colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: selected
                                      ? const Color(0xFFE43434)
                                      : const Color(0xFFE8E8E8),
                                ),
                              ),
                              child: Text(
                                sport,
                                style: textTheme.bodySmall?.copyWith(
                                  color: selected
                                      ? Colors.white
                                      : colors.textGrey,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 5: Amenities ─────────────────────────
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
                                horizontal: 14.w,
                                vertical: 8.h,
                              ),
                              decoration: BoxDecoration(
                                color: selected
                                    ? const Color(0xFF1E293B)
                                    : colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: selected
                                      ? const Color(0xFF1E293B)
                                      : const Color(0xFFE8E8E8),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (selected) ...[
                                    const Icon(
                                      Icons.check_rounded,
                                      size: 14,
                                      color: Colors.white,
                                    ),
                                    SizedBox(width: 4.w),
                                  ],
                                  Text(
                                    amenity,
                                    style: textTheme.bodySmall?.copyWith(
                                      color: selected
                                          ? Colors.white
                                          : colors.textGrey,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 6: Available Time Slots ───────────────
                      _SectionHeader(
                        title:
                            'Available Time Slots * (${_selectedSlots.length}/${_currentGeneratedSlots.length})',
                        textTheme: textTheme,
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        'Choose slot duration and select all time slots when your turf is open (covering 24 hours).',
                        style: textTheme.bodySmall?.copyWith(
                          color: colors.textGrey,
                          fontSize: 11.sp,
                        ),
                      ),
                      SizedBox(height: 12.h),

                      // Duration Selector
                      _FieldLabel(
                        label: 'Slot Duration',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      Wrap(
                        spacing: 8.w,
                        runSpacing: 8.h,
                        children: _durationOptions.map((opt) {
                          final mins = opt['minutes'] as int;
                          final label = opt['label'] as String;
                          final selected = _selectedDuration == mins;
                          return GestureDetector(
                            onTap: () => setState(() {
                              _selectedDuration = mins;
                              _currentGeneratedSlots = _generate24hSlots(mins);
                              _selectedSlots = List<String>.from(
                                _currentGeneratedSlots,
                              );
                            }),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              padding: EdgeInsets.symmetric(
                                horizontal: 12.w,
                                vertical: 6.h,
                              ),
                              decoration: BoxDecoration(
                                color: selected
                                    ? const Color(0xFF1E293B)
                                    : colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: selected
                                      ? const Color(0xFF1E293B)
                                      : const Color(0xFFE8E8E8),
                                ),
                              ),
                              child: Text(
                                label,
                                style: textTheme.bodySmall?.copyWith(
                                  color: selected
                                      ? Colors.white
                                      : colors.textTitle,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 11.sp,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      SizedBox(height: 12.h),

                      // Quick Actions & Filter Row
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            ActionChip(
                              label: const Text('Select All Slots'),
                              onPressed: () => setState(() {
                                _selectedSlots = List<String>.from(
                                  _currentGeneratedSlots,
                                );
                              }),
                              backgroundColor: colors.white,
                              labelStyle: TextStyle(
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(width: 8.w),
                            ActionChip(
                              label: const Text('Clear All'),
                              onPressed: () => setState(() {
                                _selectedSlots.clear();
                              }),
                              backgroundColor: colors.white,
                              labelStyle: TextStyle(
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            SizedBox(width: 8.w),
                            ActionChip(
                              label: const Text(
                                'Daytime (06:00 AM - 10:00 PM)',
                              ),
                              onPressed: () => setState(() {
                                _selectedSlots = _currentGeneratedSlots.where((
                                  s,
                                ) {
                                  final mins = _parseStartMinutes12H(s);
                                  return mins >= 360 && mins < 1320;
                                }).toList();
                              }),
                              backgroundColor: Colors.blue.shade50,
                              labelStyle: TextStyle(
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w600,
                                color: Colors.blue.shade800,
                              ),
                            ),
                          ],
                        ),
                      ),

                      SizedBox(height: 12.h),
                      MyTextField(
                        controller: _slotSearchController,
                        height: 44.h,
                        type: TextInputType.text,
                        fillColor: colors.white,
                        hintText: 'Filter slots...',
                        prefixIcon: Icon(
                          Icons.search_rounded,
                          color: colors.textGrey,
                          size: 18,
                        ),
                        onChanged: (val) => setState(() => _slotSearch = val),
                      ),

                      SizedBox(height: 12.h),

                      // 24-Hour Time Slot Chips Grid
                      Wrap(
                        spacing: 8.w,
                        runSpacing: 8.h,
                        children: filteredSlots.map((slot) {
                          final selected = _selectedSlots.contains(slot);
                          return GestureDetector(
                            onTap: () => setState(() {
                              selected
                                  ? _selectedSlots.remove(slot)
                                  : _selectedSlots.add(slot);
                            }),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              padding: EdgeInsets.symmetric(
                                horizontal: 10.w,
                                vertical: 6.h,
                              ),
                              decoration: BoxDecoration(
                                color: selected
                                    ? const Color(0xFFE43434)
                                    : colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: selected
                                      ? const Color(0xFFE43434)
                                      : const Color(0xFFE8E8E8),
                                ),
                              ),
                              child: Text(
                                TimeHelper.formatTo12Hour(slot),
                                style: TextStyle(
                                  color: selected
                                      ? Colors.white
                                      : colors.textTitle,
                                  fontSize: 11.sp,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 7: Contact Information ────────────────
                      _SectionHeader(
                        title: 'Contact Information',
                        textTheme: textTheme,
                      ),
                      SizedBox(height: 12.h),

                      _FieldLabel(
                        label: 'Contact Phone',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _contactPhoneController,
                        height: 50.h,
                        type: TextInputType.phone,
                        fillColor: colors.white,
                        hintText: 'e.g. +91 98765 43210',
                        prefixIcon: Icon(
                          Icons.phone_outlined,
                          color: colors.textGrey,
                        ),
                      ),

                      SizedBox(height: 16.h),
                      _FieldLabel(
                        label: 'Contact Email',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      MyTextField(
                        controller: _contactEmailController,
                        height: 50.h,
                        type: TextInputType.emailAddress,
                        fillColor: colors.white,
                        hintText: 'e.g. contact@turf.com',
                        prefixIcon: Icon(
                          Icons.email_outlined,
                          color: colors.textGrey,
                        ),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 8: Rules & Guidelines ─────────────────
                      _SectionHeader(
                        title: 'Rules & Guidelines',
                        textTheme: textTheme,
                      ),
                      SizedBox(height: 12.h),

                      _FieldLabel(
                        label: 'Turf Rules (optional)',
                        textTheme: textTheme,
                        colors: colors,
                      ),
                      SizedBox(height: 8.h),
                      Container(
                        decoration: BoxDecoration(
                          color: colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE8E8E8)),
                        ),
                        child: TextField(
                          controller: _rulesController,
                          maxLines: 3,
                          style: textTheme.bodyMedium,
                          decoration: InputDecoration(
                            hintText: 'e.g., No metal studs allowed...',
                            hintStyle: TextStyle(
                              color: colors.textGrey,
                              fontSize: 14.sp,
                            ),
                            contentPadding: EdgeInsets.all(14.w),
                            border: InputBorder.none,
                          ),
                        ),
                      ),

                      SizedBox(height: 32.h),

                      // ── Submit Buttons ────────────────────────────────
                      Row(
                        children: [
                          Expanded(
                            child: MyButtons(
                              text: _isLoading
                                  ? 'Submitting...'
                                  : 'Submit Listing',
                              isLoading: _isLoading,
                              loadingText: 'Submitting...',
                              height: 52.h,
                              width: double.infinity,
                              onTap: _isLoading ? null : _submit,
                              textStyle: textTheme.bodyMedium?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                              backgroundColor: _isLoading
                                  ? const Color(
                                      0xFFE43434,
                                    ).withValues(alpha: 0.5)
                                  : const Color(0xFFE43434),
                            ),
                          ),
                          SizedBox(width: 12.w),
                          OutlinedButton(
                            onPressed: _isLoading ? null : () => Get.back(),
                            style: OutlinedButton.styleFrom(
                              minimumSize: Size(90.w, 52.h),
                              side: const BorderSide(color: Color(0xFFD0D0D0)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: Text(
                              'Cancel',
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),

                      SizedBox(height: 32.h),
                    ],
                  ),
                ),
              ),
            ),
            if (_isLoading)
              Positioned.fill(
                child: Container(
                  color: Colors.black.withValues(alpha: 0.4),
                  child: Center(
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 28.w,
                        vertical: 24.h,
                      ),
                      margin: EdgeInsets.symmetric(horizontal: 32.w),
                      decoration: BoxDecoration(
                        color: colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.2),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(color: colors.primary),
                          SizedBox(height: 18.h),
                          Text(
                            'Creating Turf Listing',
                            style: textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: colors.textTitle,
                            ),
                          ),
                          SizedBox(height: 6.h),
                          Text(
                            'Please wait while your turf data is being saved to the server...',
                            textAlign: TextAlign.center,
                            style: textTheme.bodySmall?.copyWith(
                              color: colors.textGrey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageWidget(String path) {
    final normalized = UploadcareService.normalizeCdnUrl(path);
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return Image.network(
        normalized,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) => Container(
          color: const Color(0xFFF1F5F9),
          child: const Icon(Icons.broken_image_rounded, color: Colors.grey),
        ),
      );
    }
    return Image.file(
      File(path),
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) => Container(
        color: const Color(0xFFF1F5F9),
        child: const Icon(Icons.broken_image_rounded, color: Colors.grey),
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
  const _FieldLabel({
    required this.label,
    required this.textTheme,
    required this.colors,
  });

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
