import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/add_turf_page.dart';
import 'package:mobile/views/booking/owner_detail_page.dart';

class MyTurfsPage extends StatelessWidget {
  const MyTurfsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final vm = Get.find<OwnerViewmodel>()..fetchMyTurfs();

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.white,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text(
          'My Turfs',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(Icons.add_rounded, color: colors.primary, size: 26),
            onPressed: () async {
              await Get.to(() => const AddTurfPage());
              vm.fetchMyTurfs();
            },
          ),
        ],
      ),
      body: Obx(() {
        if (vm.isTurfsLoading.value && vm.myTurfs.isEmpty) {
          return Center(
            child: CircularProgressIndicator(color: colors.primary),
          );
        }
        if (vm.myTurfs.isEmpty) {
          return _EmptyTurfs(colors: colors, textTheme: textTheme);
        }
        return RefreshIndicator(
          color: colors.primary,
          onRefresh: () => vm.fetchMyTurfs(),
          child: ListView.separated(
            padding: EdgeInsets.all(16.w),
            itemCount: vm.myTurfs.length,
            separatorBuilder: (_, __) => SizedBox(height: 12.h),
            itemBuilder: (context, i) => _OwnerTurfCard(
              turf: vm.myTurfs[i],
              colors: colors,
              textTheme: textTheme,
              vm: vm,
            ),
          ),
        );
      }),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          await Get.to(() => const AddTurfPage());
          vm.fetchMyTurfs();
        },
        backgroundColor: colors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: Text(
          'Add Turf',
          style: textTheme.bodyMedium?.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// ── Owner Turf Card ──────────────────────────────────────────
class _OwnerTurfCard extends StatelessWidget {
  final TurfModel turf;
  final AppColors colors;
  final TextTheme textTheme;
  final OwnerViewmodel vm;

  const _OwnerTurfCard({
    required this.turf,
    required this.colors,
    required this.textTheme,
    required this.vm,
  });

  @override
  Widget build(BuildContext context) {
    final imageUrl = turf.images.isNotEmpty
        ? turf.images.first
        : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80';

    final isPublished = turf.isPublished;

    return GestureDetector(
      onTap: () => Get.to(() => OwnerTurfDetailPage(turf: turf)),
      child: Container(
        decoration: BoxDecoration(
          color: colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE8E8E8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image + Status badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(14),
                  ),
                  child: Image.network(
                    imageUrl,
                    height: 160.h,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 160.h,
                      color: Colors.grey[200],
                      child: const Icon(
                        Icons.sports_soccer,
                        color: Colors.grey,
                        size: 40,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 10.w,
                      vertical: 5.h,
                    ),
                    decoration: BoxDecoration(
                      color: isPublished
                          ? const Color(0xFF059669)
                          : Colors.grey[600],
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      isPublished ? 'Published' : 'Draft',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Info
            Padding(
              padding: EdgeInsets.all(14.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          turf.name,
                          style: textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: colors.textTitle,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '₹${turf.pricePerHour}/hr',
                        style: textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: colors.primary,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 4.h),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_rounded,
                        size: 14,
                        color: colors.textGrey,
                      ),
                      SizedBox(width: 4.w),
                      Expanded(
                        child: Text(
                          turf.address,
                          style: textTheme.bodySmall?.copyWith(
                            color: colors.textGrey,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12.h),

                  // Action buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () =>
                              Get.to(() => OwnerTurfDetailPage(turf: turf)),
                          icon: Icon(
                            Icons.edit_outlined,
                            size: 15,
                            color: colors.primary,
                          ),
                          label: Text(
                            'Edit',
                            style: textTheme.bodySmall?.copyWith(
                              color: colors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: colors.primary),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: EdgeInsets.symmetric(vertical: 8.h),
                          ),
                        ),
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () {
                            if (isPublished) {
                              vm.unpublishTurf(turf.id);
                            } else {
                              vm.publishTurf(turf.id);
                            }
                          },
                          icon: Icon(
                            isPublished
                                ? Icons.unpublished_outlined
                                : Icons.publish_rounded,
                            size: 15,
                            color: Colors.white,
                          ),
                          label: Text(
                            isPublished ? 'Unpublish' : 'Publish',
                            style: textTheme.bodySmall?.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isPublished
                                ? Colors.grey[600]
                                : const Color(0xFF059669),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            elevation: 0,
                            padding: EdgeInsets.symmetric(vertical: 8.h),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Empty state ──────────────────────────────────────────────
class _EmptyTurfs extends StatelessWidget {
  final AppColors colors;
  final TextTheme textTheme;
  const _EmptyTurfs({required this.colors, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.sports_soccer_outlined,
            size: 64,
            color: colors.textGrey.withOpacity(0.4),
          ),
          SizedBox(height: 16.h),
          Text(
            'No turfs yet',
            style: textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w700,
              color: colors.textTitle,
            ),
          ),
          SizedBox(height: 6.h),
          Text(
            'Add your first turf to get started',
            style: textTheme.bodyMedium?.copyWith(color: colors.textGrey),
          ),
        ],
      ),
    );
  }
}
