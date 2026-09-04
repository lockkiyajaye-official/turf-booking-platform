import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/data/models/review_model.dart';
import 'package:mobile/data/services/review_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/booking/widgets/rate_turf_bottom_sheet.dart';

class TurfReviewsSection extends StatefulWidget {
  final String turfId;
  final String turfName;
  final double? initialRating;
  final int initialTotalReviews;
  final Function(double newRating, int newTotalReviews)? onRatingUpdated;

  const TurfReviewsSection({
    super.key,
    required this.turfId,
    required this.turfName,
    this.initialRating,
    this.initialTotalReviews = 0,
    this.onRatingUpdated,
  });

  @override
  State<TurfReviewsSection> createState() => TurfReviewsSectionState();
}

class TurfReviewsSectionState extends State<TurfReviewsSection> {
  static const Color _primaryGreen = Color(0xFF0DAA6C);
  static const Color _goldColor = Color(0xFFFFB800);

  final ReviewService _reviewService = ReviewService();
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  bool _isLoading = true;
  List<ReviewModel> _reviews = [];
  ReviewModel? _myReview;
  late double _averageRating;
  late int _totalReviews;
  Map<int, int> _distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
  bool _showAll = false;

  @override
  void initState() {
    super.initState();
    _averageRating = widget.initialRating ?? 0.0;
    _totalReviews = widget.initialTotalReviews;
    fetchReviews();
  }

  Future<void> fetchReviews() async {
    setState(() => _isLoading = true);

    final futures = <Future>[
      _reviewService.getTurfReviews(widget.turfId),
    ];

    final token = _authVm.token.value;
    if (token.isNotEmpty) {
      futures.add(_reviewService.getMyReview(token, widget.turfId));
    }

    try {
      final results = await Future.wait(futures);
      final reviewsRes = results[0] as Map<String, dynamic>;

      if (mounted) {
        if (reviewsRes['success'] == true &&
            reviewsRes['data'] is TurfReviewsData) {
          final data = reviewsRes['data'] as TurfReviewsData;
          _reviews = data.reviews;
          _averageRating = data.summary.averageRating > 0
              ? data.summary.averageRating
              : (_averageRating > 0 ? _averageRating : 0.0);
          _totalReviews = data.summary.totalReviews > 0
              ? data.summary.totalReviews
              : (_totalReviews > 0 ? _totalReviews : data.total);
          _distribution = data.summary.distribution;
        }

        if (results.length > 1) {
          final myRes = results[1] as Map<String, dynamic>;
          if (myRes['success'] == true && myRes['data'] is ReviewModel) {
            _myReview = myRes['data'] as ReviewModel;
          } else {
            _myReview = null;
          }
        }

        _isLoading = false;
        setState(() {});
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void openRateSheet() {
    RateTurfBottomSheet.show(
      context: context,
      turfId: widget.turfId,
      turfName: widget.turfName,
      initialReview: _myReview,
      onReviewSubmitted: (rating, comment, summary) {
        if (summary != null) {
          setState(() {
            _averageRating = summary.averageRating;
            _totalReviews = summary.totalReviews;
            _distribution = summary.distribution;
          });
          widget.onRatingUpdated?.call(
            summary.averageRating,
            summary.totalReviews,
          );
        }
        fetchReviews();
      },
      onReviewDeleted: (summary) {
        if (summary != null) {
          setState(() {
            _averageRating = summary.averageRating;
            _totalReviews = summary.totalReviews;
            _distribution = summary.distribution;
            _myReview = null;
          });
          widget.onRatingUpdated?.call(
            summary.averageRating,
            summary.totalReviews,
          );
        }
        fetchReviews();
      },
    );
  }

  String _formatDate(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inDays == 0) {
      if (diff.inHours == 0) {
        return diff.inMinutes <= 1 ? 'Just now' : '${diff.inMinutes}m ago';
      }
      return '${diff.inHours}h ago';
    } else if (diff.inDays == 1) {
      return 'Yesterday';
    } else if (diff.inDays < 30) {
      return '${diff.inDays}d ago';
    } else {
      return '${dt.day}/${dt.month}/${dt.year}';
    }
  }

  Widget _buildStarRow(double rating, {double size = 14}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starValue = index + 1;
        if (rating >= starValue) {
          return Icon(Icons.star_rounded, color: _goldColor, size: size);
        } else if (rating >= starValue - 0.5) {
          return Icon(Icons.star_half_rounded, color: _goldColor, size: size);
        } else {
          return Icon(Icons.star_outline_rounded,
              color: Colors.grey[350], size: size);
        }
      }),
    );
  }

  Widget _buildDistributionBar(int stars, int count, int total) {
    final double pct = total > 0 ? (count / total).clamp(0.0, 1.0) : 0.0;

    return Padding(
      padding: EdgeInsets.symmetric(vertical: 2.h),
      child: Row(
        children: [
          Text(
            '$stars',
            style: TextStyle(
              fontSize: 10.sp,
              fontWeight: FontWeight.w600,
              color: Colors.grey[700],
            ),
          ),
          SizedBox(width: 2.w),
          Icon(Icons.star_rounded, size: 10.sp, color: _goldColor),
          SizedBox(width: 6.w),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: pct,
                minHeight: 5.h,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(_goldColor),
              ),
            ),
          ),
          SizedBox(width: 8.w),
          SizedBox(
            width: 24.w,
            child: Text(
              '$count',
              textAlign: TextAlign.end,
              style: TextStyle(
                fontSize: 10.sp,
                color: Colors.grey[500],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header & Rate Turf Action
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                  'Ratings & Reviews',
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFF454555),
                    fontSize: 14.sp,
                  ),
                ),
                if (_totalReviews > 0) ...[
                  SizedBox(width: 6.w),
                  Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 6.w, vertical: 2.h),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey[300]!, width: 0.8),
                    ),
                    child: Text(
                      '$_totalReviews',
                      style: TextStyle(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[700],
                      ),
                    ),
                  ),
                ],
              ],
            ),
            GestureDetector(
              onTap: openRateSheet,
              child: Container(
                padding:
                    EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.h),
                decoration: BoxDecoration(
                  color: _primaryGreen.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _primaryGreen.withValues(alpha: 0.35)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _myReview != null
                          ? Icons.edit_outlined
                          : Icons.star_border_rounded,
                      size: 13.sp,
                      color: _primaryGreen,
                    ),
                    SizedBox(width: 4.w),
                    Text(
                      _myReview != null ? 'Edit Review' : 'Rate Turf',
                      style: TextStyle(
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w700,
                        color: _primaryGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),

        SizedBox(height: 12.h),

        // Rating Overview Card
        Container(
          padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
          decoration: BoxDecoration(
            color: const Color(0xFFFAFAFA),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Row(
            children: [
              // Big Score
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _averageRating > 0
                        ? _averageRating.toStringAsFixed(1)
                        : '0.0',
                    style: TextStyle(
                      fontSize: 28.sp,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF1C1C1E),
                      height: 1.1,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  _buildStarRow(_averageRating, size: 14.sp),
                  SizedBox(height: 4.h),
                  Text(
                    '$_totalReviews ${_totalReviews == 1 ? "review" : "reviews"}',
                    style: TextStyle(
                      fontSize: 10.sp,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),

              SizedBox(width: 16.w),
              Container(width: 1, height: 64.h, color: Colors.grey[300]),
              SizedBox(width: 16.w),

              // Breakdown progress bars
              Expanded(
                child: Column(
                  children: [
                    _buildDistributionBar(5, _distribution[5] ?? 0, _totalReviews),
                    _buildDistributionBar(4, _distribution[4] ?? 0, _totalReviews),
                    _buildDistributionBar(3, _distribution[3] ?? 0, _totalReviews),
                    _buildDistributionBar(2, _distribution[2] ?? 0, _totalReviews),
                    _buildDistributionBar(1, _distribution[1] ?? 0, _totalReviews),
                  ],
                ),
              ),
            ],
          ),
        ),

        // User's own review highlight
        if (_myReview != null) ...[
          SizedBox(height: 12.h),
          GestureDetector(
            onTap: openRateSheet,
            child: Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: _primaryGreen.withValues(alpha: 0.04),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: _primaryGreen.withValues(alpha: 0.25)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 6.w, vertical: 2.h),
                            decoration: BoxDecoration(
                              color: _primaryGreen,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Your Review',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 9.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          SizedBox(width: 8.w),
                          _buildStarRow(_myReview!.rating.toDouble(), size: 12.sp),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            _formatDate(_myReview!.createdAt),
                            style: TextStyle(
                              fontSize: 10.sp,
                              color: Colors.grey[500],
                            ),
                          ),
                          SizedBox(width: 6.w),
                          Icon(
                            Icons.edit_outlined,
                            size: 13.sp,
                            color: _primaryGreen,
                          ),
                        ],
                      ),
                    ],
                  ),
                  if (_myReview!.comment?.isNotEmpty == true) ...[
                    SizedBox(height: 6.h),
                    Text(
                      _myReview!.comment!,
                      style: textTheme.bodySmall?.copyWith(
                        color: const Color(0xFF333333),
                        fontSize: 12.sp,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],

        SizedBox(height: 12.h),

        // Community Reviews List (excluding current user's review)
        Builder(
          builder: (context) {
            if (_isLoading) {
              return Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 16.h),
                  child: SizedBox(
                    width: 20.w,
                    height: 20.w,
                    child: const CircularProgressIndicator(
                      strokeWidth: 2,
                      color: _primaryGreen,
                    ),
                  ),
                ),
              );
            }

            final otherReviews = _reviews.where((rev) {
              if (_myReview != null) {
                if (rev.id == _myReview!.id) return false;
                if (rev.userId.isNotEmpty && rev.userId == _myReview!.userId) {
                  return false;
                }
              }
              return true;
            }).toList();

            if (otherReviews.isEmpty && _myReview == null) {
              return Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(vertical: 18.h, horizontal: 16.w),
                decoration: BoxDecoration(
                  color: const Color(0xFFFBFBFB),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.rate_review_outlined,
                      size: 28.sp,
                      color: Colors.grey[400],
                    ),
                    SizedBox(height: 6.h),
                    Text(
                      'No reviews yet',
                      style: TextStyle(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[700],
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Text(
                      'Have you played here? Tap to share your rating!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11.sp,
                        color: Colors.grey[500],
                      ),
                    ),
                    SizedBox(height: 8.h),
                    TextButton(
                      onPressed: openRateSheet,
                      style: TextButton.styleFrom(
                        visualDensity: VisualDensity.compact,
                        foregroundColor: _primaryGreen,
                      ),
                      child: Text(
                        'Rate this Turf',
                        style: TextStyle(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }

            if (otherReviews.isEmpty) {
              return const SizedBox.shrink();
            }

            final displayedReviews =
                _showAll ? otherReviews : otherReviews.take(3).toList();

            return Column(
              children: [
                ...displayedReviews.map((rev) {
                  final initials = rev.userName.isNotEmpty
                      ? rev.userName
                          .split(' ')
                          .map((s) => s.isNotEmpty ? s[0] : '')
                          .take(2)
                          .join('')
                          .toUpperCase()
                      : 'P';

                  return Container(
                    margin: EdgeInsets.only(bottom: 10.h),
                    padding: EdgeInsets.all(12.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 14.r,
                              backgroundColor:
                                  _primaryGreen.withValues(alpha: 0.15),
                              child: Text(
                                initials,
                                style: TextStyle(
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.bold,
                                  color: _primaryGreen,
                                ),
                              ),
                            ),
                            SizedBox(width: 8.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    rev.userName,
                                    style: TextStyle(
                                      fontSize: 12.sp,
                                      fontWeight: FontWeight.w600,
                                      color: const Color(0xFF1C1C1E),
                                    ),
                                  ),
                                  _buildStarRow(
                                    rev.rating.toDouble(),
                                    size: 11.sp,
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              _formatDate(rev.createdAt),
                              style: TextStyle(
                                fontSize: 10.sp,
                                color: Colors.grey[500],
                              ),
                            ),
                          ],
                        ),
                        if (rev.comment?.isNotEmpty == true) ...[
                          SizedBox(height: 6.h),
                          Text(
                            rev.comment!,
                            style: TextStyle(
                              fontSize: 11.sp,
                              color: Colors.grey[800],
                              height: 1.3,
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                }),
                if (otherReviews.length > 3)
                  GestureDetector(
                    onTap: () => setState(() => _showAll = !_showAll),
                    child: Padding(
                      padding: EdgeInsets.symmetric(vertical: 4.h),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _showAll
                                ? 'Show less'
                                : 'View all ${otherReviews.length} reviews',
                            style: TextStyle(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.w600,
                              color: _primaryGreen,
                            ),
                          ),
                          Icon(
                            _showAll
                                ? Icons.keyboard_arrow_up
                                : Icons.keyboard_arrow_down,
                            size: 16.sp,
                            color: _primaryGreen,
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}
