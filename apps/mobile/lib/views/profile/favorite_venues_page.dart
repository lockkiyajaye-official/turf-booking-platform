import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/routes/app_paths.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
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
        automaticallyImplyLeading: false,
        leading: Navigator.canPop(context)
            ? IconButton(
                icon: Icon(
                  Icons.arrow_back_ios_new,
                  color: colors.textTitle,
                  size: 20,
                ),
                onPressed: () => Get.back(),
              )
            : null,
        title: Text(
          'Favorite Venues',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: Obx(() {
        final authVm = Get.find<AuthViewmodel>();
        if (authVm.isGuest) {
          return Center(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 32.w),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 72.w,
                    height: 72.w,
                    decoration: BoxDecoration(
                      color: colors.primary.withOpacity(0.08),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.favorite_border_rounded,
                      size: 36.sp,
                      color: colors.primary,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  Text(
                    'Save Your Favorite Venues',
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: colors.textTitle,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 8.h),
                  Text(
                    'Sign in to quickly access and book the sports grounds you love.',
                    style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 20.h),
                  ElevatedButton(
                    onPressed: () => Get.toNamed(RoutePaths.login),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      padding: EdgeInsets.symmetric(
                        horizontal: 24.w,
                        vertical: 12.h,
                      ),
                    ),
                    child: const Text('Sign In / Register'),
                  ),
                ],
              ),
            ),
          );
        }

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

        final isTablet = context.isTablet;
        final columns = context.turfGridColumns;
        final horizontalPad = isTablet ? 20.w : 16.w;

        return RefreshIndicator(
          onRefresh: () => _favoriteVm.fetchFavorites(),
          color: colors.primary,
          child: columns > 1
              ? GridView.builder(
                  padding: EdgeInsets.symmetric(
                    horizontal: horizontalPad,
                    vertical: 12.h,
                  ),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: columns,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    mainAxisExtent: 168,
                  ),
                  itemCount: _favoriteVm.favoriteTurfs.length,
                  itemBuilder: (context, index) {
                    final turf = _favoriteVm.favoriteTurfs[index];
                    return VenueCard(
                      turf: turf,
                      margin: EdgeInsets.zero,
                      onBookNow: () => Get.to(() => TurfDetailsPage(turf: turf)),
                    );
                  },
                )
              : ListView.builder(
                  padding: EdgeInsets.symmetric(
                    horizontal: 16.w,
                    vertical: 12.h,
                  ),
                  itemCount: _favoriteVm.favoriteTurfs.length,
                  itemBuilder: (context, index) {
                    final turf = _favoriteVm.favoriteTurfs[index];
                    return Padding(
                      padding: EdgeInsets.only(bottom: 12.h),
                      child: VenueCard(
                        turf: turf,
                        onBookNow: () =>
                            Get.to(() => TurfDetailsPage(turf: turf)),
                      ),
                    );
                  },
                ),
        );
      }),
    );
  }
}
