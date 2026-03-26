import 'package:get/get.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/viewmodels/turf/turf_viewmodel.dart';
import 'package:mobile/viewmodels/booking/booking_viewmodel.dart';
import 'package:mobile/viewmodels/payment/payment_viewmodel.dart';
import 'package:mobile/viewmodels/dashboard/dashboard_viewmodel.dart';

class AuthBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AuthViewmodel>(AuthViewmodel(), permanent: true);
    Get.put<TurfViewmodel>(TurfViewmodel(), permanent: true);
    Get.put<BookingViewmodel>(BookingViewmodel(), permanent: true);
    Get.put<PaymentViewmodel>(PaymentViewmodel(), permanent: true);
    Get.put<DashboardViewmodel>(DashboardViewmodel(), permanent: true);
  }
}