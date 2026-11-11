import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/storage/local_storage.dart';
import 'package:mobile/data/services/auth_service.dart';
import 'package:mobile/data/services/booking_service.dart';
import 'package:mobile/data/services/payment_service.dart';
import 'package:mobile/data/services/turf_service.dart';
import 'package:mobile/data/models/turf_model.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

class OwnerViewmodel extends GetxController {
  final TurfService _turfService = TurfService();
  final BookingService _bookingService = BookingService();
  final PaymentService _paymentService = PaymentService();
  final AuthService _authService = AuthService();

  var isLoading = false.obs;
  var isBookingsLoading = false.obs;
  var isFetchingMore = false.obs;
  var isTurfsLoading = false.obs;
  var isFinancesLoading = false.obs;
  var isSavingPayoutDetails = false.obs;

  var myTurfs = <TurfModel>[].obs;
  var allBookings = <Map<String, dynamic>>[].obs;
  var recentBookings = <Map<String, dynamic>>[].obs;
  var stats = <String, dynamic>{}.obs;

  // Pagination
  var bookingsPage = 1.obs;
  var bookingsHasMore = true.obs;
  // Filters (reactive — UI binds to these)
  var bookingsStatusFilter = ''.obs;  // '' means all
  var bookingsSearch = ''.obs;

  // Finances & Payout Details
  var walletBalance = 0.0.obs;
  var totalEarnings = 0.0.obs;
  var totalPayouts = 0.0.obs;
  var payoutHistory = <Map<String, dynamic>>[].obs;
  var payoutDetails = <String, dynamic>{}.obs;

  bool get hasPayoutDetails {
    final accNum = (payoutDetails['bankAccountNumber'] ?? '').toString().trim();
    final ifsc = (payoutDetails['ifscCode'] ?? '').toString().trim();
    final upi = (payoutDetails['upiId'] ?? '').toString().trim();
    return (accNum.isNotEmpty && ifsc.isNotEmpty) || upi.isNotEmpty;
  }

  @override
  void onInit() {
    super.onInit();
    _loadInitialPayoutDetails();
  }

  void _loadInitialPayoutDetails() {
    try {
      final local = Get.find<LocalStorageService>().getPayoutDetails();
      if (local.isNotEmpty) {
        payoutDetails.value = Map<String, dynamic>.from(local);
      }
      if (Get.isRegistered<AuthViewmodel>()) {
        final user = Get.find<AuthViewmodel>().currentUser;
        _mergePayoutDetailsFromMap(user);
      }
    } catch (_) {}
  }

  void _mergePayoutDetailsFromMap(Map<dynamic, dynamic> map) {
    final holder = (map['accountHolderName'] ?? '').toString().trim();
    final bank = (map['bankName'] ?? '').toString().trim();
    final accNum = (map['bankAccountNumber'] ?? '').toString().trim();
    final ifsc = (map['ifscCode'] ?? '').toString().trim();
    final upi = (map['upiId'] ?? '').toString().trim();

    if (holder.isNotEmpty ||
        bank.isNotEmpty ||
        accNum.isNotEmpty ||
        ifsc.isNotEmpty ||
        upi.isNotEmpty) {
      final updated = {
        'accountHolderName': holder,
        'bankName': bank,
        'bankAccountNumber': accNum,
        'ifscCode': ifsc,
        'upiId': upi,
      };
      payoutDetails.value = updated;
      Get.find<LocalStorageService>().savePayoutDetails(updated);
    }
  }

  String get _token => Get.find<LocalStorageService>().getToken() ?? '';

  void _showError(String msg) => Get.snackbar(
        'Error', msg,
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );

  void _showSuccess(String msg) => Get.snackbar(
        'Success', msg,
        backgroundColor: Colors.green.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );

  // ── Dashboard ────────────────────────────────────────────
  Future<void> loadDashboard() async {
    try {
      isLoading.value = true;
      await Future.wait([fetchMyTurfs(), fetchAllBookings()]);
      _computeStats();
    } finally {
      isLoading.value = false;
    }
  }

  static num _parseNum(dynamic value) {
    if (value is num) return value;
    if (value is String) return num.tryParse(value) ?? 0;
    return 0;
  }

  void _computeStats() {
    final totalRevenue = allBookings
        .where((b) => (b['status'] as String? ?? '').toLowerCase() == 'confirmed')
        .fold<num>(0, (sum, b) {
      final rawVal = b['totalPrice'] ?? b['totalAmount'] ?? b['price'];
      return sum + _parseNum(rawVal);
    });

    stats.value = {
      'totalTurfs': myTurfs.length,
      'totalBookings': allBookings.length,
      'totalRevenue': totalRevenue,
    };

    recentBookings.value = allBookings.take(10).toList();
  }

  // ── Turfs ────────────────────────────────────────────────
  Future<void> fetchMyTurfs() async {
    try {
      isTurfsLoading.value = true;
      final res = await _turfService.findMyTurfs(_token);
      if (res['success']) {
        final data = res['data'];
        List<dynamic> list = [];
        if (data is List) {
          list = data;
        } else if (data is Map && data['turfs'] is List) {
          list = data['turfs'];
        }
        myTurfs.value =
            list.map((e) => TurfModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {
    } finally {
      isTurfsLoading.value = false;
    }
  }

  Future<void> publishTurf(String id) async {
    try {
      final res = await _turfService.publishTurf(_token, id);
      if (res['success']) {
        _showSuccess('Turf published successfully');
        await fetchMyTurfs();
      } else {
        _showError(res['message'] ?? 'Failed to publish');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> unpublishTurf(String id) async {
    try {
      final res = await _turfService.unpublishTurf(_token, id);
      if (res['success']) {
        _showSuccess('Turf unpublished');
        await fetchMyTurfs();
      } else {
        _showError(res['message'] ?? 'Failed to unpublish');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<bool> deleteTurf(String id) async {
    try {
      final res = await _turfService.deleteTurf(_token, id);
      if (res['success']) {
        _showSuccess('Turf deleted successfully');
        await fetchMyTurfs();
        return true;
      } else {
        _showError(res['message'] ?? 'Failed to delete turf');
        return false;
      }
    } catch (e) {
      _showError(e.toString());
      return false;
    }
  }

  // ── Bookings ─────────────────────────────────────────────

  /// Reset filters/pagination and reload page 1.
  Future<void> fetchAllBookings({
    String? status,
    String? search,
  }) async {
    if (status != null) bookingsStatusFilter.value = status;
    if (search != null) bookingsSearch.value = search;
    bookingsPage.value = 1;
    bookingsHasMore.value = true;
    await _loadBookingsPage(1);
  }

  /// Fetch next page (called by the UI scroll listener).
  Future<void> loadNextPage() async {
    if (!bookingsHasMore.value || isFetchingMore.value) return;
    await _loadBookingsPage(bookingsPage.value + 1);
  }

  Future<void> _loadBookingsPage(int page) async {
    try {
      if (page == 1) {
        isBookingsLoading.value = true;
      } else {
        isFetchingMore.value = true;
      }

      final res = await _bookingService.findAll(
        _token,
        page: page,
        limit: 10,
        status: bookingsStatusFilter.value.isEmpty ? null : bookingsStatusFilter.value,
        search: bookingsSearch.value.isEmpty ? null : bookingsSearch.value,
      );

      if (res['success']) {
        final data = res['data'];
        List<dynamic> list = [];
        bool more = false;

        if (data is List) {
          list = data;
          more = false;
        } else if (data is Map) {
          list = (data['items'] ?? data['bookings'] ?? []) as List<dynamic>;
          more = data['hasMore'] == true;
        }

        final newItems = list.cast<Map<String, dynamic>>();
        if (page == 1) {
          allBookings.value = newItems;
        } else {
          final existing = Set<String>.from(
              allBookings.map((b) => b['_id']?.toString() ?? b['id']?.toString() ?? ''));
          final fresh = newItems.where(
              (b) => !existing.contains(b['_id']?.toString() ?? b['id']?.toString() ?? ''));
          allBookings.addAll(fresh);
        }
        bookingsPage.value = page;
        bookingsHasMore.value = more;
      }
    } catch (_) {
    } finally {
      isBookingsLoading.value = false;
      isFetchingMore.value = false;
    }
  }

  Future<void> confirmBooking(String id) async {
    try {
      final res = await _bookingService.updateStatus(
          token: _token, id: id, status: 'confirmed');
      if (res['success']) {
        _showSuccess('Booking confirmed');
        await fetchAllBookings();
        _computeStats();
      } else {
        _showError(res['message'] ?? 'Failed to confirm');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> cancelBooking(String id, {String? reason}) async {
    try {
      final res = await _bookingService.cancelBooking(_token, id, reason: reason);
      if (res['success'] == true) {
        final msg = res['data']?['cancellation']?['message'] ?? 'Booking cancelled and customer refunded.';
        _showSuccess(msg);
        await fetchAllBookings();
        _computeStats();
      } else {
        _showError(res['message'] ?? 'Failed to cancel');
      }
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<bool> createDirectBooking({
    required String turfId,
    required String bookingDate,
    required String startTime,
    required String endTime,
    required String customerName,
    String? customerPhone,
    double? customPrice,
    String paymentMethod = 'offline',
    String? notes,
  }) async {
    try {
      isLoading.value = true;
      final payload = <String, dynamic>{
        'turfId': turfId,
        'bookingDate': bookingDate,
        'startTime': startTime,
        'endTime': endTime,
        'customerName': customerName,
        'paymentMethod': paymentMethod,
      };
      if (customerPhone != null && customerPhone.isNotEmpty) {
        payload['customerPhone'] = customerPhone;
      }
      if (customPrice != null) {
        payload['customPrice'] = customPrice;
      }
      if (notes != null && notes.isNotEmpty) {
        payload['notes'] = notes;
      }

      final res = await _bookingService.createDirectBooking(
        token: _token,
        data: payload,
      );

      if (res['success'] == true) {
        _showSuccess('Direct booking created! Slot is locked.');
        await fetchAllBookings();
        return true;
      } else {
        _showError(res['message'] ?? 'Failed to create direct booking');
        return false;
      }
    } catch (e) {
      _showError(e.toString());
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<List<String>> fetchBookedSlots(String turfId, String date) async {
    try {
      final res = await _turfService.getBookedSlots(id: turfId, date: date);
      if (res['success'] == true && res['data'] is List) {
        return (res['data'] as List).map((s) => s.toString()).toList();
      }
    } catch (_) {}
    return [];
  }

  // ── Finances & Payouts ────────────────────────────────────
  Future<void> fetchFinancesSummary() async {
    try {
      isFinancesLoading.value = true;
      _loadInitialPayoutDetails();
      final res = await _paymentService.getOwnerSummary(_token);
      if (res['success']) {
        final data = res['data'] ?? {};
        walletBalance.value =
            double.tryParse((data['walletBalance'] ?? 0).toString()) ?? 0.0;
        totalEarnings.value =
            double.tryParse((data['totalEarnings'] ?? 0).toString()) ?? 0.0;
        totalPayouts.value =
            double.tryParse((data['totalPayouts'] ?? 0).toString()) ?? 0.0;

        if (data['payoutDetails'] is Map) {
          _mergePayoutDetailsFromMap(data['payoutDetails'] as Map);
        }

        final list = data['payouts'] ?? data['history'] ?? [];
        if (list is List) {
          payoutHistory.value = list.cast<Map<String, dynamic>>();
        }
      }
    } catch (_) {
    } finally {
      isFinancesLoading.value = false;
    }
  }

  Future<bool> savePayoutDetails({
    required String accountHolderName,
    required String bankName,
    required String bankAccountNumber,
    required String ifscCode,
    required String upiId,
  }) async {
    final holder = accountHolderName.trim();
    final bank = bankName.trim();
    final accNum = bankAccountNumber.trim();
    final ifsc = ifscCode.trim().toUpperCase();
    final upi = upiId.trim();

    final hasBank = accNum.isNotEmpty && ifsc.isNotEmpty;
    final hasUpi = upi.isNotEmpty;

    if (!hasBank && !hasUpi) {
      _showError(
        'Please enter either Bank Account Number & IFSC Code or a UPI ID',
      );
      return false;
    }

    if (hasBank && holder.isEmpty) {
      _showError('Please enter the Account Holder Name');
      return false;
    }

    final payload = <String, dynamic>{
      'accountHolderName': holder,
      'bankName': bank,
      'bankAccountNumber': accNum,
      'ifscCode': ifsc,
      'upiId': upi,
    };

    try {
      isSavingPayoutDetails.value = true;

      // Try dedicated payout-details endpoint first
      final res = await _paymentService.updatePayoutDetails(_token, payload);
      if (res['success'] == true) {
        final data = res['data'];
        if (data is Map && data['payoutDetails'] is Map) {
          payoutDetails.value =
              Map<String, dynamic>.from(data['payoutDetails'] as Map);
        } else {
          payoutDetails.value = payload;
        }
      } else {
        // Fallback to profile update endpoint
        await _authService.updateProfile(token: _token, data: payload);
        payoutDetails.value = payload;
      }

      // Persist locally & sync with AuthViewmodel
      Get.find<LocalStorageService>().savePayoutDetails(payoutDetails);
      if (Get.isRegistered<AuthViewmodel>()) {
        final authVm = Get.find<AuthViewmodel>();
        final updatedUser = Map<String, dynamic>.from(authVm.currentUser);
        updatedUser.addAll(payload);
        authVm.currentUser.value = updatedUser;
      }

      _showSuccess('Payout account details saved successfully');
      return true;
    } catch (e) {
      _showError(e.toString());
      return false;
    } finally {
      isSavingPayoutDetails.value = false;
    }
  }

  Future<bool> requestPayout(double amount) async {
    if (!hasPayoutDetails) {
      _showError(
        'Please add and save your payout account details before requesting a payout',
      );
      return false;
    }

    try {
      isFinancesLoading.value = true;
      final res = await _paymentService.requestPayout(_token, amount);
      if (res['success']) {
        _showSuccess('Payout request submitted successfully');
        await fetchFinancesSummary();
        return true;
      } else {
        _showError(res['message'] ?? 'Failed to request payout');
        return false;
      }
    } catch (e) {
      _showError(e.toString());
      return false;
    } finally {
      isFinancesLoading.value = false;
    }
  }
}