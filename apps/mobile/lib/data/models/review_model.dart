class ReviewModel {
  final String id;
  final int rating;
  final String? comment;
  final String? bookingId;
  final DateTime createdAt;
  final String userId;
  final String userName;
  final String? userAvatar;

  ReviewModel({
    required this.id,
    required this.rating,
    this.comment,
    this.bookingId,
    required this.createdAt,
    required this.userId,
    required this.userName,
    this.userAvatar,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id']?.toString() ?? '',
      rating: json['rating'] is int
          ? json['rating']
          : int.tryParse(json['rating']?.toString() ?? '5') ?? 5,
      comment: json['comment']?.toString(),
      bookingId: json['bookingId']?.toString(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      userId: json['userId']?.toString() ?? '',
      userName: (json['userName']?.toString().trim().isNotEmpty == true)
          ? json['userName'].toString().trim()
          : 'Player',
      userAvatar: json['userAvatar']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'rating': rating,
      'comment': comment,
      'bookingId': bookingId,
      'createdAt': createdAt.toIso8601String(),
      'userId': userId,
      'userName': userName,
      'userAvatar': userAvatar,
    };
  }
}

class ReviewSummaryModel {
  final double averageRating;
  final int totalReviews;
  final Map<int, int> distribution;

  ReviewSummaryModel({
    required this.averageRating,
    required this.totalReviews,
    required this.distribution,
  });

  factory ReviewSummaryModel.fromJson(Map<String, dynamic> json) {
    final distMap = <int, int>{5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    if (json['distribution'] is Map) {
      final raw = json['distribution'] as Map;
      raw.forEach((k, v) {
        final star = int.tryParse(k.toString());
        final count = int.tryParse(v.toString()) ?? 0;
        if (star != null && star >= 1 && star <= 5) {
          distMap[star] = count;
        }
      });
    }

    return ReviewSummaryModel(
      averageRating: json['averageRating'] != null
          ? double.tryParse(json['averageRating'].toString()) ?? 0.0
          : 0.0,
      totalReviews: json['totalReviews'] != null
          ? int.tryParse(json['totalReviews'].toString()) ?? 0
          : 0,
      distribution: distMap,
    );
  }
}

class TurfReviewsData {
  final List<ReviewModel> reviews;
  final ReviewSummaryModel summary;
  final int total;
  final int page;
  final int limit;

  TurfReviewsData({
    required this.reviews,
    required this.summary,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory TurfReviewsData.fromJson(Map<String, dynamic> json) {
    final list = (json['reviews'] as List? ?? [])
        .map((e) => ReviewModel.fromJson(e as Map<String, dynamic>))
        .toList();

    return TurfReviewsData(
      reviews: list,
      summary: ReviewSummaryModel.fromJson(
        json['summary'] is Map<String, dynamic>
            ? json['summary']
            : <String, dynamic>{},
      ),
      total: json['total'] is int
          ? json['total']
          : int.tryParse(json['total']?.toString() ?? '0') ?? 0,
      page: json['page'] is int
          ? json['page']
          : int.tryParse(json['page']?.toString() ?? '1') ?? 1,
      limit: json['limit'] is int
          ? json['limit']
          : int.tryParse(json['limit']?.toString() ?? '20') ?? 20,
    );
  }
}
