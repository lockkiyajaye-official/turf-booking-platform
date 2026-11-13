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

class OwnerEditTurfPage extends StatefulWidget {
  final TurfModel turf;
  const OwnerEditTurfPage({super.key, required this.turf});

  @override
  State<OwnerEditTurfPage> createState() => _OwnerEditTurfPageState();
}

class _OwnerEditTurfPageState extends State<OwnerEditTurfPage> {
  // Controllers
  late TextEditingController _nameController;
  late TextEditingController _priceController;
  late TextEditingController _descriptionController;

  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  String? _selectedState;
  late TextEditingController _pincodeController;
  late TextEditingController _capacityController;
  late TextEditingController _latitudeController;
  late TextEditingController _longitudeController;
  late TextEditingController _mapUrlController;

  late TextEditingController _contactPhoneController;
  late TextEditingController _contactEmailController;
  late TextEditingController _rulesController;
  late TextEditingController _slotSearchController;

  // Options & Selections
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
  List<String> _selectedSports = [];

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
  List<String> _selectedAmenities = [];

  // Slot Management
  final List<Map<String, dynamic>> _durationOptions = [
    {'label': '30 Mins', 'minutes': 30},
    {'label': '45 Mins', 'minutes': 45},
    {'label': '60 Mins (1 Hr)', 'minutes': 60},
    {'label': '90 Mins (1.5 Hr)', 'minutes': 90},
    {'label': '120 Mins (2 Hr)', 'minutes': 120},
  ];
  int _selectedDuration = 60;
  late List<String> _currentGeneratedSlots;
  List<String> _selectedSlots = [];
  String _slotSearch = '';

  // Image State
  final ImagePicker _picker = ImagePicker();
  List<String> _imageUrls = [];
  int _primaryImageIndex = 0;

  bool _isSaving = false;
  bool _isUploadingImages = false;
  final TurfService _turfService = TurfService();
  final UploadcareService _uploadcareService = UploadcareService();

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

  @override
  void initState() {
    super.initState();
    final t = widget.turf;

    _nameController = TextEditingController(text: t.name);
    _priceController = TextEditingController(text: t.pricePerHour.toString());
    _descriptionController = TextEditingController(text: t.description ?? '');

    _addressController = TextEditingController(text: t.address);
    _cityController = TextEditingController(text: t.city ?? '');
    _stateController = TextEditingController(text: t.state ?? '');
    _selectedState = (t.state != null && t.state!.trim().isNotEmpty)
        ? t.state!.trim()
        : null;
    _pincodeController = TextEditingController(text: t.pincode ?? '');
    _capacityController = TextEditingController(
      text: t.capacity?.toString() ?? '',
    );
    _latitudeController = TextEditingController(
      text: t.latitude?.toString() ?? '',
    );
    _longitudeController = TextEditingController(
      text: t.longitude?.toString() ?? '',
    );
    _mapUrlController = TextEditingController(
      text: t.googleMapUrl ?? t.mapUrl ?? '',
    );

    _contactPhoneController = TextEditingController(text: t.contactPhone ?? '');
    _contactEmailController = TextEditingController(text: t.contactEmail ?? '');
    _rulesController = TextEditingController(text: t.rules ?? '');
    _slotSearchController = TextEditingController();

    if (_surfaceTypes.contains(t.surfaceType)) {
      _selectedSurfaceType = t.surfaceType!;
    }

    _selectedSports = List<String>.from(t.sports);
    _selectedAmenities = List<String>.from(t.amenities);
    _imageUrls = List<String>.from(t.images);
    _selectedSlots = t.availableSlots
        .map((s) => TimeHelper.formatTo12Hour(s))
        .toList();

    _currentGeneratedSlots = _generate24hSlots(60);
  }

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

  void _confirmClearAllImages() {
    Get.defaultDialog(
      title: 'Clear All Photos',
      titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
      middleText:
          'Are you sure you want to remove all photos? You can upload new ones or save to use the placeholder image.',
      textConfirm: 'Clear All',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFFE43434),
      onConfirm: () {
        Get.back();
        setState(() {
          _imageUrls.clear();
          _primaryImageIndex = 0;
        });
      },
    );
  }

  Future<void> _save() async {
    if (_isSaving) return;

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
    setState(() => _isSaving = true);

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
        'pricePerHour': double.tryParse(price) ?? widget.turf.pricePerHour,
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
        if (_latitudeController.text.isNotEmpty)
          'latitude': double.tryParse(_latitudeController.text.trim()),
        if (_longitudeController.text.isNotEmpty)
          'longitude': double.tryParse(_longitudeController.text.trim()),
        if (_mapUrlController.text.trim().isNotEmpty) ...{
          'googleMapUrl': _mapUrlController.text.trim(),
          'mapUrl': _mapUrlController.text.trim(),
        },
      };

      final res = await _turfService.updateTurf(
        token: token,
        id: widget.turf.id,
        data: data,
      );

      if (res['success']) {
        Get.snackbar(
          'Saved',
          'Turf updated successfully',
          backgroundColor: Colors.green.shade100,
          snackPosition: SnackPosition.BOTTOM,
        );
        if (Get.isRegistered<OwnerViewmodel>()) {
          Get.find<OwnerViewmodel>().fetchMyTurfs();
        }

        TurfModel updatedTurf = widget.turf;
        if (res['data'] is Map<String, dynamic>) {
          try {
            updatedTurf =
                TurfModel.fromJson(res['data'] as Map<String, dynamic>);
          } catch (_) {
            try {
              final fullRes = await _turfService.findOne(widget.turf.id);
              if (fullRes['success'] &&
                  fullRes['data'] is Map<String, dynamic>) {
                updatedTurf = TurfModel.fromJson(fullRes['data']);
              }
            } catch (_) {}
          }
        } else {
          try {
            final fullRes = await _turfService.findOne(widget.turf.id);
            if (fullRes['success'] && fullRes['data'] is Map<String, dynamic>) {
              updatedTurf = TurfModel.fromJson(fullRes['data']);
            }
          } catch (_) {}
        }

        Get.off(() => OwnerTurfDetailPage(turf: updatedTurf));
      } else {
        Get.snackbar(
          'Error',
          res['message'] ?? 'Update failed',
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
        setState(() => _isSaving = false);
      }
    }
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

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    final filteredSlots = _currentGeneratedSlots
        .where((s) => s.toLowerCase().contains(_slotSearch.toLowerCase()))
        .toList();

    return PopScope(
      canPop: !_isSaving,
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          backgroundColor: colors.white,
          elevation: 0,
          leading: IconButton(
            icon: Icon(
              Icons.arrow_back_ios_new_rounded,
              color: colors.textTitle,
              size: 18,
            ),
            onPressed: _isSaving ? null : () => Get.back(),
          ),
          title: Text(
            'Edit Turf',
            style: textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: colors.textTitle,
            ),
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _SectionHeader(title: 'Photos', textTheme: textTheme),
                          if (_imageUrls.isNotEmpty)
                            TextButton.icon(
                              onPressed: _isSaving ? null : _confirmClearAllImages,
                              icon: const Icon(
                                Icons.delete_sweep_outlined,
                                size: 16,
                                color: Color(0xFFE43434),
                              ),
                              label: const Text(
                                'Clear All',
                                style: TextStyle(
                                  color: Color(0xFFE43434),
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              style: TextButton.styleFrom(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 8.w,
                                  vertical: 4.h,
                                ),
                                visualDensity: VisualDensity.compact,
                              ),
                            ),
                        ],
                      ),
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
                      if (_imageUrls.isEmpty) ...[
                        SizedBox(height: 8.h),
                        Row(
                          children: [
                            Icon(
                              Icons.info_outline_rounded,
                              size: 14.sp,
                              color: colors.textGrey,
                            ),
                            SizedBox(width: 6.w),
                            Text(
                              'No photos selected. Default placeholder will be used.',
                              style: TextStyle(
                                color: colors.textGrey,
                                fontSize: 11.sp,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ],
                        ),
                      ],

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

                      // ── Section 5: Amenities ──────────────────────────
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
                                amenity,
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

                      // ── Section 6: Available Time Slots ───────────────
                      _SectionHeader(
                        title: 'Available Time Slots *',
                        textTheme: textTheme,
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        'Choose slot duration and select all time slots when your turf is open.',
                        style: textTheme.bodySmall?.copyWith(
                          color: colors.textGrey,
                          fontSize: 11.sp,
                        ),
                      ),
                      SizedBox(height: 12.h),

                      // Duration presets
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _durationOptions.map((opt) {
                            final mins = opt['minutes'] as int;
                            final isSelected = _selectedDuration == mins;
                            return Padding(
                              padding: EdgeInsets.only(right: 8.w),
                              child: ChoiceChip(
                                label: Text(
                                  opt['label'] as String,
                                  style: TextStyle(fontSize: 11.sp),
                                ),
                                selected: isSelected,
                                selectedColor: const Color(0xFFE43434),
                                labelStyle: TextStyle(
                                  color: isSelected
                                      ? Colors.white
                                      : colors.textTitle,
                                  fontWeight: FontWeight.bold,
                                ),
                                onSelected: (val) {
                                  if (val) {
                                    setState(() {
                                      _selectedDuration = mins;
                                      _currentGeneratedSlots =
                                          _generate24hSlots(mins);
                                      _selectedSlots = List<String>.from(
                                        _currentGeneratedSlots,
                                      );
                                    });
                                  }
                                },
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      SizedBox(height: 12.h),

                      // Slot Controls
                      Row(
                        children: [
                          Expanded(
                            child: Wrap(
                              spacing: 6.w,
                              runSpacing: 6.h,
                              children: [
                                OutlinedButton(
                                  onPressed: () {
                                    setState(() {
                                      _selectedSlots = List<String>.from(
                                        _currentGeneratedSlots,
                                      );
                                    });
                                  },
                                  style: OutlinedButton.styleFrom(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 10.w,
                                      vertical: 6.h,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: Text(
                                    'Select All Slots',
                                    style: TextStyle(
                                      fontSize: 10.sp,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                OutlinedButton(
                                  onPressed: () {
                                    setState(() {
                                      _selectedSlots.clear();
                                    });
                                  },
                                  style: OutlinedButton.styleFrom(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 10.w,
                                      vertical: 6.h,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: Text(
                                    'Clear All',
                                    style: TextStyle(
                                      fontSize: 10.sp,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                OutlinedButton(
                                  onPressed: () {
                                    setState(() {
                                      _selectedSlots = _currentGeneratedSlots
                                          .where((s) {
                                            final mins = _parseStartMinutes12H(
                                              s,
                                            );
                                            return mins >= 360 && mins < 1320;
                                          })
                                          .toList();
                                    });
                                  },
                                  style: OutlinedButton.styleFrom(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 10.w,
                                      vertical: 6.h,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                  child: Text(
                                    'Daytime (06:00 AM - 10:00 PM)',
                                    style: TextStyle(
                                      fontSize: 10.sp,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 10.h),

                      // Slot Filter Search
                      MyTextField(
                        controller: _slotSearchController,
                        height: 44.h,
                        type: TextInputType.text,
                        fillColor: colors.white,
                        hintText: 'Filter slots...',
                        prefixIcon: Icon(
                          Icons.search_rounded,
                          size: 18,
                          color: colors.textGrey,
                        ),
                        onChanged: (val) => setState(() => _slotSearch = val),
                      ),
                      SizedBox(height: 12.h),

                      // Slot Grid
                      Container(
                        height: 200.h,
                        padding: EdgeInsets.all(8.w),
                        decoration: BoxDecoration(
                          color: colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFE8E8E8)),
                        ),
                        child: filteredSlots.isEmpty
                            ? Center(
                                child: Text(
                                  'No matching slots',
                                  style: textTheme.bodySmall?.copyWith(
                                    color: colors.textGrey,
                                  ),
                                ),
                              )
                            : GridView.builder(
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 3,
                                      childAspectRatio: 2.5,
                                      crossAxisSpacing: 8,
                                      mainAxisSpacing: 8,
                                    ),
                                itemCount: filteredSlots.length,
                                itemBuilder: (context, index) {
                                  final slot = filteredSlots[index];
                                  final isSelected = _selectedSlots.contains(
                                    slot,
                                  );

                                  return GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        if (isSelected) {
                                          _selectedSlots.remove(slot);
                                        } else {
                                          _selectedSlots.add(slot);
                                        }
                                      });
                                    },
                                    child: Container(
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: isSelected
                                            ? const Color(0xFFE43434)
                                            : const Color(0xFFF5F5F5),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: isSelected
                                              ? const Color(0xFFE43434)
                                              : const Color(0xFFE0E0E0),
                                        ),
                                      ),
                                      child: Text(
                                        TimeHelper.formatTo12Hour(slot),
                                        style: TextStyle(
                                          fontSize: 10.sp,
                                          fontWeight: FontWeight.bold,
                                          color: isSelected
                                              ? Colors.white
                                              : colors.textTitle,
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
                      SizedBox(height: 6.h),
                      Text(
                        '${_selectedSlots.length} of ${_currentGeneratedSlots.length} slots selected',
                        style: textTheme.bodySmall?.copyWith(
                          color: colors.textGrey,
                          fontSize: 11.sp,
                        ),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 7: Contact Information ─────────────────
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
                        hintText: 'e.g. +91 9876543210',
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
                        hintText: 'e.g. info@greenarena.com',
                        prefixIcon: Icon(
                          Icons.email_outlined,
                          color: colors.textGrey,
                        ),
                      ),

                      SizedBox(height: 24.h),

                      // ── Section 8: Rules & Guidelines ──────────────────
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
                            hintText:
                                'Enter venue rules, footwear guidelines, etc.',
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
                      MyButtons(
                        text: _isSaving ? 'Saving...' : 'Save Changes',
                        isLoading: _isSaving,
                        loadingText: 'Saving...',
                        height: 52.h,
                        width: double.infinity,
                        onTap: _isSaving ? null : _save,
                        textStyle: textTheme.bodyMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                        backgroundColor: _isSaving
                            ? const Color(0xFFE43434).withValues(alpha: 0.5)
                            : const Color(0xFFE43434),
                      ),
                      SizedBox(height: 32.h),
                    ],
                  ),
                ),
              ),
            ),
            if (_isSaving)
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
                            'Updating Turf Details',
                            style: textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: colors.textTitle,
                            ),
                          ),
                          SizedBox(height: 6.h),
                          Text(
                            'Please wait while changes are saved to the server...',
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
}

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
