import 'package:get/get.dart';
import 'package:mobile/data/models/support_ticket_model.dart';
import 'package:mobile/data/services/support_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';

class SupportViewmodel extends GetxController {
  final SupportService _service = SupportService();
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  final RxList<SupportTicketModel> tickets = <SupportTicketModel>[].obs;
  final RxBool isLoading = false.obs;
  final RxBool isSubmitting = false.obs;
  final RxString error = ''.obs;

  @override
  void onInit() {
    super.onInit();
    if (_authVm.token.value.isNotEmpty) {
      fetchMyTickets();
    }
  }

  int get resolvedCount =>
      tickets.where((t) => t.isResolved || t.hasAdminResponse).length;

  int get pendingCount =>
      tickets.where((t) => t.isPending && !t.hasAdminResponse).length;

  Future<void> fetchMyTickets() async {
    final token = _authVm.token.value;
    if (token.isEmpty) {
      tickets.clear();
      return;
    }

    try {
      isLoading.value = true;
      error.value = '';
      final response = await _service.getMyTickets(token);

      if (response['success'] == true && response['data'] != null) {
        final list = response['data']['data'] ?? response['data'];
        if (list is List) {
          tickets.value = list
              .map((item) =>
                  SupportTicketModel.fromJson(Map<String, dynamic>.from(item)))
              .toList();
        }
      } else {
        error.value = response['message'] ?? 'Failed to load tickets';
      }
    } catch (e) {
      error.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> submitTicket({
    required String subject,
    required String message,
  }) async {
    final user = _authVm.currentUser;
    String name =
        '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim();
    if (name.isEmpty) {
      name = (user['name'] ?? user['businessName'] ?? user['username'] ?? '')
          .toString()
          .trim();
    }
    if (name.length < 2) {
      name = 'App User';
    }

    String email = (user['email'] as String?)?.trim() ?? '';
    final emailRegex = RegExp(r'^[\w\.-]+@[\w\.-]+\.\w+$');
    if (email.isEmpty || !emailRegex.hasMatch(email)) {
      email = 'user@lockkiyajaye.com';
    }

    final userId = user['id']?.toString();
    final token = _authVm.token.value;

    try {
      isSubmitting.value = true;
      final response = await _service.submitTicket(
        token: token,
        name: name,
        email: email,
        subject: subject,
        message: message,
        userId: userId,
      );

      if (response['success'] == true) {
        Get.snackbar(
          'Success',
          'Your support ticket has been submitted!',
          snackPosition: SnackPosition.BOTTOM,
        );
        // Refresh ticket list
        await fetchMyTickets();
        return true;
      } else {
        Get.snackbar(
          'Error',
          response['message'] ?? 'Failed to submit support message',
          snackPosition: SnackPosition.BOTTOM,
        );
        return false;
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }
}
