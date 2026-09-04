import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/data/models/review_model.dart';
import 'package:mobile/data/services/review_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

class RateTurfBottomSheet extends StatefulWidget {
  final String turfId;
  final String turfName;
  final String? bookingId;
  final ReviewModel? initialReview;
  final Function(int rating, String? comment, ReviewSummaryModel? updatedSummary)?
      onReviewSubmitted;
  final Function(ReviewSummaryModel? updatedSummary)? onReviewDeleted;

  const RateTurfBottomSheet({
    super.key,
    required this.turfId,
    required this.turfName,
    this.bookingId,
    this.initialReview,
    this.onReviewSubmitted,
    this.onReviewDeleted,
  });

  static Future<void> show({
    required BuildContext context,
    required String turfId,
    required String turfName,
    String? bookingId,
    ReviewModel? initialReview,
    Function(int rating, String? comment, ReviewSummaryModel? updatedSummary)?
        onReviewSubmitted,
    Function(ReviewSummaryModel? updatedSummary)? onReviewDeleted,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => RateTurfBottomSheet(
        turfId: turfId,
        turfName: turfName,
        bookingId: bookingId,
        initialReview: initialReview,
        onReviewSubmitted: onReviewSubmitted,
        onReviewDeleted: onReviewDeleted,
      ),
    );
  }

  @override
  State<RateTurfBottomSheet> createState() => _RateTurfBottomSheetState();
}

class _RateTurfBottomSheetState extends State<RateTurfBottomSheet> {
  static const Color _primaryGreen = Color(0xFF0DAA6C);
  static const Color _goldColor = Color(0xFFFFB800);

  final ReviewService _reviewService = ReviewService();
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();
  final TextEditingController _commentController = TextEditingController();

  int _selectedRating = 5;
  bool _isSubmitting = false;
  bool _isDeleting = false;
  bool _isEdit = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialReview != null) {
      _isEdit = true;
      _selectedRating = widget.initialReview!.rating;
      _commentController.text = widget.initialReview!.comment ?? '';
    } else {
      _checkExistingReview();
    }
  }

  Future<void> _checkExistingReview() async {
    final token = _authVm.token.value;
    if (token.isEmpty) return;

    final res = await _reviewService.getMyReview(token, widget.turfId);
    if (mounted && res['success'] == true && res['data'] is ReviewModel) {
      final rev = res['data'] as ReviewModel;
      setState(() {
        _isEdit = true;
        _selectedRating = rev.rating;
        _commentController.text = rev.comment ?? '';
      });
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  String _getRatingLabel(int rating) {
    switch (rating) {
      case 1:
        return 'Poor 😞';
      case 2:
        return 'Fair 😐';
      case 3:
        return 'Good 🙂';
      case 4:
        return 'Very Good 😊';
      case 5:
        return 'Excellent! 🌟';
      default:
        return 'Tap a star to rate';
    }
  }

  Future<void> _handleSubmit() async {
    final token = _authVm.token.value;
    if (token.isEmpty) {
      Get.snackbar(
        'Login Required',
        'Please sign in to rate this turf',
        backgroundColor: Colors.black87,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final res = await _reviewService.submitReview(
      token: token,
      turfId: widget.turfId,
      rating: _selectedRating,
      comment: _commentController.text,
      bookingId: widget.bookingId,
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (res['success'] == true) {
      ReviewSummaryModel? summary;
      if (res['summary'] is Map<String, dynamic>) {
        summary = ReviewSummaryModel.fromJson(res['summary']);
      }

      widget.onReviewSubmitted?.call(
        _selectedRating,
        _commentController.text.trim().isEmpty
            ? null
            : _commentController.text.trim(),
        summary,
      );

      Navigator.of(context).pop();

      Get.snackbar(
        'Thank You!',
        _isEdit ? 'Your review has been updated' : 'Your review has been submitted',
        backgroundColor: _primaryGreen,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2),
      );
    } else {
      Get.snackbar(
        'Error',
        res['message'] ?? 'Failed to submit review',
        backgroundColor: Colors.red.shade400,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> _handleDelete() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Review'),
        content: const Text('Are you sure you want to delete your review?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final token = _authVm.token.value;
    if (token.isEmpty) return;

    setState(() => _isDeleting = true);

    final res = await _reviewService.deleteReview(
      token: token,
      turfId: widget.turfId,
    );

    if (!mounted) return;
    setState(() => _isDeleting = false);

    if (res['success'] == true) {
      ReviewSummaryModel? summary;
      if (res['summary'] is Map<String, dynamic>) {
        summary = ReviewSummaryModel.fromJson(res['summary']);
      }

      widget.onReviewDeleted?.call(summary);
      Navigator.of(context).pop();

      Get.snackbar(
        'Review Removed',
        'Your review has been deleted',
        backgroundColor: Colors.black87,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    } else {
      Get.snackbar(
        'Error',
        res['message'] ?? 'Failed to delete review',
        backgroundColor: Colors.red.shade400,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final textTheme = Theme.of(context).textTheme;

    return Container(
      padding: EdgeInsets.only(bottom: bottomInset),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Drag handle
              Container(
                width: 40.w,
                height: 4.h,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              SizedBox(height: 16.h),

              // Title & Close
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isEdit ? 'Edit Your Review' : 'Rate this Turf',
                          style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            fontSize: 18.sp,
                            color: const Color(0xFF1C1C1E),
                          ),
                        ),
                        SizedBox(height: 2.h),
                        Text(
                          widget.turfName,
                          style: textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                            fontSize: 12.sp,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: Icon(Icons.close, color: Colors.grey[600], size: 22),
                  ),
                ],
              ),
              SizedBox(height: 20.h),

              // Interactive Stars
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starNum = index + 1;
                  final isSelected = starNum <= _selectedRating;

                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedRating = starNum);
                    },
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6.w),
                      child: AnimatedScale(
                        scale: isSelected ? 1.15 : 1.0,
                        duration: const Duration(milliseconds: 150),
                        child: Icon(
                          isSelected
                              ? Icons.star_rounded
                              : Icons.star_outline_rounded,
                          color: isSelected ? _goldColor : Colors.grey[350],
                          size: 38.sp,
                        ),
                      ),
                    ),
                  );
                }),
              ),
              SizedBox(height: 8.h),

              // Sentiment label
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Text(
                  _getRatingLabel(_selectedRating),
                  key: ValueKey<int>(_selectedRating),
                  style: textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF454555),
                    fontSize: 14.sp,
                  ),
                ),
              ),
              SizedBox(height: 20.h),

              // Comment TextField
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF9F9FB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE5E5EA)),
                ),
                padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 10.h),
                child: TextField(
                  controller: _commentController,
                  maxLines: 4,
                  maxLength: 1000,
                  style: textTheme.bodyMedium?.copyWith(fontSize: 13.sp),
                  decoration: InputDecoration(
                    hintText:
                        'Write a review... How was the pitch, turf quality, lighting, or facilities?',
                    hintStyle: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 12.sp,
                    ),
                    border: InputBorder.none,
                    isDense: true,
                    counterStyle: TextStyle(
                      fontSize: 10.sp,
                      color: Colors.grey[400],
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20.h),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48.h,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: _isSubmitting
                      ? SizedBox(
                          width: 20.w,
                          height: 20.w,
                          child: const CircularProgressIndicator(
                            strokeWidth: 2.2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          _isEdit ? 'Update Review' : 'Submit Review',
                          style: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),

              // Delete button if editing
              if (_isEdit) ...[
                SizedBox(height: 10.h),
                TextButton(
                  onPressed: _isDeleting ? null : _handleDelete,
                  child: _isDeleting
                      ? SizedBox(
                          width: 16.w,
                          height: 16.w,
                          child: const CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.red,
                          ),
                        )
                      : Text(
                          'Delete My Review',
                          style: TextStyle(
                            color: Colors.red[600],
                            fontSize: 12.sp,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
