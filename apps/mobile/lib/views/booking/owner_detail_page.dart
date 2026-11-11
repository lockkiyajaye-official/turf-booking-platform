import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/owner_edit_turf_page.dart';
import 'package:mobile/views/booking/widgets/direct_booking_sheet.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:url_launcher/url_launcher.dart';

class OwnerTurfDetailPage extends StatefulWidget {
  final TurfModel turf;
  const OwnerTurfDetailPage({super.key, required this.turf});

  @override
  State<OwnerTurfDetailPage> createState() => _OwnerTurfDetailPageState();
}

class _OwnerTurfDetailPageState extends State<OwnerTurfDetailPage> {
  int _selectedPhotoIndex = 0;

  Widget _buildImageWidget(String path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return Image.network(
        path,
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

  void _confirmDelete(
    BuildContext context,
    OwnerViewmodel vm,
    TurfModel turf,
  ) {
    Get.defaultDialog(
      title: 'Delete Turf',
      titleStyle: const TextStyle(fontWeight: FontWeight.bold),
      middleText:
          'Are you sure you want to permanently delete "${turf.name}"? This action cannot be undone.',
      textConfirm: 'Delete',
      textCancel: 'Cancel',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFFE43434),
      onConfirm: () async {
        Get.back(); // close dialog
        final success = await vm.deleteTurf(turf.id);
        if (success) {
          Get.back(); // close details page
        }
      },
    );
  }

  Future<void> _openMap(String? mapUrl) async {
    if (mapUrl == null || mapUrl.trim().isEmpty) return;
    try {
      final uri = Uri.parse(mapUrl.trim());
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  Future<void> _openPhone(String? phone) async {
    if (phone == null || phone.trim().isEmpty) return;
    try {
      final uri = Uri(scheme: 'tel', path: phone.trim());
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (_) {}
  }

  Future<void> _openEmail(String? email) async {
    if (email == null || email.trim().isEmpty) return;
    try {
      final uri = Uri(scheme: 'mailto', path: email.trim());
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    final vm = Get.isRegistered<OwnerViewmodel>()
        ? Get.find<OwnerViewmodel>()
        : Get.put(OwnerViewmodel(), permanent: true);

    return Obx(() {
      final turf =
          vm.myTurfs.firstWhereOrNull((t) => t.id == widget.turf.id) ??
          widget.turf;

      final allImages = turf.images.isNotEmpty
          ? turf.images
          : [
              'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&q=80',
            ];
      final currentImageUrl = _selectedPhotoIndex < allImages.length
          ? allImages[_selectedPhotoIndex]
          : allImages.first;

      final locationParts = [
        turf.address,
        turf.city,
        turf.state,
        turf.pincode,
      ].where((s) => s != null && s.isNotEmpty).join(', ');

      final isPublished = turf.isPublished;

      return Scaffold(
        backgroundColor: colors.background,
        body: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) => [
            SliverAppBar(
              expandedHeight: context.isTablet ? 320 : 250.h,
              pinned: true,
              backgroundColor: colors.white,
              leading: IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.black38,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
                onPressed: () => Get.back(),
              ),
              actions: [
                // Quick Edit Button in AppBar
                IconButton(
                  tooltip: 'Edit Turf',
                  icon: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.black38,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.edit_outlined,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                  onPressed: () => Get.to(() => OwnerEditTurfPage(turf: turf)),
                ),

                // 3-dots Dropdown Menu (Edit, Publish/Unpublish, Delete)
                Theme(
                  data: Theme.of(context).copyWith(
                    cardColor: colors.white,
                  ),
                  child: PopupMenuButton<String>(
                    tooltip: 'More Options',
                    icon: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.black38,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.more_vert_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    onSelected: (val) async {
                      if (val == 'direct_booking') {
                        showDirectBookingModal(
                          context,
                          vm: vm,
                          preselectedTurf: turf,
                        );
                      } else if (val == 'edit') {
                        Get.to(() => OwnerEditTurfPage(turf: turf));
                      } else if (val == 'toggle_publish') {
                        if (isPublished) {
                          await vm.unpublishTurf(turf.id);
                        } else {
                          await vm.publishTurf(turf.id);
                        }
                      } else if (val == 'delete') {
                        _confirmDelete(context, vm, turf);
                      }
                    },
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        value: 'direct_booking',
                        child: Row(
                          children: [
                            const Icon(
                              Icons.storefront_outlined,
                              size: 18,
                              color: Color(0xFF7E22CE),
                            ),
                            SizedBox(width: 12.w),
                            Text(
                              'Mark Slot Booked (Direct)',
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'edit',
                        child: Row(
                          children: [
                            Icon(
                              Icons.edit_outlined,
                              size: 18,
                              color: colors.primary,
                            ),
                            SizedBox(width: 12.w),
                            Text(
                              'Edit Turf Details',
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'toggle_publish',
                        child: Row(
                          children: [
                            Icon(
                              isPublished
                                  ? Icons.unpublished_outlined
                                  : Icons.publish_rounded,
                              size: 18,
                              color: isPublished
                                  ? Colors.orange
                                  : const Color(0xFF059669),
                            ),
                            SizedBox(width: 12.w),
                            Text(
                              isPublished ? 'Unpublish Turf' : 'Publish Turf',
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const PopupMenuDivider(),
                      PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            const Icon(
                              Icons.delete_outline_rounded,
                              size: 18,
                              color: Colors.red,
                            ),
                            SizedBox(width: 12.w),
                            const Text(
                              'Delete Turf',
                              style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 6.w),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    _buildImageWidget(currentImageUrl),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withOpacity(0.4),
                            Colors.transparent,
                            Colors.black.withOpacity(0.4),
                          ],
                        ),
                      ),
                    ),
                    if (allImages.length > 1)
                      Positioned(
                        bottom: 12.h,
                        right: 16.w,
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 10.w,
                            vertical: 4.h,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${_selectedPhotoIndex + 1}/${allImages.length}',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11.sp,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
          body: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 860),
              child: ListView(
                padding: EdgeInsets.all(20.w),
                children: [
                  // ── Status & Rating Badges ─────────────────────────
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 5.h,
                        ),
                        decoration: BoxDecoration(
                          color: isPublished
                              ? const Color(0xFF059669).withOpacity(0.12)
                              : Colors.orange.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isPublished
                                ? const Color(0xFF059669).withOpacity(0.4)
                                : Colors.orange.withOpacity(0.4),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isPublished
                                  ? Icons.check_circle_rounded
                                  : Icons.info_outline_rounded,
                              size: 14,
                              color: isPublished
                                  ? const Color(0xFF059669)
                                  : Colors.orange[800],
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              isPublished ? 'Published' : 'Draft / Unpublished',
                              style: TextStyle(
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w700,
                                color: isPublished
                                    ? const Color(0xFF059669)
                                    : Colors.orange[800],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                      if (turf.rating != null)
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 10.w,
                            vertical: 5.h,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.amber.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.star_rounded,
                                size: 16,
                                color: Colors.amber,
                              ),
                              SizedBox(width: 4.w),
                              Text(
                                '${turf.rating!.toStringAsFixed(1)} (${turf.totalReviews})',
                                style: textTheme.bodySmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: colors.textTitle,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),

                  SizedBox(height: 14.h),

                  // ── Name & Price ──────────────────────────────────
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          turf.name,
                          style: textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: colors.textTitle,
                          ),
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 12.w,
                          vertical: 6.h,
                        ),
                        decoration: BoxDecoration(
                          color: colors.primary.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: colors.primary.withOpacity(0.2),
                          ),
                        ),
                        child: Text(
                          '₹${turf.pricePerHour.toInt()}/hr',
                          style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: colors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 10.h),

                  // ── Address & Map ─────────────────────────────────
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.location_on_rounded,
                        size: 16,
                        color: colors.primary,
                      ),
                      SizedBox(width: 6.w),
                      Expanded(
                        child: Text(
                          locationParts.isNotEmpty ? locationParts : turf.address,
                          style: textTheme.bodySmall?.copyWith(
                            color: colors.textGrey,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),

                  if (turf.googleMapUrl != null || turf.mapUrl != null) ...[
                    SizedBox(height: 6.h),
                    GestureDetector(
                      onTap: () =>
                          _openMap(turf.googleMapUrl ?? turf.mapUrl),
                      child: Padding(
                        padding: EdgeInsets.only(left: 22.w),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'View on Google Maps',
                              style: TextStyle(
                                fontSize: 11.sp,
                                fontWeight: FontWeight.bold,
                                color: colors.primary,
                              ),
                            ),
                            SizedBox(width: 4.w),
                            Icon(
                              Icons.open_in_new_rounded,
                              size: 12,
                              color: colors.primary,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  SizedBox(height: 16.h),

                  // ── Quick Specs Row (Surface & Capacity) ──────────
                  Container(
                    padding: EdgeInsets.all(14.w),
                    decoration: BoxDecoration(
                      color: colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFF0F0F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: _SpecItem(
                            icon: Icons.grass_rounded,
                            label: 'Surface',
                            value: turf.surfaceType ?? 'Turf',
                            colors: colors,
                            textTheme: textTheme,
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 36.h,
                          color: const Color(0xFFE8E8E8),
                        ),
                        Expanded(
                          child: _SpecItem(
                            icon: Icons.groups_rounded,
                            label: 'Capacity',
                            value: turf.capacity != null
                                ? '${turf.capacity} Players'
                                : 'Flexible',
                            colors: colors,
                            textTheme: textTheme,
                          ),
                        ),
                        Container(
                          width: 1,
                          height: 36.h,
                          color: const Color(0xFFE8E8E8),
                        ),
                        Expanded(
                          child: _SpecItem(
                            icon: Icons.schedule_rounded,
                            label: 'Slots',
                            value: '${turf.availableSlots.length} open',
                            colors: colors,
                            textTheme: textTheme,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ── Photos Gallery (if multiple) ─────────────────
                  if (allImages.length > 1) ...[
                    SizedBox(height: 20.h),
                    Text(
                      'Photos (${allImages.length})',
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    SizedBox(
                      height: 72.h,
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        itemCount: allImages.length,
                        itemBuilder: (context, index) {
                          final isSelected = index == _selectedPhotoIndex;
                          return GestureDetector(
                            onTap: () =>
                                setState(() => _selectedPhotoIndex = index),
                            child: Container(
                              width: 80.w,
                              margin: EdgeInsets.only(right: 10.w),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isSelected
                                      ? colors.primary
                                      : const Color(0xFFE0E0E0),
                                  width: isSelected ? 2.5 : 1,
                                ),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: _buildImageWidget(allImages[index]),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],

                  SizedBox(height: 20.h),

                  // ── Description ───────────────────────────────────
                  if (turf.description != null &&
                      turf.description!.trim().isNotEmpty) ...[
                    Text(
                      'Description',
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Text(
                      turf.description!.trim(),
                      style: textTheme.bodyMedium?.copyWith(
                        color: colors.textGrey,
                        height: 1.5,
                      ),
                    ),
                    SizedBox(height: 20.h),
                  ],

                  // ── Sports ────────────────────────────────────────
                  if (turf.sports.isNotEmpty) ...[
                    Text(
                      'Sports Offered (${turf.sports.length})',
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Wrap(
                      spacing: 8.w,
                      runSpacing: 8.h,
                      children: turf.sports
                          .map(
                            (s) => _Chip(
                              label: s,
                              color: colors.primary,
                              textTheme: textTheme,
                            ),
                          )
                          .toList(),
                    ),
                    SizedBox(height: 20.h),
                  ],

                  // ── Amenities ─────────────────────────────────────
                  if (turf.amenities.isNotEmpty) ...[
                    Text(
                      'Amenities (${turf.amenities.length})',
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Wrap(
                      spacing: 8.w,
                      runSpacing: 8.h,
                      children: turf.amenities
                          .map(
                            (a) => _Chip(
                              label: a,
                              color: const Color(0xFF4F46E5),
                              textTheme: textTheme,
                            ),
                          )
                          .toList(),
                    ),
                    SizedBox(height: 20.h),
                  ],

                  // ── Available Slots ───────────────────────────────
                  if (turf.availableSlots.isNotEmpty) ...[
                    Text(
                      'Available Time Slots (${turf.availableSlots.length})',
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Wrap(
                      spacing: 6.w,
                      runSpacing: 6.h,
                      children: turf.availableSlots
                          .map(
                            (slot) => Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 10.w,
                                vertical: 6.h,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                TimeHelper.formatTo12Hour(slot),
                                style: TextStyle(
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.w600,
                                  color: colors.textTitle,
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    SizedBox(height: 20.h),
                  ],

                  // ── Contact Info ──────────────────────────────────
                  if ((turf.contactPhone != null &&
                          turf.contactPhone!.isNotEmpty) ||
                      (turf.contactEmail != null &&
                          turf.contactEmail!.isNotEmpty)) ...[
                    Text(
                      'Contact Information',
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 10.h),
                    Container(
                      padding: EdgeInsets.all(12.w),
                      decoration: BoxDecoration(
                        color: colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF0F0F0)),
                      ),
                      child: Column(
                        children: [
                          if (turf.contactPhone != null &&
                              turf.contactPhone!.isNotEmpty)
                            InkWell(
                              onTap: () => _openPhone(turf.contactPhone),
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 4.h),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.phone_rounded,
                                      size: 18,
                                      color: colors.primary,
                                    ),
                                    SizedBox(width: 10.w),
                                    Expanded(
                                      child: Text(
                                        turf.contactPhone!,
                                        style: textTheme.bodyMedium,
                                      ),
                                    ),
                                    Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      size: 12,
                                      color: colors.textGrey,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          if (turf.contactPhone != null &&
                              turf.contactPhone!.isNotEmpty &&
                              turf.contactEmail != null &&
                              turf.contactEmail!.isNotEmpty)
                            const Divider(height: 16),
                          if (turf.contactEmail != null &&
                              turf.contactEmail!.isNotEmpty)
                            InkWell(
                              onTap: () => _openEmail(turf.contactEmail),
                              child: Padding(
                                padding: EdgeInsets.symmetric(vertical: 4.h),
                                child: Row(
                                  children: [
                                    Icon(
                                      Icons.email_rounded,
                                      size: 18,
                                      color: colors.primary,
                                    ),
                                    SizedBox(width: 10.w),
                                    Expanded(
                                      child: Text(
                                        turf.contactEmail!,
                                        style: textTheme.bodyMedium,
                                      ),
                                    ),
                                    Icon(
                                      Icons.arrow_forward_ios_rounded,
                                      size: 12,
                                      color: colors.textGrey,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    SizedBox(height: 20.h),
                  ],

                  // ── Rules & Guidelines ────────────────────────────
                  if (turf.rules != null && turf.rules!.trim().isNotEmpty) ...[
                    Text(
                      'Rules & Guidelines',
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(14.w),
                      decoration: BoxDecoration(
                        color: colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF0F0F0)),
                      ),
                      child: Text(
                        turf.rules!.trim(),
                        style: textTheme.bodySmall?.copyWith(
                          color: colors.textGrey,
                          height: 1.5,
                        ),
                      ),
                    ),
                    SizedBox(height: 20.h),
                  ],

                  SizedBox(height: 20.h),
                ],
              ),
            ),
          ),
        ),

        // ── Sticky Edit Button at the Bottom ───────────────────────
        bottomNavigationBar: Container(
          padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 20.h),
          decoration: BoxDecoration(
            color: colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 10,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Expanded(
                  child: MyButtons(
                    text: 'Edit Turf Details',
                    height: 50.h,
                    width: double.infinity,
                    onTap: () =>
                        Get.to(() => OwnerEditTurfPage(turf: turf)),
                    textStyle: textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                    backgroundColor: const Color(0xFFE43434),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}

class _SpecItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final AppColors colors;
  final TextTheme textTheme;

  const _SpecItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.colors,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 20, color: colors.primary),
        SizedBox(height: 4.h),
        Text(
          label,
          style: TextStyle(
            fontSize: 10.sp,
            color: colors.textGrey,
          ),
        ),
        SizedBox(height: 2.h),
        Text(
          value,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontSize: 11.sp,
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final Color color;
  final TextTheme textTheme;
  const _Chip({
    required this.label,
    required this.color,
    required this.textTheme,
  });

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
