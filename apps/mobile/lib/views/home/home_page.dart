import 'package:flutter/material.dart';
import 'package:mobile/core/constants/app_assets.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/views/home/widgets/booking_card.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;

    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 80.h),

          // Location row + Bell icon
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              children: [
                Expanded(
                  child: Material(
                    elevation: 2,
                    borderRadius: BorderRadius.circular(8),
                    child: MyTextField(
                      height: 46.h,
                      type: TextInputType.text,
                      showSearchIcon: false,
                      prefixIcon: Icon(
                        Icons.location_on,
                        color: colors.primary,
                      ),
                      fillColor: colors.white,
                      hintText: "HSR Layout, Bangalore",
                    ),
                  ),
                ),
                SizedBox(width: 13.w),
                Container(
                  height: 46.h,
                  width: 46.w,
                  decoration: BoxDecoration(
                    color: colors.white,
                    border: Border.all(
                      width: 1,
                      color: const Color(0xFFE8E8E8),
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.notifications, color: colors.primary),
                ),
              ],
            ),
          ),

          SizedBox(height: 12.h),

          // Search bar
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Material(
              elevation: 2,
              borderRadius: BorderRadius.circular(8),
              child: Padding(
              padding: EdgeInsets.fromLTRB(16.w, 16.h, 16.w, 8.h),
              child: Material(
                elevation: 2,
                shadowColor: Colors.black12,
                borderRadius: BorderRadius.circular(10),
                child: TextField(
                  autofocus: false,
                 
                  decoration: InputDecoration(
                    hintText: 'Search turf by location, name or sport',
                    hintStyle: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 14.sp,
                    ),
                    prefixIcon: Icon(Icons.search,
                        color: Colors.grey[500], size: 20),
                    suffixIcon: 
                         IconButton(
                            icon: const Icon(Icons.close, size: 18),
                            color: Colors.grey[500],
                            onPressed: () {
                             
                            },
                          )
                        ,
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
            ),
          ),

          SizedBox(height: 20.h),

          // Filter chips
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                FilterChip(label: Text("All"), onSelected: (bool value) {}),
                SizedBox(width: 10.w),
                FilterChip(
                  label: Text("Football"),
                  onSelected: (bool value) {},
                ),
                SizedBox(width: 10.w),
                FilterChip(label: Text("Cricket"), onSelected: (bool value) {}),
              ],
            ),
          ),

          SizedBox(height: 10.h),

          // Banner image
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12.r),
              child: Image.asset(
                AppAssets.football,
                height: 174.h,
                width: 361.w,
                fit: BoxFit.fill,
              ),
            ),
          ),

          SizedBox(height: 10.h),

          //  Expanded wraps the ListView so it takes remaining space
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(horizontal: 16.w),
              itemCount: 5,
              itemBuilder: (context, index) {
                return Padding(
                  padding: EdgeInsets.only(bottom: 12.h),
                  child: VenueCard(
                    name: 'Grandfield arena',
                    location: 'HSR Layout, Koramangala,\n2km away',
                    pricePerHour: 800,
                    rating: 4.8,
                    reviewCount: 150,
                    imageUrl:
                        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&q=80',
                    onBookNow: () {
                      debugPrint('Book Now tapped');
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
