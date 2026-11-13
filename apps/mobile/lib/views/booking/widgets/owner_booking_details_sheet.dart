import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/utils/helpers.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:url_launcher/url_launcher.dart';

Future<void> showOwnerBookingDetailsSheet(
  BuildContext context, {
  required Map<String, dynamic> booking,
  required OwnerViewmodel vm,
}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => _OwnerBookingDetailsSheetContent(
      booking: booking,
      vm: vm,
    ),
  );
}

class _OwnerBookingDetailsSheetContent extends StatefulWidget {
  final Map<String, dynamic> booking;
  final OwnerViewmodel vm;

  const _OwnerBookingDetailsSheetContent({
    required this.booking,
    required this.vm,
  });

  @override
  State<_OwnerBookingDetailsSheetContent> createState() =>
      _OwnerBookingDetailsSheetContentState();
}

class _OwnerBookingDetailsSheetContentState
    extends State<_OwnerBookingDetailsSheetContent> {
  late Map<String, dynamic> _booking;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _booking = Map<String, dynamic>.from(widget.booking);
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return const Color(0xFF059669);
      case 'pending':
        return const Color(0xFFD97706);
      case 'completed':
        return const Color(0xFF2563EB);
      case 'cancelled':
        return const Color(0xFFDC2626);
      default:
        return Colors.grey;
    }
  }

  Future<void> _makeCall(String phone) async {
    final clean = phone.trim();
    if (clean.isEmpty) return;
    try {
      final uri = Uri(scheme: 'tel', path: clean);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (_) {}
  }

  Future<void> _sendWhatsAppConfirmation({
    required String phone,
    required String bookingId,
    required String turfName,
    String? customerName,
    required String date,
    required String time,
    required dynamic amount,
    String? address,
    String? status,
  }) async {
    final message = WhatsAppHelper.buildConfirmationMessage(
      bookingId: bookingId,
      turfName: turfName,
      customerName: customerName,
      date: date,
      time: time,
      amount: amount,
      address: address,
      status: status,
    );

    final launched = await WhatsAppHelper.sendConfirmationMessage(
      phone: phone,
      message: message,
    );

    if (!launched) {
      Get.snackbar(
        'WhatsApp Not Reachable',
        'Unable to open WhatsApp for $phone. Please check if WhatsApp is installed.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.black87,
        colorText: Colors.white,
      );
    }
  }

  void _promptWhatsAppConfirmation({
    required String phone,
    required String bookingId,
    required String turfName,
    String? customerName,
    required String date,
    required String time,
    required dynamic amount,
    String? address,
  }) {
    Get.snackbar(
      'Booking Confirmed! ✅',
      'Send confirmation details to customer via WhatsApp?',
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 6),
      backgroundColor: const Color(0xFF0F172A),
      colorText: Colors.white,
      mainButton: TextButton.icon(
        icon:
            const Icon(Icons.chat_rounded, color: Color(0xFF25D366), size: 16),
        label: const Text(
          'Send WhatsApp',
          style: TextStyle(
            color: Color(0xFF25D366),
            fontWeight: FontWeight.bold,
          ),
        ),
        onPressed: () {
          Get.closeCurrentSnackbar();
          _sendWhatsAppConfirmation(
            phone: phone,
            bookingId: bookingId,
            turfName: turfName,
            customerName: customerName,
            date: date,
            time: time,
            amount: amount,
            address: address,
            status: 'confirmed',
          );
        },
      ),
      margin: const EdgeInsets.all(12),
      borderRadius: 12,
    );
  }

  Future<void> _sendEmail(String email) async {
    final clean = email.trim();
    if (clean.isEmpty) return;
    try {
      final uri = Uri(scheme: 'mailto', path: clean);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    } catch (_) {}
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    Get.snackbar(
      'Copied',
      '$label copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
      backgroundColor: Colors.black87,
      colorText: Colors.white,
      margin: const EdgeInsets.all(12),
    );
  }

  void _confirmCancel(BuildContext context, String id, bool isDirect) {
    final reasonController = TextEditingController(
      text: 'Slot unavailable / Turf maintenance',
    );

    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          isDirect ? 'Cancel Direct Booking' : 'Cancel & Refund Booking',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isDirect
                  ? 'Cancelling this offline booking will release the locked slot back to available for players.'
                  : 'Cancelling this booking will issue a 100% full refund back to the customer via Razorpay.',
              style: const TextStyle(fontSize: 13, color: Colors.black87),
            ),
            const SizedBox(height: 16),
            const Text(
              'Reason for Cancellation:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: reasonController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: 'Enter cancellation reason...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Keep Booking'),
          ),
          ElevatedButton(
            onPressed: () async {
              final reason = reasonController.text.trim().isNotEmpty
                  ? reasonController.text.trim()
                  : (isDirect
                      ? 'Cancelled by Owner'
                      : 'Cancelled by Turf Owner');
              Get.back();
              setState(() => _isProcessing = true);
              await widget.vm.cancelBooking(id, reason: reason);
              setState(() {
                _booking['status'] = 'cancelled';
                _booking['cancellationReason'] = reason;
                _isProcessing = false;
              });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(isDirect ? 'Confirm Cancel' : 'Confirm Cancel & Refund'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;

    final id = _booking['_id'] as String? ?? _booking['id'] as String? ?? '';
    final status = (_booking['status'] as String? ?? 'pending').toLowerCase();
    final isDirect =
        (_booking['bookingSource'] as String? ?? 'online').toLowerCase() ==
        'direct';

    final turfObj = _booking['turf'];
    final turfName =
        (turfObj is Map ? turfObj['name'] as String? : null) ??
        _booking['turfName'] as String? ??
        'Turf Facility';
    final turfAddress =
        (turfObj is Map ? turfObj['address'] as String? : null) ??
        _booking['turfAddress'] as String? ??
        'Address N/A';

    final userObj = _booking['user'];
    final userName =
        (isDirect ? _booking['customerName'] as String? : null) ??
        (userObj is Map ? userObj['name'] as String? : null) ??
        _booking['userName'] as String? ??
        (isDirect ? 'Direct Customer' : 'Player');
    final userPhone =
        (isDirect ? _booking['customerPhone'] as String? : null) ??
        (userObj is Map
            ? (userObj['phone'] ?? userObj['contactPhone']) as String?
            : null) ??
        _booking['userPhone'] as String? ??
        '';
    final userEmail =
        (userObj is Map ? userObj['email'] as String? : null) ??
        _booking['userEmail'] as String? ??
        '';

    final rawDate = _booking['bookingDate'] ?? _booking['date'];
    String dateStr = '';
    if (rawDate != null) {
      dateStr = rawDate.toString().split('T').first;
    }

    final startTime = _booking['startTime'] as String? ?? '';
    final endTime = _booking['endTime'] as String? ?? '';
    final formattedTime = (startTime.isNotEmpty && endTime.isNotEmpty)
        ? '${TimeHelper.formatSingleTime(startTime)} – ${TimeHelper.formatSingleTime(endTime)}'
        : (startTime.isNotEmpty ? TimeHelper.formatSingleTime(startTime) : '—');

    final amount = _booking['totalPrice'] ??
        _booking['totalAmount'] ??
        _booking['price'] ??
        0;

    final cancelReason = _booking['cancellationReason'] as String? ??
        _booking['cancelReason'] as String? ??
        '';

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: EdgeInsets.only(top: 12.h, bottom: 8.h),
              width: 40.w,
              height: 4.h,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: EdgeInsets.fromLTRB(20.w, 4.h, 16.w, 12.h),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Booking Details',
                        style: textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w800,
                          fontSize: 18.sp,
                        ),
                      ),
                      SizedBox(height: 2.h),
                      Text(
                        id.isNotEmpty
                            ? 'Reference: #${id.length > 8 ? id.substring(0, 8) : id}'
                            : '',
                        style: TextStyle(
                          fontSize: 11.sp,
                          fontFamily: 'monospace',
                          color: colors.textGrey,
                        ),
                      ),
                    ],
                  ),
                ),
                // Status badge
                Container(
                  padding:
                      EdgeInsets.symmetric(horizontal: 12.w, vertical: 5.h),
                  decoration: BoxDecoration(
                    color: _statusColor(status).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _statusColor(status).withValues(alpha: 0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _statusColor(status),
                        ),
                      ),
                      SizedBox(width: 6.w),
                      Text(
                        status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w800,
                          color: _statusColor(status),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(width: 6.w),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: Color(0xFFF0F0F0)),

          // Scrollable Body
          Flexible(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Source tag banner
                  Container(
                    width: double.infinity,
                    padding:
                        EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
                    decoration: BoxDecoration(
                      color: isDirect
                          ? const Color(0xFFF3E8FF)
                          : const Color(0xFFEFF6FF),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDirect
                            ? const Color(0xFFE9D5FF)
                            : const Color(0xFFDBEAFE),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isDirect
                              ? Icons.storefront_outlined
                              : Icons.language_rounded,
                          size: 18.sp,
                          color: isDirect
                              ? const Color(0xFF7E22CE)
                              : const Color(0xFF2563EB),
                        ),
                        SizedBox(width: 8.w),
                        Expanded(
                          child: Text(
                            isDirect
                                ? 'Direct Walk-in Booking (Offline record)'
                                : 'Online App Booking (Secured via Razorpay)',
                            style: TextStyle(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w700,
                              color: isDirect
                                  ? const Color(0xFF7E22CE)
                                  : const Color(0xFF2563EB),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 16.h),

                  // Customer card
                  _SectionHeader(title: 'Customer Information', colors: colors),
                  SizedBox(height: 8.h),
                  Container(
                    padding: EdgeInsets.all(14.w),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 20.r,
                              backgroundColor:
                                  colors.primary.withValues(alpha: 0.1),
                              child: Text(
                                userName.isNotEmpty
                                    ? userName[0].toUpperCase()
                                    : 'U',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: colors.primary,
                                  fontSize: 16.sp,
                                ),
                              ),
                            ),
                            SizedBox(width: 12.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    userName,
                                    style: textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 15.sp,
                                    ),
                                  ),
                                  if (userPhone.isNotEmpty) ...[
                                    SizedBox(height: 2.h),
                                    Text(
                                      userPhone,
                                      style: TextStyle(
                                        fontSize: 13.sp,
                                        color: colors.textGrey,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),

                        // Action pills for customer
                        if (userPhone.isNotEmpty || userEmail.isNotEmpty) ...[
                          SizedBox(height: 12.h),
                          const Divider(height: 1, color: Color(0xFFEBEBEB)),
                          SizedBox(height: 10.h),
                          Row(
                            children: [
                              if (userPhone.isNotEmpty) ...[
                                _ContactPill(
                                  icon: Icons.phone_rounded,
                                  label: 'Call',
                                  color: const Color(0xFF059669),
                                  onTap: () => _makeCall(userPhone),
                                ),
                                SizedBox(width: 8.w),
                                _ContactPill(
                                  icon: Icons.chat_rounded,
                                  label: 'WhatsApp',
                                  color: const Color(0xFF25D366),
                                  onTap: () => _sendWhatsAppConfirmation(
                                    phone: userPhone,
                                    bookingId: id,
                                    turfName: turfName,
                                    customerName: userName,
                                    date: dateStr,
                                    time: formattedTime,
                                    amount: amount,
                                    address: turfAddress,
                                    status: status,
                                  ),
                                ),
                                SizedBox(width: 8.w),
                                _ContactPill(
                                  icon: Icons.copy_rounded,
                                  label: 'Copy',
                                  color: Colors.grey.shade700,
                                  onTap: () =>
                                      _copyToClipboard(userPhone, 'Phone'),
                                ),
                              ],
                              if (userPhone.isEmpty &&
                                  userEmail.isNotEmpty) ...[
                                _ContactPill(
                                  icon: Icons.email_outlined,
                                  label: 'Email',
                                  color: colors.primary,
                                  onTap: () => _sendEmail(userEmail),
                                ),
                              ],
                            ],
                          ),
                          if (userPhone.isNotEmpty) ...[
                            SizedBox(height: 10.h),
                            Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: () => _sendWhatsAppConfirmation(
                                  phone: userPhone,
                                  bookingId: id,
                                  turfName: turfName,
                                  customerName: userName,
                                  date: dateStr,
                                  time: formattedTime,
                                  amount: amount,
                                  address: turfAddress,
                                  status: status,
                                ),
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 12.w,
                                    vertical: 9.h,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF25D366)
                                        .withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: const Color(0xFF25D366)
                                          .withValues(alpha: 0.35),
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(5),
                                        decoration: const BoxDecoration(
                                          color: Color(0xFF25D366),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                          Icons.chat_bubble_rounded,
                                          color: Colors.white,
                                          size: 13,
                                        ),
                                      ),
                                      SizedBox(width: 10.w),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Send Confirmation via WhatsApp',
                                              style: TextStyle(
                                                fontSize: 12.sp,
                                                fontWeight: FontWeight.w700,
                                                color: const Color(0xFF065F46),
                                              ),
                                            ),
                                            Text(
                                              'Opens chat with venue, date, time & price details',
                                              style: TextStyle(
                                                fontSize: 10.sp,
                                                color: Colors.black54,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Icon(
                                        Icons.arrow_forward_ios_rounded,
                                        size: 11.sp,
                                        color: const Color(0xFF065F46),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),

                  SizedBox(height: 16.h),

                  // Turf & Schedule details
                  _SectionHeader(title: 'Venue & Slot', colors: colors),
                  SizedBox(height: 8.h),
                  Container(
                    padding: EdgeInsets.all(14.w),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Column(
                      children: [
                        _DetailRow(
                          icon: Icons.sports_soccer_rounded,
                          title: 'Turf',
                          value: turfName,
                          subtitle: turfAddress,
                          colors: colors,
                        ),
                        const Divider(height: 18, color: Color(0xFFEBEBEB)),
                        _DetailRow(
                          icon: Icons.calendar_today_rounded,
                          title: 'Date',
                          value: dateStr,
                          colors: colors,
                        ),
                        const Divider(height: 18, color: Color(0xFFEBEBEB)),
                        _DetailRow(
                          icon: Icons.access_time_rounded,
                          title: 'Slot Timing',
                          value: formattedTime,
                          colors: colors,
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 16.h),

                  // Pricing & Payment
                  _SectionHeader(title: 'Financial Breakdown', colors: colors),
                  SizedBox(height: 8.h),
                  Container(
                    padding: EdgeInsets.all(14.w),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Total Booking Fee',
                              style: TextStyle(
                                fontSize: 13.sp,
                                color: colors.textGrey,
                              ),
                            ),
                            Text(
                              '₹$amount',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w800,
                                color: colors.textTitle,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8.h),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Payment Channel',
                              style: TextStyle(
                                fontSize: 13.sp,
                                color: colors.textGrey,
                              ),
                            ),
                            Text(
                              isDirect
                                  ? 'Offline Cash (Walk-in)'
                                  : 'Platform Wallet / Online',
                              style: TextStyle(
                                fontSize: 12.sp,
                                fontWeight: FontWeight.w700,
                                color: isDirect
                                    ? const Color(0xFF7E22CE)
                                    : const Color(0xFF059669),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Cancellation notice if cancelled
                  if (status == 'cancelled') ...[
                    SizedBox(height: 16.h),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(12.w),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFFCA5A5)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.cancel_outlined,
                                color: const Color(0xFFDC2626),
                                size: 16.sp,
                              ),
                              SizedBox(width: 6.w),
                              Text(
                                'Booking Cancelled',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: const Color(0xFFDC2626),
                                  fontSize: 12.sp,
                                ),
                              ),
                            ],
                          ),
                          if (cancelReason.isNotEmpty) ...[
                            SizedBox(height: 4.h),
                            Text(
                              'Reason: $cancelReason',
                              style: TextStyle(
                                fontSize: 12.sp,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],

                  SizedBox(height: 24.h),
                ],
              ),
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: EdgeInsets.fromLTRB(20.w, 12.h, 20.w, 24.h),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey.shade200)),
            ),
            child: _buildActionButtons(
              context,
              id,
              status,
              isDirect,
              userPhone: userPhone,
              turfName: turfName,
              userName: userName,
              dateStr: dateStr,
              formattedTime: formattedTime,
              amount: amount,
              turfAddress: turfAddress,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(
    BuildContext context,
    String id,
    String status,
    bool isDirect, {
    required String userPhone,
    required String turfName,
    required String userName,
    required String dateStr,
    required String formattedTime,
    required dynamic amount,
    required String turfAddress,
  }) {
    if (_isProcessing) {
      return const Center(
        child: SizedBox(
          height: 36,
          width: 36,
          child: CircularProgressIndicator(strokeWidth: 2.5),
        ),
      );
    }

    if (status == 'pending') {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => _confirmCancel(context, id, isDirect),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFDC2626)),
                padding: EdgeInsets.symmetric(vertical: 12.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Cancel',
                style: TextStyle(
                  color: Color(0xFFDC2626),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          SizedBox(width: 12.w),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () async {
                setState(() => _isProcessing = true);
                final success = await widget.vm.updateBookingStatus(
                  id,
                  'confirmed',
                );
                if (success) {
                  setState(() {
                    _booking['status'] = 'confirmed';
                    _isProcessing = false;
                  });
                  if (userPhone.isNotEmpty) {
                    _promptWhatsAppConfirmation(
                      phone: userPhone,
                      bookingId: id,
                      turfName: turfName,
                      customerName: userName,
                      date: dateStr,
                      time: formattedTime,
                      amount: amount,
                      address: turfAddress,
                    );
                  }
                } else {
                  setState(() => _isProcessing = false);
                }
              },
              icon: const Icon(Icons.check_circle_rounded, color: Colors.white),
              label: const Text(
                'Confirm',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                padding: EdgeInsets.symmetric(vertical: 12.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      );
    }

    if (status == 'confirmed') {
      return Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => _confirmCancel(context, id, isDirect),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFDC2626)),
                padding: EdgeInsets.symmetric(vertical: 12.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                isDirect ? 'Cancel' : 'Cancel & Refund',
                style: const TextStyle(
                  color: Color(0xFFDC2626),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          if (userPhone.isNotEmpty) ...[
            SizedBox(width: 8.w),
            InkWell(
              onTap: () => _sendWhatsAppConfirmation(
                phone: userPhone,
                bookingId: id,
                turfName: turfName,
                customerName: userName,
                date: dateStr,
                time: formattedTime,
                amount: amount,
                address: turfAddress,
                status: status,
              ),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 14.w,
                  vertical: 12.h,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF25D366),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.chat_rounded,
                        color: Colors.white, size: 18),
                    SizedBox(width: 6.w),
                    const Text(
                      'WhatsApp',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          SizedBox(width: 8.w),
          Expanded(
            child: ElevatedButton.icon(
              onPressed: () async {
                setState(() => _isProcessing = true);
                final success = await widget.vm.updateBookingStatus(
                  id,
                  'completed',
                );
                if (success) {
                  setState(() {
                    _booking['status'] = 'completed';
                    _isProcessing = false;
                  });
                } else {
                  setState(() => _isProcessing = false);
                }
              },
              icon: const Icon(Icons.task_alt_rounded, color: Colors.white),
              label: const Text(
                'Mark Complete',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                padding: EdgeInsets.symmetric(vertical: 12.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      );
    }

    if (status == 'completed') {
      return Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(vertical: 12.h),
        decoration: BoxDecoration(
          color: const Color(0xFFEFF6FF),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFBFDBFE)),
        ),
        child: const Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.check_circle_rounded, color: Color(0xFF2563EB), size: 18),
              SizedBox(width: 6),
              Text(
                'Slot Completed Successfully',
                style: TextStyle(
                  color: Color(0xFF2563EB),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Cancelled
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 12.h),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: const Center(
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cancel_rounded, color: Color(0xFFDC2626), size: 18),
            SizedBox(width: 6),
            Text(
              'Booking Cancelled',
              style: TextStyle(
                color: Color(0xFFDC2626),
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final AppColors colors;
  const _SectionHeader({required this.title, required this.colors});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 12.sp,
        fontWeight: FontWeight.w700,
        color: colors.textGrey,
        letterSpacing: 0.5,
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String? subtitle;
  final AppColors colors;

  const _DetailRow({
    required this.icon,
    required this.title,
    required this.value,
    this.subtitle,
    required this.colors,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 17.sp, color: colors.primary),
        SizedBox(width: 10.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(fontSize: 11.sp, color: colors.textGrey),
              ),
              SizedBox(height: 1.h),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13.sp,
                  fontWeight: FontWeight.w700,
                  color: colors.textTitle,
                ),
              ),
              if (subtitle != null && subtitle!.isNotEmpty) ...[
                SizedBox(height: 2.h),
                Text(
                  subtitle!,
                  style: TextStyle(fontSize: 11.sp, color: colors.textGrey),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _ContactPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ContactPill({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14.sp, color: color),
            SizedBox(width: 4.w),
            Text(
              label,
              style: TextStyle(
                fontSize: 11.sp,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

