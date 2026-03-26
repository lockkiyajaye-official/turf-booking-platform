import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'booking_details.dart';

class VenueCard extends StatelessWidget {
  final TurfModel turf;
  final VoidCallback? onBookNow;

  const VenueCard({
    super.key,
    required this.turf,
    this.onBookNow,
  });

  @override
  Widget build(BuildContext context) {
    final imageUrl = turf.images.isNotEmpty
        ? turf.images.first
        : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80';
    
    return GestureDetector(
      onTap: () => Get.to(() => TurfDetailsPage(turf: turf)),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 12,
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
                width: 142,
                height: 142,
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        imageUrl,
                        width: 142,
                        height: 142,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          width: 142,
                          height: 142,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Icon(
                            Icons.sports_soccer,
                            size: 40,
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
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star,
                              color: Color(0xFFFF9500),
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              '${turf.rating ?? 0.0} (${turf.totalReviews})',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
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

              const SizedBox(width: 16),

              // ── Info section ─────────────────────────────────────
              Expanded(
                child: SizedBox(
                  height: 142,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name
                      Text(
                        turf.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2C3E50),
                          letterSpacing: -0.5,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),

                      // Location
                      Text(
                        turf.address,
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF7F8C8D),
                          fontWeight: FontWeight.w500,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),

                      const Spacer(),

                      // Price
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: '₹${turf.pricePerHour.toInt()}',
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF2C3E50),
                              ),
                            ),
                            const TextSpan(
                              text: ' /hour',
                              style: TextStyle(
                                fontSize: 13,
                                color: Color(0xFF7F8C8D),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Book Now button
                      SizedBox(
                        width: double.infinity,
                        height: 38,
                        child: OutlinedButton(
                          onPressed: () {
                            if (onBookNow != null) {
                              onBookNow!();
                            } else {
                              Get.to(() => TurfDetailsPage(turf: turf));
                            }
                          },
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(
                              color: Color(0xFFE74C3C),
                              width: 1.2,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            padding: EdgeInsets.zero,
                          ),
                          child: const Text(
                            'Book now',
                            style: TextStyle(
                              color: Color(0xFFE74C3C),
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
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
