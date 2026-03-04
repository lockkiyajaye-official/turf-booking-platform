import 'package:flutter/material.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/turf_model.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;

  final List<String> _recentSearches = [
    'Football Turf',
    'Cricket Ground',
  ];

  final List<TurfItem> _popularTurfs = [
    TurfItem(
      name: 'Grandfield',
      location: 'HSR Layout, 2km',
      price: 800,
      imageUrl:
          'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80',
    ),
    TurfItem(
      name: 'Win Arena',
      location: 'Indirangar, 1.8km',
      price: 800,
      imageUrl:
          'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80',
    ),
    TurfItem(
      name: 'Real Arena',
      location: 'HBR Layout, 7km',
      price: 800,
      imageUrl:
          'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&q=80',
    ),
  ];

  final List<String> _nearbyAreas = [
    'Indirangar',
    'Koramangala',
    'Electronic City',
  ];

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
          children: [
            // ── Search bar ───────────────────────────────────────
            Padding(
              padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 8.h),
              child: Material(
                elevation: 2,
                shadowColor: Colors.black12,
                borderRadius: BorderRadius.circular(10),
                child: TextField(
                  controller: _searchController,
                  autofocus: false,
                  onChanged: (v) =>
                      setState(() => _isSearching = v.trim().isNotEmpty),
                  decoration: InputDecoration(
                    hintText: 'Search turf by location, name or sport',
                    hintStyle: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 14.sp,
                    ),
                    prefixIcon: Icon(Icons.search,
                        color: Colors.grey[500], size: 20),
                    suffixIcon: _isSearching
                        ? IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            color: Colors.grey[500],
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _isSearching = false);
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: EdgeInsets.symmetric(vertical: 14.h),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
            ),

            // ── Scrollable content ───────────────────────────────
            Expanded(
              child: ListView(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                children: [
                  SizedBox(height: 8.h),

                  // Recent Searches
                  _SectionTitle(title: 'Recent Searches', textTheme: textTheme),
                  SizedBox(height: 8.h),
                  ..._recentSearches.map(
                    (item) => _RecentSearchTile(
                      label: item,
                      textTheme: textTheme,
                      onTap: () {
                        _searchController.text = item;
                        setState(() => _isSearching = true);
                      },
                    ),
                  ),

                  SizedBox(height: 20.h),

                  // Popular Turfs
                  _SectionTitle(title: 'Popular Turfs', textTheme: textTheme),
                  SizedBox(height: 12.h),
                  SizedBox(
                    height: 170.h,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _popularTurfs.length,
                      separatorBuilder: (_, __) => SizedBox(width: 12.w),
                      itemBuilder: (context, index) {
                        final turf = _popularTurfs[index];
                        return _TurfCard(turf: turf, textTheme: textTheme);
                      },
                    ),
                  ),

                  SizedBox(height: 24.h),

                  // Nearby Areas
                  _SectionTitle(title: 'Nearby Areas', textTheme: textTheme),
                  SizedBox(height: 12.h),
                  Wrap(
                    spacing: 10.w,
                    runSpacing: 10.h,
                    children: _nearbyAreas
                        .map((area) => _AreaChip(
                              label: area,
                              textTheme: textTheme,
                              colors: colors,
                            ))
                        .toList(),
                  ),
                  SizedBox(height: 24.h),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Section title ────────────────────────────────────────────────────────────
class _SectionTitle extends StatelessWidget {
  final String title;
  final TextTheme textTheme;

  const _SectionTitle({required this.title, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w700,
        fontSize: 15.sp,
        color: const Color(0xFF1C1C1E),
      ),
    );
  }
}

// ── Recent search tile ────────────────────────────────────────────────────────
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
                Icon(Icons.north_west, size: 16, color: Colors.grey[400]),
              ],
            ),
          ),
        ),
        Divider(height: 1, color: Colors.grey[200]),
      ],
    );
  }
}

// ── Popular turf card ─────────────────────────────────────────────────────────
class _TurfCard extends StatelessWidget {
  final TurfItem turf;
  final TextTheme textTheme;

  const _TurfCard({required this.turf, required this.textTheme});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 110.w,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.network(
              turf.imageUrl,
              height: 90.h,
              width: 110.w,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 90.h,
                width: 110.w,
                color: Colors.grey[200],
                child: const Icon(Icons.sports_soccer, color: Colors.grey),
              ),
            ),
          ),
          SizedBox(height: 6.h),
          Text(
            turf.name,
            style: textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w700,
              fontSize: 13.sp,
              color: const Color(0xFF1C1C1E),
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: 2.h),
          Text(
            turf.location,
            style: textTheme.bodySmall?.copyWith(
              color: Colors.grey[500],
              fontSize: 11.sp,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: 2.h),
          Text(
            '₹${turf.price} Rs/hr',
            style: textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w700,
              fontSize: 12.sp,
              color: const Color(0xFF1C1C1E),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Nearby area chip ──────────────────────────────────────────────────────────
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

// ── Data model ────────────────────────────────────────────────────────────────
