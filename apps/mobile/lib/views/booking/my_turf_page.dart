import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/booking/add_turf_page.dart';
import 'package:mobile/views/booking/owner_booking_page.dart';
import 'package:mobile/views/booking/owner_detail_page.dart';
import 'package:mobile/views/booking/owner_edit_turf_page.dart';

class MyTurfsPage extends StatefulWidget {
  const MyTurfsPage({super.key});

  @override
  State<MyTurfsPage> createState() => _MyTurfsPageState();
}

class _MyTurfsPageState extends State<MyTurfsPage> {
  final TextEditingController _searchCtrl = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();
  final ScrollController _scrollCtrl = ScrollController();
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final vm = Get.isRegistered<OwnerViewmodel>()
          ? Get.find<OwnerViewmodel>()
          : Get.put(OwnerViewmodel(), permanent: true);
      vm.fetchMyTurfs();
    });
  }

  void _onScroll() {
    if (_scrollCtrl.hasClients &&
        _scrollCtrl.position.pixels >=
            _scrollCtrl.position.maxScrollExtent - 200) {
      final vm = Get.isRegistered<OwnerViewmodel>()
          ? Get.find<OwnerViewmodel>()
          : Get.put(OwnerViewmodel(), permanent: true);
      vm.loadNextTurfsPage();
    }
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    _searchCtrl.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  void _closeSearch() {
    setState(() {
      _isSearching = false;
      _searchCtrl.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final vm = Get.isRegistered<OwnerViewmodel>()
        ? Get.find<OwnerViewmodel>()
        : Get.put(OwnerViewmodel(), permanent: true);

    return PopScope(
      canPop: !_isSearching,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_isSearching) {
          _closeSearch();
        }
      },
      child: Scaffold(
        backgroundColor: colors.background,
        appBar: AppBar(
          backgroundColor: colors.white,
          elevation: 0,
          automaticallyImplyLeading: false,
          title: _isSearching
              ? TextField(
                  controller: _searchCtrl,
                  focusNode: _searchFocusNode,
                  autofocus: true,
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: colors.textTitle,
                  ),
                  textInputAction: TextInputAction.search,
                  onChanged: (val) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search turfs, city, sport...',
                    hintStyle: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                    ),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      vertical: 10.h,
                      horizontal: 4.w,
                    ),
                    prefixIcon: Icon(
                      Icons.search_rounded,
                      size: 20,
                      color: colors.primary,
                    ),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: Icon(
                              Icons.clear_rounded,
                              size: 18,
                              color: colors.textGrey,
                            ),
                            onPressed: () {
                              _searchCtrl.clear();
                              setState(() {});
                            },
                          )
                        : null,
                  ),
                )
              : Text(
                  'My Turfs',
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
          centerTitle: !_isSearching,
          actions: [
            IconButton(
              icon: Icon(
                _isSearching ? Icons.close_rounded : Icons.search_rounded,
                color: colors.textTitle,
                size: 24,
              ),
              tooltip: _isSearching ? 'Close search' : 'Search turfs',
              onPressed: () {
                if (_isSearching) {
                  _closeSearch();
                } else {
                  setState(() {
                    _isSearching = true;
                  });
                  _searchFocusNode.requestFocus();
                }
              },
            ),
            if (!_isSearching)
              IconButton(
                icon: Icon(Icons.add_rounded, color: colors.primary, size: 26),
                tooltip: 'Add Turf',
                onPressed: () async {
                  await Get.to(() => const AddTurfPage());
                  vm.fetchMyTurfs();
                },
              ),
            SizedBox(width: 4.w),
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

          final query = _searchCtrl.text.trim().toLowerCase();
          final filteredTurfs = query.isEmpty
              ? vm.myTurfs.toList()
              : vm.myTurfs.where((t) {
                  final name = t.name.toLowerCase();
                  final city = (t.city ?? '').toLowerCase();
                  final state = (t.state ?? '').toLowerCase();
                  final address = t.address.toLowerCase();
                  final sports = t.sports.map((s) => s.toLowerCase()).join(' ');
                  return name.contains(query) ||
                      city.contains(query) ||
                      state.contains(query) ||
                      address.contains(query) ||
                      sports.contains(query);
                }).toList();

          if (filteredTurfs.isEmpty) {
            return _NoTurfSearchResults(
              query: _searchCtrl.text.trim(),
              onClear: () {
                setState(() {
                  _searchCtrl.clear();
                });
              },
              colors: colors,
              textTheme: textTheme,
            );
          }

          final isTablet = context.isTablet;
          final columns = context.turfGridColumns;
          final horizontalPad = isTablet ? 20.w : 16.w;

          final hasMore = vm.myTurfsHasMore.value;
          final isFetchingMore = vm.isFetchingMoreTurfs.value;

          return RefreshIndicator(
            color: colors.primary,
            onRefresh: () => vm.fetchMyTurfs(),
            child: columns > 1
                ? GridView.builder(
                    controller: _scrollCtrl,
                    padding: EdgeInsets.symmetric(
                      horizontal: horizontalPad,
                      vertical: 16.h,
                    ),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: columns,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      mainAxisExtent: 295,
                    ),
                    itemCount: filteredTurfs.length + (hasMore ? 1 : 0),
                    itemBuilder: (context, i) {
                      if (i == filteredTurfs.length) {
                        return Center(
                          child: isFetchingMore
                              ? CircularProgressIndicator(
                                  color: colors.primary,
                                  strokeWidth: 2,
                                )
                              : const SizedBox.shrink(),
                        );
                      }
                      return _OwnerTurfCard(
                        turf: filteredTurfs[i],
                        colors: colors,
                        textTheme: textTheme,
                        vm: vm,
                      );
                    },
                  )
                : ListView.separated(
                    controller: _scrollCtrl,
                    padding: EdgeInsets.all(16.w),
                    itemCount: filteredTurfs.length + (hasMore ? 1 : 0),
                    separatorBuilder: (_, _) => SizedBox(height: 12.h),
                    itemBuilder: (context, i) {
                      if (i == filteredTurfs.length) {
                        return Padding(
                          padding: EdgeInsets.symmetric(vertical: 16.h),
                          child: Center(
                            child: isFetchingMore
                                ? CircularProgressIndicator(
                                    color: colors.primary,
                                    strokeWidth: 2,
                                  )
                                : const SizedBox.shrink(),
                          ),
                        );
                      }
                      return _OwnerTurfCard(
                        turf: filteredTurfs[i],
                        colors: colors,
                        textTheme: textTheme,
                        vm: vm,
                      );
                    },
                  ),
          );
        }),
        floatingActionButton: _isSearching
            ? null
            : FloatingActionButton.extended(
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

  Widget _buildPlaceholder(AppColors colors) {
    return Container(
      height: 160.h,
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Color(0xFFF1F5F9),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF8FAFC), Color(0xFFE2E8F0)],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(
                Icons.sports_soccer_rounded,
                color: colors.primary.withValues(alpha: 0.7),
                size: 28,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'No photo available',
              style: TextStyle(
                color: colors.textGrey,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage(AppColors colors) {
    final validImages = turf.images
        .where((img) => img.trim().isNotEmpty)
        .toList();

    if (validImages.isEmpty) {
      return _buildPlaceholder(colors);
    }

    final rawPath = validImages.first.trim();

    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return Image.network(
        rawPath,
        height: 160.h,
        width: double.infinity,
        fit: BoxFit.cover,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            height: 160.h,
            width: double.infinity,
            color: const Color(0xFFF1F5F9),
            alignment: Alignment.center,
            child: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded /
                          loadingProgress.expectedTotalBytes!
                    : null,
                color: colors.primary,
              ),
            ),
          );
        },
        errorBuilder: (_, _, _) => _buildPlaceholder(colors),
      );
    }

    final file = File(rawPath);
    if (file.existsSync()) {
      return Image.file(
        file,
        height: 160.h,
        width: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => _buildPlaceholder(colors),
      );
    }

    return _buildPlaceholder(colors);
  }

  @override
  Widget build(BuildContext context) {
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
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image + Status badge
            SizedBox(
              height: 160.h,
              width: double.infinity,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(14),
                    ),
                    child: _buildImage(colors),
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
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 4,
                            offset: const Offset(0, 1),
                          ),
                        ],
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
                      IconButton(
                        onPressed: () => Get.to(
                          () => OwnerBookingsPage(
                            preselectedTurfId: turf.id,
                            preselectedTurfName: turf.name,
                          ),
                        ),
                        icon: const Icon(
                          Icons.confirmation_number_outlined,
                          size: 18,
                        ),
                        tooltip: 'View Bookings',
                        style: IconButton.styleFrom(
                          backgroundColor: const Color(0xFFEFF6FF),
                          foregroundColor: const Color(0xFF2563EB),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                            side: const BorderSide(color: Color(0xFFBFDBFE)),
                          ),
                          padding: EdgeInsets.all(8.w),
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () =>
                              Get.to(() => OwnerEditTurfPage(turf: turf)),
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
                      SizedBox(width: 8.w),
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
                      if (!isPublished) ...[
                        SizedBox(width: 8.w),
                        IconButton(
                          onPressed: () => _confirmDelete(context, turf),
                          icon: const Icon(
                            Icons.delete_outline_rounded,
                            color: Color(0xFFE43434),
                            size: 20,
                          ),
                          tooltip: 'Delete unpublished turf',
                          style: IconButton.styleFrom(
                            backgroundColor: const Color(0xFFFEE2E2),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: EdgeInsets.all(8.w),
                          ),
                        ),
                      ],
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

  void _confirmDelete(BuildContext context, TurfModel turf) {
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
        Get.back();
        await vm.deleteTurf(turf.id);
      },
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
            color: colors.textGrey.withValues(alpha: 0.4),
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

// ── No Search Results State ─────────────────────────────────
class _NoTurfSearchResults extends StatelessWidget {
  final String query;
  final VoidCallback onClear;
  final AppColors colors;
  final TextTheme textTheme;

  const _NoTurfSearchResults({
    required this.query,
    required this.onClear,
    required this.colors,
    required this.textTheme,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 28.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: colors.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.search_off_rounded,
                size: 36,
                color: colors.primary,
              ),
            ),
            SizedBox(height: 16.h),
            Text(
              'No turfs found',
              style: textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: colors.textTitle,
              ),
            ),
            SizedBox(height: 6.h),
            Text(
              'No turf matches "$query". Try checking the spelling or search another keyword.',
              textAlign: TextAlign.center,
              style: textTheme.bodySmall?.copyWith(
                color: colors.textGrey,
                height: 1.4,
              ),
            ),
            SizedBox(height: 20.h),
            OutlinedButton.icon(
              onPressed: onClear,
              icon: const Icon(Icons.clear_rounded, size: 16),
              label: const Text('Clear Search'),
              style: OutlinedButton.styleFrom(
                foregroundColor: colors.primary,
                side: BorderSide(color: colors.primary.withValues(alpha: 0.4)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: EdgeInsets.symmetric(horizontal: 18.w, vertical: 10.h),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
