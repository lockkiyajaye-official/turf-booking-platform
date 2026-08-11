import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/favorite/favorite_viewmodel.dart';
import 'package:mobile/views/booking/booking_details_page.dart';
import 'package:mobile/views/home/widgets/booking_card.dart';

class FavoriteVenuesPage extends StatefulWidget {
  const FavoriteVenuesPage({super.key});

  @override
  State<FavoriteVenuesPage> createState() => _FavoriteVenuesPageState();
}

class _FavoriteVenuesPageState extends State<FavoriteVenuesPage> {
  final FavoriteViewmodel _favoriteVm = Get.find<FavoriteViewmodel>();

  @override
  void initState() {
    super.initState();
    _favoriteVm.fetchFavorites();
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colors.background,
      appBar: AppBar(
        backgroundColor: colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new,
            color: colors.textTitle,
            size: 20,
          ),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Favorite Venues',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: Obx(() {
        if (_favoriteVm.isLoading.value && _favoriteVm.favoriteTurfs.isEmpty) {
          return Center(
            child: CircularProgressIndicator(color: colors.primary),
          );
        }

        if (_favoriteVm.favoriteTurfs.isEmpty) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.favorite_border_rounded,
                  size: 64,
                  color: colors.textGrey,
                ),
                SizedBox(height: 12.h),
                Text(
                  'No favorite venues saved yet',
                  style: textTheme.titleSmall?.copyWith(color: colors.textGrey),
                ),
                SizedBox(height: 4.h),
                Text(
                  'Tap the heart icon on any turf to save it here',
                  style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () => _favoriteVm.fetchFavorites(),
          color: colors.primary,
          child: ListView.builder(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
            itemCount: _favoriteVm.favoriteTurfs.length,
            itemBuilder: (context, index) {
              final turf = _favoriteVm.favoriteTurfs[index];
              return Padding(
                padding: EdgeInsets.only(bottom: 12.h),
                child: VenueCard(
                  turf: turf,
                  onBookNow: () => Get.to(() => TurfDetailsPage(turf: turf)),
                ),
              );
            },
          ),
        );
      }),
    );
  }
}
