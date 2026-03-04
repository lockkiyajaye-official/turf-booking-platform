import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/views/home/widgets/booking_details.dart';

class VenueCard extends StatelessWidget {
  final String name;
  final String location;
  final int pricePerHour;
  final double rating;
  final int reviewCount;
  final String imageUrl;
  final VoidCallback? onBookNow;

  const VenueCard({
    super.key,
    required this.name,
    required this.location,
    required this.pricePerHour,
    required this.rating,
    required this.reviewCount,
    required this.imageUrl,
    this.onBookNow,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Get.to(() => const TurfDetailsPage());
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Image with rating badge ──────────────────────────
              SizedBox(
                width: 140,
                height: 140,
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        imageUrl,
                        width: 140,
                        height: 140,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            color: Colors.grey[300],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(
                            Icons.sports_soccer,
                            size: 48,
                            color: Colors.grey,
                          ),
                        ),
                      ),
                    ),
                    // Rating badge
                    Positioned(
                      bottom: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.12),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star,
                              color: Color(0xFFFFC107),
                              size: 16,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '$rating ($reviewCount)',
                              style: const TextStyle(
                                fontSize: 12,
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
              ),

              const SizedBox(width: 14),

              // ── Info section ─────────────────────────────────────
              Expanded(
                child: SizedBox(
                  height: 140,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Name
                      Text(
                        name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1C1C1E),
                          letterSpacing: -0.3,
                        ),
                      ),

                      // Location
                      Text(
                        location,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF8E8E93),
                          height: 1.4,
                        ),
                      ),

                      // Price
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: '₹$pricePerHour',
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1C1C1E),
                              ),
                            ),
                            const TextSpan(
                              text: ' /hour',
                              style: TextStyle(
                                fontSize: 13,
                                color: Color(0xFF8E8E93),
                                fontWeight: FontWeight.normal,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Book Now button
                      SizedBox(
                        width: double.infinity,
                        height: 38,
                        child: OutlinedButton(
                          onPressed: onBookNow,
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(
                              color: Color(0xFFE53935),
                              width: 1.5,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: EdgeInsets.zero,
                          ),
                          child: const Text(
                            'Book now',
                            style: TextStyle(
                              color: Color(0xFFE53935),
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
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
      ),
    );
  }
}
