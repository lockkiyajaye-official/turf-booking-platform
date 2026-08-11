import 'package:mobile/data/models/user_model.dart';

class TurfModel {
  final String id;
  final String name;
  final String? description;
  final String address;
  final String? city;
  final String? state;
  final String? pincode;
  final int? capacity;
  final String? surfaceType;
  final String? rules;
  final String? contactPhone;
  final String? contactEmail;
  final double? latitude;
  final double? longitude;
  final String? googleMapUrl;
  final String? mapUrl;
  final double pricePerHour;
  final List<String> amenities;
  final List<String> sports;
  final List<String> images;
  final List<String> availableSlots;
  final bool isActive;
  final bool isPublished;
  final double? rating;
  final int totalReviews;
  final UserModel? owner;
  final String ownerId;
  final bool cancellationPolicyEnabled;
  final int fullRefundHours;
  final int partialRefundHours;
  final double partialRefundPercentage;

  TurfModel({
    required this.id,
    required this.name,
    this.description,
    required this.address,
    this.city,
    this.state,
    this.pincode,
    this.capacity,
    this.surfaceType,
    this.rules,
    this.contactPhone,
    this.contactEmail,
    this.latitude,
    this.longitude,
    this.googleMapUrl,
    this.mapUrl,
    required this.pricePerHour,
    required this.amenities,
    required this.sports,
    required this.images,
    required this.availableSlots,
    required this.isActive,
    required this.isPublished,
    this.rating,
    required this.totalReviews,
    this.owner,
    required this.ownerId,
    this.cancellationPolicyEnabled = true,
    this.fullRefundHours = 24,
    this.partialRefundHours = 6,
    this.partialRefundPercentage = 50.0,
  });

  factory TurfModel.fromJson(Map<String, dynamic> json) {
    return TurfModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      address: json['address'] ?? '',
      city: json['city'],
      state: json['state'],
      pincode: json['pincode'],
      capacity: json['capacity'] != null
          ? int.tryParse(json['capacity'].toString())
          : null,
      surfaceType: json['surfaceType'],
      rules: json['rules'],
      contactPhone: json['contactPhone'],
      contactEmail: json['contactEmail'],
      latitude: json['latitude'] != null
          ? double.tryParse(json['latitude'].toString())
          : null,
      longitude: json['longitude'] != null
          ? double.tryParse(json['longitude'].toString())
          : null,
      googleMapUrl: json['googleMapUrl'] ?? json['mapUrl'],
      mapUrl: json['mapUrl'] ?? json['googleMapUrl'],
      pricePerHour: json['pricePerHour'] != null
          ? double.tryParse(json['pricePerHour'].toString()) ?? 0.0
          : 0.0,
      amenities: json['amenities'] != null
          ? List<String>.from(json['amenities'])
          : [],
      sports: json['sports'] != null
          ? List<String>.from(json['sports'])
          : [],
      images: json['images'] != null
          ? List<String>.from(json['images'])
          : [],
      availableSlots: json['availableSlots'] != null
          ? List<String>.from(json['availableSlots'])
          : [],
      isActive: json['isActive'] ?? true,
      isPublished: json['isPublished'] ?? false,
      rating: json['rating'] != null
          ? double.tryParse(json['rating'].toString())
          : null,
      totalReviews: json['totalReviews'] ?? 0,
      owner: json['owner'] != null
          ? UserModel.fromJson(json['owner'])
          : null,
      ownerId: json['ownerId'] ?? '',
      cancellationPolicyEnabled: json['cancellationPolicyEnabled'] ?? true,
      fullRefundHours: json['fullRefundHours'] != null
          ? int.tryParse(json['fullRefundHours'].toString()) ?? 24
          : 24,
      partialRefundHours: json['partialRefundHours'] != null
          ? int.tryParse(json['partialRefundHours'].toString()) ?? 6
          : 6,
      partialRefundPercentage: json['partialRefundPercentage'] != null
          ? double.tryParse(json['partialRefundPercentage'].toString()) ?? 50.0
          : 50.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'address': address,
      'city': city,
      'state': state,
      'pincode': pincode,
      'capacity': capacity,
      'surfaceType': surfaceType,
      'rules': rules,
      'contactPhone': contactPhone,
      'contactEmail': contactEmail,
      'latitude': latitude,
      'longitude': longitude,
      'googleMapUrl': googleMapUrl,
      'mapUrl': mapUrl,
      'pricePerHour': pricePerHour,
      'amenities': amenities,
      'sports': sports,
      'images': images,
      'availableSlots': availableSlots,
      'isActive': isActive,
      'isPublished': isPublished,
      'rating': rating,
      'totalReviews': totalReviews,
      'owner': owner?.toJson(),
      'ownerId': ownerId,
      'cancellationPolicyEnabled': cancellationPolicyEnabled,
      'fullRefundHours': fullRefundHours,
      'partialRefundHours': partialRefundHours,
      'partialRefundPercentage': partialRefundPercentage,
    };
  }
}