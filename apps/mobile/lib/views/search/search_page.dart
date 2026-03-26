import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/storage/local_storage.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/viewmodels/turf/turf_viewmodel.dart';
import 'package:mobile/views/home/widgets/booking_details.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  String _query = '';

  List<String> _recentSearches = [];

  final List<String> _nearbyAreas = [
    'Indiranagar',
    'Koramangala',
    'Electronic City',
  ];

  @override
  void initState() {
    super.initState();
    _loadRecentSearches();
  }

  void _loadRecentSearches() {
    final storage = Get.find<LocalStorageService>();
    setState(() {
      _recentSearches = storage.getSearchHistory();
    });
  }

  void _addToRecentSearches(String query) {
    final term = query.trim();
    if (term.isEmpty) return;

    setState(() {
      _recentSearches.removeWhere((item) => item.toLowerCase() == term.toLowerCase());
      _recentSearches.insert(0, term);
      if (_recentSearches.length > 5) {
        _recentSearches.removeLast();
      }
    });

    Get.find<LocalStorageService>().saveSearchHistory(_recentSearches);
  }

  void _onSearch(String value) {
    setState(() {
      _query = value.trim();
      _isSearching = _query.isNotEmpty;
    });
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() {
      _query = '';
      _isSearching = false;
    });
  }

  List<TurfModel> _filterTurfs(List<TurfModel> turfs) {
    if (_query.isEmpty) return turfs;
    final q = _query.toLowerCase();
    return turfs
        .where((t) =>
            t.name.toLowerCase().contains(q) ||
            t.address.toLowerCase().contains(q))
        .toList();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Search bar ───────────────────────────────────
            Padding(
              padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 8.h),
              child: Container(
                height: 46.h,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE8E8E8)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  autofocus: false,
                  onChanged: _onSearch,
                  onSubmitted: (value) {
                    _addToRecentSearches(value);
                    _onSearch(value);
                  },
                  style: textTheme.bodyMedium,
                  decoration: InputDecoration(
                    hintText: 'Search turf by location, name or sport',
                    hintStyle: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 14.sp,
                    ),
                    prefixIcon:
                        Icon(Icons.search, color: Colors.grey[500], size: 20),
                    suffixIcon: _isSearching
                        ? IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            color: Colors.grey[500],
                            onPressed: _clearSearch,
                          )
                        : null,
                    filled: true,
                    fillColor: Colors.transparent,
                    contentPadding: EdgeInsets.symmetric(vertical: 14.h),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                  ),
                ),
              ),
            ),

            // ── Body ─────────────────────────────────────────
            Expanded(
              child: GetX<TurfViewmodel>(
                init: Get.find<TurfViewmodel>()..fetchAllTurfs(),
                builder: (vm) {
                  if (_isSearching) {
                    return _SearchResultsView(
                      query: _query,
                      turfs: _filterTurfs(vm.turfs.toList()),
                      isLoading: vm.isLoading.value,
                      colors: colors,
                      textTheme: textTheme,
                    );
                  }
                  return _DefaultView(
                    recentSearches: _recentSearches,
                    nearbyAreas: _nearbyAreas,
                    turfs: vm.turfs.toList(),
                    isLoading: vm.isLoading.value,
                    colors: colors,
                    textTheme: textTheme,
                    onRecentTap: (term) {
                      _searchController.text = term;
                      _onSearch(term);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DEFAULT VIEW
// ─────────────────────────────────────────────────────────────
class _DefaultView extends StatelessWidget {
  final List<String> recentSearches;
  final List<String> nearbyAreas;
  final List<TurfModel> turfs;
  final bool isLoading;
  final AppColors colors;
  final TextTheme textTheme;
  final ValueChanged<String> onRecentTap;

  const _DefaultView({
    required this.recentSearches,
    required this.nearbyAreas,
    required this.turfs,
    required this.isLoading,
    required this.colors,
    required this.textTheme,
    required this.onRecentTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      children: [
        SizedBox(height: 8.h),

        // Recent Searches
        if (recentSearches.isNotEmpty) ...[
          _SectionTitle(title: 'Recent Searches', textTheme: textTheme),
          SizedBox(height: 4.h),
          ...recentSearches.map(
            (item) => _RecentSearchTile(
              label: item,
              textTheme: textTheme,
              onTap: () => onRecentTap(item),
            ),
          ),
          SizedBox(height: 24.h),
        ],

        // Popular Turfs
        _SectionTitle(title: 'Popular Turfs', textTheme: textTheme),
        SizedBox(height: 12.h),
        SizedBox(
          height: 175.h,
          child: isLoading && turfs.isEmpty
              ? Center(
                  child: CircularProgressIndicator(color: colors.primary))
              : turfs.isEmpty
                  ? Center(
                      child: Text(
                        'No turfs available.',
                        style:
                            textTheme.bodySmall?.copyWith(color: colors.textGrey),
                      ),
                    )
                  : ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: turfs.length,
                      separatorBuilder: (_, __) => SizedBox(width: 12.w),
                      itemBuilder: (_, i) => _PopularTurfCard(
                        turf: turfs[i],
                        textTheme: textTheme,
                      ),
                    ),
        ),

        SizedBox(height: 24.h),

        // Nearby Areas
        _SectionTitle(title: 'Nearby Areas', textTheme: textTheme),
        SizedBox(height: 12.h),
        Wrap(
          spacing: 10.w,
          runSpacing: 10.h,
          children: nearbyAreas
              .map((area) => _AreaChip(
                    label: area,
                    textTheme: textTheme,
                    colors: colors,
                  ))
              .toList(),
        ),

        SizedBox(height: 32.h),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
// SEARCH RESULTS VIEW
// ─────────────────────────────────────────────────────────────
class _SearchResultsView extends StatefulWidget {
  final String query;
  final List<TurfModel> turfs;
  final bool isLoading;
  final AppColors colors;
  final TextTheme textTheme;

  const _SearchResultsView({
    required this.query,
    required this.turfs,
    required this.isLoading,
    required this.colors,
    required this.textTheme,
  });

  @override
  State<_SearchResultsView> createState() => _SearchResultsViewState();
}

class _SearchResultsViewState extends State<_SearchResultsView> {
  String _sortBy = 'Relevance';
  final List<String> _sortOptions = [
    'Relevance',
    'Price: Low to High',
    'Price: High to Low',
    'Rating',
  ];

  List<TurfModel> get _sortedTurfs {
    final list = List<TurfModel>.from(widget.turfs);
    switch (_sortBy) {
      case 'Price: Low to High':
        list.sort((a, b) => a.pricePerHour.compareTo(b.pricePerHour));
        break;
      case 'Price: High to Low':
        list.sort((a, b) => b.pricePerHour.compareTo(a.pricePerHour));
        break;
      case 'Rating':
        list.sort((a, b) => (b.rating ?? 0).compareTo(a.rating ?? 0));
        break;
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final colors = widget.colors;
    final textTheme = widget.textTheme;

    return Column(
      children: [
        // Filter / Sort bar
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
          child: Row(
            children: [
              _ToolbarButton(
                icon: Icons.tune_rounded,
                label: 'Filter',
                textTheme: textTheme,
                onTap: () {
                  // TODO: open filter bottom sheet
                },
              ),
              const Spacer(),
              GestureDetector(
                onTap: () async {
                  final picked = await showModalBottomSheet<String>(
                    context: context,
                    shape: const RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(16)),
                    ),
                    builder: (_) => _SortSheet(
                      options: _sortOptions,
                      selected: _sortBy,
                    ),
                  );
                  if (picked != null) setState(() => _sortBy = picked);
                },
                child: Row(
                  children: [
                    Icon(Icons.sort_rounded,
                        size: 18, color: Colors.grey[600]),
                    SizedBox(width: 4.w),
                    Text(
                      'Sort by',
                      style: textTheme.bodySmall?.copyWith(
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        Divider(height: 1, color: Colors.grey[200]),

        // Results
        Expanded(
          child: widget.isLoading && widget.turfs.isEmpty
              ? Center(
                  child: CircularProgressIndicator(color: colors.primary))
              : _sortedTurfs.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.search_off_rounded,
                              size: 48, color: colors.textGrey),
                          SizedBox(height: 12.h),
                          Text(
                            'No results for "${widget.query}"',
                            style: textTheme.bodyMedium
                                ?.copyWith(color: colors.textGrey),
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding:
                          EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 32.h),
                      itemCount: _sortedTurfs.length,
                      separatorBuilder: (_, __) => SizedBox(height: 12.h),
                      itemBuilder: (_, i) => _ResultCard(
                        turf: _sortedTurfs[i],
                        textTheme: textTheme,
                        colors: colors,
                      ),
                    ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────
// RESULT CARD  — matches screenshot exactly
// ─────────────────────────────────────────────────────────────
class _ResultCard extends StatelessWidget {
  final TurfModel turf;
  final TextTheme textTheme;
  final AppColors colors;

  const _ResultCard({
    required this.turf,
    required this.textTheme,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    final imageUrl = turf.images.isNotEmpty
        ? turf.images.first
        : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80';

    return GestureDetector(
      onTap: () => Get.to(() => TurfDetailsPage(turf: turf)),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE8E8E8)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // ── Left: image + white rating badge ──────────────
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(12),
                    bottomLeft: Radius.circular(12),
                  ),
                  child: Image.network(
                    imageUrl,
                    width: 130.w,
                    height: 120.h,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 130.w,
                      height: 120.h,
                      color: Colors.grey[200],
                      child:
                          const Icon(Icons.sports_soccer, color: Colors.grey),
                    ),
                  ),
                ),
                // White pill badge — bottom left
                Positioned(
                  bottom: 8,
                  left: 8,
                  child: Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 7.w, vertical: 4.h),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.14),
                          blurRadius: 4,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 13, color: Colors.amber),
                        SizedBox(width: 3.w),
                        Text(
                          '${(turf.rating ?? 0.0).toStringAsFixed(1)} (${turf.totalReviews})',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF1C1C1E),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // ── Right: details ─────────────────────────────────
            Expanded(
              child: Padding(
                padding:
                    EdgeInsets.symmetric(horizontal: 12.w, vertical: 12.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name
                    Text(
                      turf.name,
                      style: textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF1C1C1E),
                        fontSize: 15.sp,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),

                    SizedBox(height: 4.h),

                    // Address
                    Text(
                      turf.address,
                      style: textTheme.bodySmall?.copyWith(
                        color: Colors.grey[500],
                        fontSize: 12.sp,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),

                    SizedBox(height: 8.h),

                    // Price
                    RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '₹${turf.pricePerHour}',
                            style: textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                              color: const Color(0xFF1C1C1E),
                              fontSize: 16.sp,
                            ),
                          ),
                          TextSpan(
                            text: ' /hour',
                            style: textTheme.bodySmall?.copyWith(
                              color: Colors.grey[500],
                              fontSize: 12.sp,
                            ),
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: 10.h),

                    // Book now — outlined red button
                    SizedBox(
                      width: double.infinity,
                      height: 34.h,
                      child: OutlinedButton(
                        onPressed: () => Get.to(() => TurfDetailsPage(turf: turf)),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: colors.primary, width: 1.5),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: EdgeInsets.zero,
                        ),
                        child: Text(
                          'Book now',
                          style: textTheme.bodySmall?.copyWith(
                            color: colors.primary,
                            fontWeight: FontWeight.w600,
                            fontSize: 13.sp,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// POPULAR TURF CARD  (horizontal scroll)
// ─────────────────────────────────────────────────────────────
class _PopularTurfCard extends StatelessWidget {
  final TurfModel turf;
  final TextTheme textTheme;

  const _PopularTurfCard({required this.turf, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    final imageUrl = turf.images.isNotEmpty
        ? turf.images.first
        : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80';

    return GestureDetector(
      onTap: () => Get.to(() => TurfDetailsPage(turf: turf)),
      child: SizedBox(
        width: 115.w,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(
                imageUrl,
                height: 90.h,
                width: 115.w,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 90.h,
                  width: 115.w,
                  color: Colors.grey[200],
                  child: const Icon(Icons.sports_soccer, color: Colors.grey),
                ),
              ),
            ),
            SizedBox(height: 6.h),
            Text(
              turf.name,
              style: textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w700,
                fontSize: 13.sp,
                color: const Color(0xFF1C1C1E),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 2.h),
            Text(
              turf.address,
              style: textTheme.bodySmall?.copyWith(
                color: Colors.grey[500],
                fontSize: 11.sp,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 2.h),
            Text(
              '₹${turf.pricePerHour} Rs/hr',
              style: textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w700,
                fontSize: 12.sp,
                color: const Color(0xFF1C1C1E),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// SHARED WIDGETS
// ─────────────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  final String title;
  final TextTheme textTheme;

  const _SectionTitle({required this.title, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: textTheme.titleSmall?.copyWith(
        fontWeight: FontWeight.w700,
        color: const Color(0xFF1C1C1E),
      ),
    );
  }
}

class _RecentSearchTile extends StatelessWidget {
  final String label;
  final TextTheme textTheme;
  final VoidCallback onTap;

  const _RecentSearchTile({
    required this.label,
    required this.textTheme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          child: Padding(
            padding: EdgeInsets.symmetric(vertical: 12.h),
            child: Row(
              children: [
                Icon(Icons.history, size: 18, color: Colors.grey[400]),
                SizedBox(width: 12.w),
                Expanded(
                  child: Text(
                    label,
                    style: textTheme.bodyMedium?.copyWith(
                      color: const Color(0xFF3A3A3C),
                      fontSize: 14.sp,
                    ),
                  ),
                ),
                Icon(Icons.north_west_rounded,
                    size: 16, color: Colors.grey[400]),
              ],
            ),
          ),
        ),
        Divider(height: 1, color: Colors.grey[200]),
      ],
    );
  }
}

class _AreaChip extends StatelessWidget {
  final String label;
  final TextTheme textTheme;
  final AppColors colors;

  const _AreaChip({
    required this.label,
    required this.textTheme,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.grey[300]!, width: 1),
        ),
        child: Text(
          label,
          style: textTheme.bodySmall?.copyWith(
            color: const Color(0xFF3A3A3C),
            fontSize: 13.sp,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class _ToolbarButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final TextTheme textTheme;
  final VoidCallback onTap;

  const _ToolbarButton({
    required this.icon,
    required this.label,
    required this.textTheme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, size: 16, color: Colors.black87),
            SizedBox(width: 6.w),
            Text(
              label,
              style: textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SortSheet extends StatelessWidget {
  final List<String> options;
  final String selected;

  const _SortSheet({required this.options, required this.selected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20.h),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Sort by',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          SizedBox(height: 16.h),
          ...options.map((opt) => ListTile(
                title: Text(
                  opt,
                  style: TextStyle(
                    fontWeight: opt == selected ? FontWeight.w700 : FontWeight.w500,
                    color: opt == selected ? Colors.black : Colors.grey[600],
                  ),
                ),
                trailing: opt == selected
                    ? Icon(Icons.check_circle, color: Colors.green)
                    : null,
                onTap: () => Navigator.pop(context, opt),
              )),
        ],
      ),
    );
  }
}