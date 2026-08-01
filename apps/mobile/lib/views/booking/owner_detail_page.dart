import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/data/services/turf_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class OwnerTurfDetailPage extends StatefulWidget {
  final TurfModel turf;
  const OwnerTurfDetailPage({super.key, required this.turf});

  @override
  State<OwnerTurfDetailPage> createState() => _OwnerTurfDetailPageState();
}

class _OwnerTurfDetailPageState extends State<OwnerTurfDetailPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  late TextEditingController _nameController;
  late TextEditingController _addressController;
  late TextEditingController _descriptionController;
  late TextEditingController _priceController;

  final List<String> _allSports = [
    'Football', 'Cricket', 'Basketball', 'Badminton', 'Tennis', 'Volleyball',
  ];
  final List<String> _allAmenities = [
    'Parking', 'Changing Rooms', 'Floodlights', 'Cafeteria',
    'Washrooms', 'First Aid', 'WiFi', 'Water',
  ];
  List<String> _selectedSports = [];
  List<String> _selectedAmenities = [];

  bool _isSaving = false;
  final TurfService _turfService = TurfService();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    final t = widget.turf;
    _nameController = TextEditingController(text: t.name);
    _addressController = TextEditingController(text: t.address);
    _descriptionController = TextEditingController(text: t.description ?? '');
    _priceController =
        TextEditingController(text: t.pricePerHour.toString());
    _selectedSports = List<String>.from(t.sports ?? []);
    _selectedAmenities = List<String>.from(t.amenities ?? []);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final token = Get.find<AuthViewmodel>().token.value;
    setState(() => _isSaving = true);

    try {
      final data = <String, dynamic>{
        'name': _nameController.text.trim(),
        'address': _addressController.text.trim(),
        'description': _descriptionController.text.trim(),
        'pricePerHour': double.tryParse(_priceController.text.trim()) ??
            widget.turf.pricePerHour,
        'sports': _selectedSports,
        'amenities': _selectedAmenities,
      };

      final res = await _turfService.updateTurf(
          token: token, id: widget.turf.id, data: data);

      if (res['success']) {
        Get.snackbar('Saved', 'Turf updated successfully',
            backgroundColor: Colors.green.shade100,
            snackPosition: SnackPosition.BOTTOM);
        Get.back();
      } else {
        Get.snackbar('Error', res['message'] ?? 'Update failed',
            backgroundColor: Colors.red.shade100,
            snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.snackbar('Error', e.toString(),
          backgroundColor: Colors.red.shade100,
          snackPosition: SnackPosition.BOTTOM);
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final turf = widget.turf;
    final imageUrl = turf.images.isNotEmpty
        ? turf.images.first
        : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80';

    return Scaffold(
      backgroundColor: colors.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            expandedHeight: 220.h,
            pinned: true,
            backgroundColor: colors.white,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.arrow_back_ios_new_rounded,
                    color: Colors.white, size: 16),
              ),
              onPressed: () => Get.back(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Image.network(
                imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: Colors.grey[300],
                  child: const Icon(Icons.sports_soccer,
                      size: 60, color: Colors.grey),
                ),
              ),
            ),
            bottom: TabBar(
              controller: _tabController,
              indicatorColor: colors.primary,
              labelColor: colors.primary,
              unselectedLabelColor: colors.textGrey,
              labelStyle: textTheme.bodySmall
                  ?.copyWith(fontWeight: FontWeight.w600),
              tabs: const [
                Tab(text: 'Overview'),
                Tab(text: 'Edit Details'),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            // ── OVERVIEW TAB ──────────────────────────────
            _OverviewTab(turf: turf, colors: colors, textTheme: textTheme),

            // ── EDIT TAB ──────────────────────────────────
            SingleChildScrollView(
              padding: EdgeInsets.all(20.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _FieldLabel(label: 'Turf Name', textTheme: textTheme, colors: colors),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: _nameController,
                    height: 50.h,
                    type: TextInputType.text,
                    fillColor: colors.white,
                    hintText: 'Turf name',
                  ),

                  SizedBox(height: 16.h),
                  _FieldLabel(label: 'Address', textTheme: textTheme, colors: colors),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: _addressController,
                    height: 50.h,
                    type: TextInputType.streetAddress,
                    fillColor: colors.white,
                    hintText: 'Address',
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
                        hintStyle: TextStyle(
                            color: colors.textGrey, fontSize: 14.sp),
                        contentPadding: EdgeInsets.all(14.w),
                        border: InputBorder.none,
                      ),
                    ),
                  ),

                  SizedBox(height: 16.h),
                  _FieldLabel(label: 'Price per Hour (₹)', textTheme: textTheme, colors: colors),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: _priceController,
                    height: 50.h,
                    type: TextInputType.number,
                    fillColor: colors.white,
                    hintText: 'Price',
                    prefixIcon: Icon(Icons.currency_rupee_rounded,
                        color: colors.textGrey),
                  ),

                  SizedBox(height: 20.h),
                  Text('Sports',
                      style: textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.w700)),
                  SizedBox(height: 10.h),
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
                          child: Text(sport,
                              style: textTheme.bodySmall?.copyWith(
                                color: selected
                                    ? Colors.white
                                    : colors.textGrey,
                                fontWeight: FontWeight.w600,
                              )),
                        ),
                      );
                    }).toList(),
                  ),

                  SizedBox(height: 20.h),
                  Text('Amenities',
                      style: textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.w700)),
                  SizedBox(height: 10.h),
                  Wrap(
                    spacing: 8.w,
                    runSpacing: 8.h,
                    children: _allAmenities.map((a) {
                      final selected = _selectedAmenities.contains(a);
                      return GestureDetector(
                        onTap: () => setState(() {
                          selected
                              ? _selectedAmenities.remove(a)
                              : _selectedAmenities.add(a);
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
                          child: Text(a,
                              style: textTheme.bodySmall?.copyWith(
                                color: selected
                                    ? Colors.white
                                    : colors.textGrey,
                                fontWeight: FontWeight.w600,
                              )),
                        ),
                      );
                    }).toList(),
                  ),

                  SizedBox(height: 32.h),
                  MyButtons(
                    text: _isSaving ? 'Saving...' : 'Save Changes',
                    height: 52.h,
                    width: double.infinity,
                    onTap: _isSaving ? null : _save,
                    textStyle: textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                    backgroundColor: _isSaving
                        ? const Color(0xFFE43434).withOpacity(0.5)
                        : const Color(0xFFE43434),
                  ),
                  SizedBox(height: 32.h),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Overview Tab ─────────────────────────────────────────────
class _OverviewTab extends StatelessWidget {
  final TurfModel turf;
  final AppColors colors;
  final TextTheme textTheme;

  const _OverviewTab(
      {required this.turf, required this.colors, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.all(20.w),
      children: [
        // Name + Price
        Row(
          children: [
            Expanded(
              child: Text(
                turf.name,
                style: textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            Text(
              '₹${turf.pricePerHour}/hr',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: colors.primary,
              ),
            ),
          ],
        ),
        SizedBox(height: 6.h),

        // Address
        Row(
          children: [
            Icon(Icons.location_on_rounded,
                size: 16, color: colors.textGrey),
            SizedBox(width: 4.w),
            Expanded(
              child: Text(
                turf.address,
                style:
                    textTheme.bodySmall?.copyWith(color: colors.textGrey),
              ),
            ),
          ],
        ),

        // Rating
        if (turf.rating != null) ...[
          SizedBox(height: 8.h),
          Row(
            children: [
              const Icon(Icons.star_rounded,
                  size: 16, color: Colors.amber),
              SizedBox(width: 4.w),
              Text(
                '${turf.rating!.toStringAsFixed(1)} (${turf.totalReviews} reviews)',
                style: textTheme.bodySmall?.copyWith(
                    color: colors.textTitle,
                    fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],

        SizedBox(height: 16.h),
        const Divider(color: Color(0xFFF0F0F0)),
        SizedBox(height: 16.h),

        // Description
        if (turf.description != null && turf.description!.isNotEmpty) ...[
          Text('Description',
              style:
                  textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          SizedBox(height: 8.h),
          Text(turf.description!,
              style:
                  textTheme.bodyMedium?.copyWith(color: colors.textGrey, height: 1.5)),
          SizedBox(height: 20.h),
        ],

        // Sports
        if ((turf.sports ?? []).isNotEmpty) ...[
          Text('Sports',
              style:
                  textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          SizedBox(height: 10.h),
          Wrap(
            spacing: 8.w,
            runSpacing: 8.h,
            children: (turf.sports ?? [])
                .map((s) => _Chip(
                    label: s, color: colors.primary, textTheme: textTheme))
                .toList(),
          ),
          SizedBox(height: 20.h),
        ],

        // Amenities
        if ((turf.amenities ?? []).isNotEmpty) ...[
          Text('Amenities',
              style:
                  textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
          SizedBox(height: 10.h),
          Wrap(
            spacing: 8.w,
            runSpacing: 8.h,
            children: (turf.amenities ?? [])
                .map((a) => _Chip(
                    label: a,
                    color: const Color(0xFF4F46E5),
                    textTheme: textTheme))
                .toList(),
          ),
        ],
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  final TextTheme textTheme;
  const _Chip(
      {required this.label, required this.color, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label,
        style: textTheme.bodySmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
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
    return Text(label,
        style: textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w600, color: colors.textTitle));
  }
}