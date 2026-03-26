import 'package:mobile/data/models/user_model.dart';

class TurfModel {
  final String id;
  final String name;
  final String description;
  final String address;
  final double pricePerHour;
  final List<String> amenities;
  final List<String> images;
  final List<String> availableSlots;
  final bool isActive;
  final bool isPublished;
  final double? rating;
  final int totalReviews;
  final UserModel? owner;
  final String ownerId;

  TurfModel({
    required this.id,
    required this.name,
    required this.description,
    required this.address,
    required this.pricePerHour,
    required this.amenities,
    required this.images,
    required this.availableSlots,
    required this.isActive,
    required this.isPublished,
    this.rating,
    required this.totalReviews,
    this.owner,
    required this.ownerId,
  });

  factory TurfModel.fromJson(Map<String, dynamic> json) {
    return TurfModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      address: json['address'] ?? '',
      pricePerHour: json['pricePerHour'] != null 
          ? double.tryParse(json['pricePerHour'].toString()) ?? 0.0 
          : 0.0,
      amenities: json['amenities'] != null ? List<String>.from(json['amenities']) : [],
      images: json['images'] != null ? List<String>.from(json['images']) : [],
      availableSlots: json['availableSlots'] != null ? List<String>.from(json['availableSlots']) : [],
      isActive: json['isActive'] ?? true,
      isPublished: json['isPublished'] ?? false,
      rating: json['rating'] != null ? double.tryParse(json['rating'].toString()) : 0.0,
      totalReviews: json['totalReviews'] ?? 0,
      owner: json['owner'] != null ? UserModel.fromJson(json['owner']) : null,
      ownerId: json['ownerId'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'address': address,
      'pricePerHour': pricePerHour,
      'amenities': amenities,
      'images': images,
      'availableSlots': availableSlots,
      'isActive': isActive,
      'isPublished': isPublished,
      'rating': rating,
      'totalReviews': totalReviews,
      'owner': owner?.toJson(),
      'ownerId': ownerId,
    };
  }
}