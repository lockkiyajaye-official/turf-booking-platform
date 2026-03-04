import 'package:flutter/material.dart';
import 'package:mobile/data/models/amentity_item.dart';

class AmenityChip extends StatelessWidget {
  final AmenityItem item;
  const AmenityChip({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Icon(item.icon, size: 22, color: const Color(0xFF3A3A3C)),
        ),
        const SizedBox(height: 6),
        Text(
          item.label,
          style: const TextStyle(fontSize: 10, color: Color(0xFF3A3A3C)),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}