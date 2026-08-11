import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class OwnerFinancesPage extends StatefulWidget {
  const OwnerFinancesPage({super.key});

  @override
  State<OwnerFinancesPage> createState() => _OwnerFinancesPageState();
}

class _OwnerFinancesPageState extends State<OwnerFinancesPage> {
  final OwnerViewmodel _vm = Get.find<OwnerViewmodel>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _vm.fetchFinancesSummary();
    });
  }

  void _showRequestPayoutBottomSheet(BuildContext context, AppColors colors, TextTheme textTheme) {
    final amountController = TextEditingController();
    bool isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final available = _vm.walletBalance.value;

            Future<void> submitPayout() async {
              final text = amountController.text.trim();
              final amount = double.tryParse(text) ?? 0;

              if (amount <= 0) {
                Get.snackbar('Error', 'Please enter a valid amount',
                    backgroundColor: Colors.red.shade100,
                    snackPosition: SnackPosition.BOTTOM);
                return;
              }
              if (amount > available) {
                Get.snackbar('Error', 'Amount exceeds available balance',
                    backgroundColor: Colors.red.shade100,
                    snackPosition: SnackPosition.BOTTOM);
                return;
              }

              setModalState(() => isLoading = true);
              final success = await _vm.requestPayout(amount);
              setModalState(() => isLoading = false);

              if (success) {
                Get.back();
              }
            }

            return Padding(
              padding: EdgeInsets.only(
                left: 20.w,
                right: 20.w,
                top: 20.h,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20.h,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 40.w,
                      height: 4.h,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  SizedBox(height: 16.h),

                  Text(
                    'Request Payout',
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: colors.textTitle,
                    ),
                  ),
                  SizedBox(height: 4.h),
                  Text(
                    'Available Balance: ₹${available.toStringAsFixed(2)}',
                    style: textTheme.bodyMedium?.copyWith(
                      color: colors.textGrey,
                    ),
                  ),

                  SizedBox(height: 20.h),

                  Text(
                    'Enter Amount (₹)',
                    style: textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  MyTextField(
                    controller: amountController,
                    height: 50.h,
                    type: TextInputType.number,
                    fillColor: colors.background,
                    hintText: 'e.g. 1000',
                    prefixIcon: Icon(Icons.currency_rupee_rounded, color: colors.textGrey),
                  ),

                  SizedBox(height: 12.h),

                  // Quick Amount Chips
                  Wrap(
                    spacing: 8.w,
                    children: [500, 1000, 2000, available.toInt()].map((val) {
                      if (val <= 0) return const SizedBox.shrink();
                      return ChoiceChip(
                        label: Text(val == available.toInt() ? 'Max (₹$val)' : '₹$val'),
                        selected: false,
                        onSelected: (_) {
                          amountController.text = val.toString();
                        },
                        backgroundColor: colors.background,
                        labelStyle: textTheme.bodySmall?.copyWith(
                          color: colors.textTitle,
                          fontWeight: FontWeight.w600,
                        ),
                      );
                    }).toList(),
                  ),

                  SizedBox(height: 24.h),

                  MyButtons(
                    text: isLoading ? 'Submitting...' : 'Submit Request',
                    height: 50.h,
                    width: double.infinity,
                    onTap: isLoading ? null : submitPayout,
                    textStyle: textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                    backgroundColor: const Color(0xFFE43434),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
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
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: colors.textTitle, size: 18.sp),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Finances & Payouts',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Obx(() {
        if (_vm.isFinancesLoading.value && _vm.walletBalance.value == 0) {
          return Center(child: CircularProgressIndicator(color: colors.primary));
        }

        final wallet = _vm.walletBalance.value;
        final history = _vm.payoutHistory;

        return RefreshIndicator(
          color: colors.primary,
          onRefresh: () => _vm.fetchFinancesSummary(),
          child: ListView(
            padding: EdgeInsets.all(20.w),
            children: [
              // ── HERO WALLET CARD ──────────────────────────────
              Container(
                padding: EdgeInsets.all(20.w),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'AVAILABLE BALANCE',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 11.sp,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.account_balance_wallet_outlined,
                                  color: Colors.white, size: 14.sp),
                              SizedBox(width: 4.w),
                              Text(
                                'Wallet',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 11.sp,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 12.h),

                    Text(
                      '₹${wallet.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 32.sp,
                        fontWeight: FontWeight.w900,
                      ),
                    ),

                    SizedBox(height: 20.h),

                    SizedBox(
                      width: double.infinity,
                      height: 46.h,
                      child: ElevatedButton.icon(
                        onPressed: wallet > 0
                            ? () => _showRequestPayoutBottomSheet(context, colors, textTheme)
                            : null,
                        icon: const Icon(Icons.arrow_upward_rounded, size: 18),
                        label: const Text('Request Payout'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE43434),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          textStyle: TextStyle(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 24.h),

              // ── PAYOUT HISTORY HEADER ────────────────────────
              Text(
                'Payout History',
                style: textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colors.textTitle,
                ),
              ),
              SizedBox(height: 12.h),

              if (history.isEmpty)
                Container(
                  padding: EdgeInsets.all(32.w),
                  decoration: BoxDecoration(
                    color: colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE8E8E8)),
                  ),
                  child: Column(
                    children: [
                      Icon(Icons.history_rounded, size: 44.sp, color: colors.textGrey),
                      SizedBox(height: 8.h),
                      Text(
                        'No payout requests yet',
                        style: textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: colors.textGrey,
                        ),
                      ),
                      SizedBox(height: 4.h),
                      Text(
                        'Your withdrawal requests will appear here',
                        style: textTheme.bodySmall?.copyWith(color: colors.textGrey),
                      ),
                    ],
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: history.length,
                  separatorBuilder: (_, __) => SizedBox(height: 10.h),
                  itemBuilder: (context, index) {
                    final item = history[index];
                    final amount = item['amount'] ?? 0;
                    final status = (item['status'] as String? ?? 'pending').toLowerCase();
                    final createdAt = item['createdAt'] as String? ?? '';

                    Color statusColor;
                    String statusLabel;

                    if (status == 'approved' || status == 'completed') {
                      statusColor = Colors.green;
                      statusLabel = 'Approved';
                    } else if (status == 'rejected') {
                      statusColor = Colors.red;
                      statusLabel = 'Rejected';
                    } else {
                      statusColor = Colors.orange;
                      statusLabel = 'Pending';
                    }

                    return Container(
                      padding: EdgeInsets.all(16.w),
                      decoration: BoxDecoration(
                        color: colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE8E8E8)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 40.w,
                                height: 40.w,
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  status == 'approved'
                                      ? Icons.check_circle_outline_rounded
                                      : status == 'rejected'
                                          ? Icons.highlight_off_rounded
                                          : Icons.schedule_rounded,
                                  color: statusColor,
                                  size: 20.sp,
                                ),
                              ),
                              SizedBox(width: 12.w),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Payout Request',
                                    style: textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: colors.textTitle,
                                    ),
                                  ),
                                  if (createdAt.isNotEmpty)
                                    Text(
                                      createdAt.split('T').first,
                                      style: textTheme.bodySmall?.copyWith(
                                        color: colors.textGrey,
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '₹$amount',
                                style: textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w900,
                                  color: colors.textTitle,
                                ),
                              ),
                              SizedBox(height: 2.h),
                              Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 8.w, vertical: 2.h),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  statusLabel,
                                  style: TextStyle(
                                    color: statusColor,
                                    fontSize: 10.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        );
      }),
    );
  }
}
