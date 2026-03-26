import 'package:flutter/material.dart';
import 'package:mobile/data/models/amentity_item.dart';

class AmenityChip extends StatelessWidget {
  final AmenityItem item;
  const AmenityChip({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 74,
      height: 64,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!, width: 1.2),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(item.icon, size: 20, color: Colors.grey[500]),
          const SizedBox(height: 6),
          Text(
            item.label,
            style: const TextStyle(
              fontSize: 10,
              color: Color(0xFF8E8E93),
              fontWeight: FontWeight.w500,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}