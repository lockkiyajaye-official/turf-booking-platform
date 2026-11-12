import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/turf/owner_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';

class OwnerFinancesPage extends StatefulWidget {
  final bool openPayoutDetails;
  const OwnerFinancesPage({super.key, this.openPayoutDetails = false});

  @override
  State<OwnerFinancesPage> createState() => _OwnerFinancesPageState();
}

class _OwnerFinancesPageState extends State<OwnerFinancesPage> {
  final OwnerViewmodel _vm = Get.find<OwnerViewmodel>();

  late final TextEditingController _holderNameController;
  late final TextEditingController _bankNameController;
  late final TextEditingController _accountNumberController;
  late final TextEditingController _confirmAccountNumberController;
  late final TextEditingController _ifscController;
  late final TextEditingController _upiController;

  bool _isEditingPayoutDetails = false;
  bool _showAccountNumber = false;

  @override
  void initState() {
    super.initState();
    _holderNameController = TextEditingController();
    _bankNameController = TextEditingController();
    _accountNumberController = TextEditingController();
    _confirmAccountNumberController = TextEditingController();
    _ifscController = TextEditingController();
    _upiController = TextEditingController();

    _populateControllersFromVm();
    _isEditingPayoutDetails = widget.openPayoutDetails || !_vm.hasPayoutDetails;

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _vm.fetchFinancesSummary();
      if (mounted) {
        _populateControllersFromVm();
        setState(() {
          if (!widget.openPayoutDetails) {
            _isEditingPayoutDetails = !_vm.hasPayoutDetails;
          }
        });
      }
    });
  }

  void _populateControllersFromVm() {
    final details = _vm.payoutDetails;
    final accNum = (details['bankAccountNumber'] ?? '').toString();
    _holderNameController.text = (details['accountHolderName'] ?? '')
        .toString();
    _bankNameController.text = (details['bankName'] ?? '').toString();
    _accountNumberController.text = accNum;
    _confirmAccountNumberController.text = accNum;
    _ifscController.text = (details['ifscCode'] ?? '').toString();
    _upiController.text = (details['upiId'] ?? '').toString();
  }

  @override
  void dispose() {
    _holderNameController.dispose();
    _bankNameController.dispose();
    _accountNumberController.dispose();
    _confirmAccountNumberController.dispose();
    _ifscController.dispose();
    _upiController.dispose();
    super.dispose();
  }

  String _maskAccountNumber(String accNum) {
    final trimmed = accNum.trim();
    if (trimmed.length <= 4) return trimmed;
    final last4 = trimmed.substring(trimmed.length - 4);
    return '•••• •••• $last4';
  }

  Future<void> _handleSavePayoutDetails() async {
    if (_vm.isSavingPayoutDetails.value) return;
    final accNum = _accountNumberController.text.trim();
    final confirmAccNum = _confirmAccountNumberController.text.trim();
    final ifsc = _ifscController.text.trim().toUpperCase();
    final upi = _upiController.text.trim();

    if (accNum.isNotEmpty && accNum != confirmAccNum) {
      Get.snackbar(
        'Error',
        'Bank account numbers do not match',
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    if (accNum.isNotEmpty && ifsc.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter the bank IFSC code',
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final success = await _vm.savePayoutDetails(
      accountHolderName: _holderNameController.text,
      bankName: _bankNameController.text,
      bankAccountNumber: accNum,
      ifscCode: ifsc,
      upiId: upi,
    );

    if (success && mounted) {
      FocusScope.of(context).unfocus();
      setState(() {
        _isEditingPayoutDetails = false;
      });
    }
  }

  void _showRequestPayoutBottomSheet(
    BuildContext context,
    AppColors colors,
    TextTheme textTheme,
  ) {
    if (!_vm.hasPayoutDetails) {
      setState(() {
        _isEditingPayoutDetails = true;
      });
      Get.snackbar(
        'Payout Account Required',
        'Please enter and save your bank account or UPI details below first.',
        backgroundColor: Colors.orange.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

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
            final details = _vm.payoutDetails;
            final bankName = (details['bankName'] ?? '').toString().trim();
            final accNum = (details['bankAccountNumber'] ?? '')
                .toString()
                .trim();
            final upiId = (details['upiId'] ?? '').toString().trim();

            Future<void> submitPayout() async {
              if (isLoading) return;
              final text = amountController.text.trim();
              final amount = double.tryParse(text) ?? 0;

              if (amount <= 0) {
                Get.snackbar(
                  'Error',
                  'Please enter a valid amount',
                  backgroundColor: Colors.red.shade100,
                  snackPosition: SnackPosition.BOTTOM,
                );
                return;
              }
              if (amount > available) {
                Get.snackbar(
                  'Error',
                  'Amount exceeds available balance',
                  backgroundColor: Colors.red.shade100,
                  snackPosition: SnackPosition.BOTTOM,
                );
                return;
              }

              setModalState(() => isLoading = true);
              final success = await _vm.requestPayout(amount);
              setModalState(() => isLoading = false);

              if (success) {
                Get.back();
              }
            }

            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 500),
                child: Padding(
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
                      SizedBox(height: 14.h),

                      // Destination Account Summary Box
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(12.w),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: EdgeInsets.all(8.w),
                              decoration: BoxDecoration(
                                color: colors.primary.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.account_balance_rounded,
                                size: 18.sp,
                                color: colors.primary,
                              ),
                            ),
                            SizedBox(width: 10.w),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Transferring to',
                                    style: textTheme.bodySmall?.copyWith(
                                      color: colors.textGrey,
                                      fontSize: 11.sp,
                                    ),
                                  ),
                                  Text(
                                    accNum.isNotEmpty
                                        ? '${bankName.isNotEmpty ? bankName : 'Bank Account'} (${_maskAccountNumber(accNum)})'
                                        : 'UPI: $upiId',
                                    style: textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: colors.textTitle,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Get.back();
                                setState(() {
                                  _isEditingPayoutDetails = true;
                                });
                              },
                              child: Text(
                                'Change',
                                style: textTheme.bodySmall?.copyWith(
                                  color: colors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      SizedBox(height: 16.h),
                      Text(
                        'Enter Amount (₹)',
                        style: textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: colors.textTitle,
                        ),
                      ),
                      SizedBox(height: 8.h),
                      TextFormField(
                        controller: amountController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        style: textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: colors.textTitle,
                        ),
                        decoration: InputDecoration(
                          hintText: 'e.g. 1000',
                          prefixIcon: Icon(
                            Icons.currency_rupee_rounded,
                            color: colors.textGrey,
                          ),
                          filled: true,
                          fillColor: colors.background,
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 14.w,
                            vertical: 14.h,
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(
                              color: Color(0xFFDCDCDC),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(
                              color: Color(0xFFDCDCDC),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide(
                              color: colors.primary,
                              width: 1.5,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 12.h),

                      // Quick Amount Chips
                      Wrap(
                        spacing: 8.w,
                        children: {500, 1000, 2000, available.toInt()}.map((
                          val,
                        ) {
                          if (val <= 0) return const SizedBox.shrink();
                          return ChoiceChip(
                            label: Text(
                              val == available.toInt()
                                  ? 'Max (₹$val)'
                                  : '₹$val',
                            ),
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
                        isLoading: isLoading,
                        loadingText: 'Submitting...',
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
                ),
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
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: colors.textTitle,
            size: 18.sp,
          ),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Finances & Payouts',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Obx(() {
        if (_vm.isFinancesLoading.value &&
            _vm.walletBalance.value == 0 &&
            _vm.payoutHistory.isEmpty) {
          return Center(
            child: CircularProgressIndicator(color: colors.primary),
          );
        }

        final wallet = _vm.walletBalance.value;
        final history = _vm.payoutHistory;
        final hasDetails = _vm.hasPayoutDetails;

        if (context.isTablet) {
          return RefreshIndicator(
            color: colors.primary,
            onRefresh: () async {
              await _vm.fetchFinancesSummary();
              _populateControllersFromVm();
            },
            child: SingleChildScrollView(
              padding: EdgeInsets.all(24.w),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 400,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildWalletCard(context, colors, wallet, textTheme),
                        SizedBox(height: 16.h),
                        _buildPayoutDetailsSection(
                          colors,
                          textTheme,
                          hasDetails,
                        ),
                        SizedBox(height: 16.h),
                        _buildPayoutInfoCard(colors, textTheme),
                      ],
                    ),
                  ),
                  SizedBox(width: 24.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Payout History',
                          style: textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: colors.textTitle,
                          ),
                        ),
                        SizedBox(height: 12.h),
                        if (history.isEmpty)
                          _buildEmptyHistory(colors, textTheme)
                        else
                          _buildHistoryList(history, colors, textTheme),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        return RefreshIndicator(
          color: colors.primary,
          onRefresh: () async {
            await _vm.fetchFinancesSummary();
            _populateControllersFromVm();
          },
          child: ListView(
            padding: EdgeInsets.all(20.w),
            children: [
              _buildWalletCard(context, colors, wallet, textTheme),
              SizedBox(height: 20.h),
              _buildPayoutDetailsSection(colors, textTheme, hasDetails),
              SizedBox(height: 16.h),
              _buildPayoutInfoCard(colors, textTheme),
              SizedBox(height: 24.h),
              Text(
                'Payout History',
                style: textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colors.textTitle,
                ),
              ),
              SizedBox(height: 12.h),
              if (history.isEmpty)
                _buildEmptyHistory(colors, textTheme)
              else
                _buildHistoryList(history, colors, textTheme),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildWalletCard(
    BuildContext context,
    AppColors colors,
    double wallet,
    TextTheme textTheme,
  ) {
    final totalEarnings = _vm.totalEarnings.value;
    final totalPayouts = _vm.totalPayouts.value;

    return Container(
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
            color: Colors.black.withValues(alpha: 0.15),
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
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 11.sp,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.account_balance_wallet_outlined,
                      color: Colors.white,
                      size: 14.sp,
                    ),
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
          SizedBox(height: 14.h),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 8.h,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Earnings',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.65),
                          fontSize: 10.sp,
                        ),
                      ),
                      SizedBox(height: 2.h),
                      Text(
                        '₹${totalEarnings.toStringAsFixed(2)}',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 8.h,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Withdrawn',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.65),
                          fontSize: 10.sp,
                        ),
                      ),
                      SizedBox(height: 2.h),
                      Text(
                        '₹${totalPayouts.toStringAsFixed(2)}',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 18.h),
          SizedBox(
            width: double.infinity,
            height: 46.h,
            child: ElevatedButton.icon(
              onPressed: wallet > 0
                  ? () => _showRequestPayoutBottomSheet(
                      context,
                      colors,
                      textTheme,
                    )
                  : null,
              icon: const Icon(Icons.arrow_upward_rounded, size: 18),
              label: const Text('Request Payout'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE43434),
                foregroundColor: Colors.white,
                disabledBackgroundColor: Colors.white.withValues(alpha: 0.15),
                disabledForegroundColor: Colors.white.withValues(alpha: 0.5),
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
    );
  }

  Widget _buildPayoutDetailsSection(
    AppColors colors,
    TextTheme textTheme,
    bool hasDetails,
  ) {
    final details = _vm.payoutDetails;
    final holderName = (details['accountHolderName'] ?? '').toString().trim();
    final bankName = (details['bankName'] ?? '').toString().trim();
    final accNum = (details['bankAccountNumber'] ?? '').toString().trim();
    final ifsc = (details['ifscCode'] ?? '').toString().trim();
    final upiId = (details['upiId'] ?? '').toString().trim();

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(18.w),
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8E8E8)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(8.w),
                      decoration: BoxDecoration(
                        color: colors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        Icons.account_balance_rounded,
                        size: 18.sp,
                        color: colors.primary,
                      ),
                    ),
                    SizedBox(width: 10.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Payout Account Details',
                            style: textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: colors.textTitle,
                            ),
                          ),
                          Text(
                            hasDetails
                                ? 'Where your withdrawals are sent'
                                : 'Add bank or UPI to receive payouts',
                            style: textTheme.bodySmall?.copyWith(
                              color: colors.textGrey,
                              fontSize: 11.sp,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              if (hasDetails && !_isEditingPayoutDetails)
                TextButton.icon(
                  onPressed: () {
                    _populateControllersFromVm();
                    setState(() {
                      _isEditingPayoutDetails = true;
                    });
                  },
                  icon: Icon(
                    Icons.edit_outlined,
                    size: 15.sp,
                    color: colors.primary,
                  ),
                  label: Text(
                    'Edit',
                    style: textTheme.bodySmall?.copyWith(
                      color: colors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                )
              else if (hasDetails && _isEditingPayoutDetails)
                TextButton(
                  onPressed: () {
                    setState(() {
                      _isEditingPayoutDetails = false;
                    });
                  },
                  child: Text(
                    'Cancel',
                    style: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          SizedBox(height: 16.h),

          if (!_isEditingPayoutDetails && hasDetails) ...[
            // Saved Account View
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(14.w),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8.w,
                          vertical: 3.h,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.check_circle_rounded,
                              color: Colors.green,
                              size: 12.sp,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              'SAVED FOR PAYOUTS',
                              style: TextStyle(
                                color: Colors.green.shade700,
                                fontSize: 10.sp,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      if (accNum.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _showAccountNumber = !_showAccountNumber;
                            });
                          },
                          child: Row(
                            children: [
                              Icon(
                                _showAccountNumber
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 15.sp,
                                color: colors.textGrey,
                              ),
                              SizedBox(width: 4.w),
                              Text(
                                _showAccountNumber ? 'Hide' : 'Show',
                                style: textTheme.bodySmall?.copyWith(
                                  color: colors.textGrey,
                                  fontSize: 11.sp,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  if (accNum.isNotEmpty) ...[
                    SizedBox(height: 12.h),
                    _buildDetailRow(
                      label: 'Account Holder',
                      value: holderName.isNotEmpty ? holderName : '—',
                      colors: colors,
                      textTheme: textTheme,
                    ),
                    if (bankName.isNotEmpty) ...[
                      SizedBox(height: 8.h),
                      _buildDetailRow(
                        label: 'Bank Name',
                        value: bankName,
                        colors: colors,
                        textTheme: textTheme,
                      ),
                    ],
                    SizedBox(height: 8.h),
                    _buildDetailRow(
                      label: 'Account Number',
                      value: _showAccountNumber
                          ? accNum
                          : _maskAccountNumber(accNum),
                      colors: colors,
                      textTheme: textTheme,
                    ),
                    SizedBox(height: 8.h),
                    _buildDetailRow(
                      label: 'IFSC Code',
                      value: ifsc,
                      colors: colors,
                      textTheme: textTheme,
                    ),
                  ],
                  if (upiId.isNotEmpty) ...[
                    if (accNum.isNotEmpty)
                      Padding(
                        padding: EdgeInsets.symmetric(vertical: 10.h),
                        child: const Divider(height: 1),
                      )
                    else
                      SizedBox(height: 12.h),
                    _buildDetailRow(
                      label: 'UPI ID',
                      value: upiId,
                      colors: colors,
                      textTheme: textTheme,
                    ),
                  ],
                ],
              ),
            ),
          ] else ...[
            // Enter / Edit Payout Account Form
            _buildPayoutTextField(
              controller: _holderNameController,
              label: 'Account Holder Name',
              hint: 'As per bank records',
              icon: Icons.person_outline_rounded,
              colors: colors,
              textTheme: textTheme,
            ),
            SizedBox(height: 12.h),
            _buildPayoutTextField(
              controller: _bankNameController,
              label: 'Bank Name',
              hint: 'e.g. HDFC Bank, SBI, ICICI',
              icon: Icons.account_balance_outlined,
              colors: colors,
              textTheme: textTheme,
            ),
            SizedBox(height: 12.h),
            _buildPayoutTextField(
              controller: _accountNumberController,
              label: 'Bank Account Number',
              hint: 'Enter account number',
              icon: Icons.numbers_rounded,
              keyboardType: TextInputType.number,
              colors: colors,
              textTheme: textTheme,
            ),
            SizedBox(height: 12.h),
            _buildPayoutTextField(
              controller: _confirmAccountNumberController,
              label: 'Confirm Account Number',
              hint: 'Re-enter account number',
              icon: Icons.verified_user_outlined,
              keyboardType: TextInputType.number,
              colors: colors,
              textTheme: textTheme,
            ),
            SizedBox(height: 12.h),
            _buildPayoutTextField(
              controller: _ifscController,
              label: 'IFSC Code',
              hint: 'e.g. HDFC0001234',
              icon: Icons.pin_outlined,
              textCapitalization: TextCapitalization.characters,
              colors: colors,
              textTheme: textTheme,
            ),
            SizedBox(height: 14.h),
            Row(
              children: [
                const Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 10.w),
                  child: Text(
                    'AND / OR UPI',
                    style: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                      fontSize: 10.sp,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Expanded(child: Divider()),
              ],
            ),
            SizedBox(height: 12.h),
            _buildPayoutTextField(
              controller: _upiController,
              label: 'UPI ID (Optional if Bank added)',
              hint: 'e.g. businessname@okaxis',
              icon: Icons.qr_code_rounded,
              keyboardType: TextInputType.emailAddress,
              colors: colors,
              textTheme: textTheme,
            ),
            SizedBox(height: 18.h),
            Obx(
              () => MyButtons(
                text: _vm.isSavingPayoutDetails.value
                    ? 'Saving Details...'
                    : 'Save Payout Details',
                isLoading: _vm.isSavingPayoutDetails.value,
                loadingText: 'Saving Details...',
                height: 48.h,
                width: double.infinity,
                onTap: _vm.isSavingPayoutDetails.value
                    ? null
                    : _handleSavePayoutDetails,
                backgroundColor: colors.primary,
                textStyle: textTheme.bodyMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPayoutInfoCard(AppColors colors, TextTheme textTheme) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline_rounded,
                color: const Color(0xFFE43434),
                size: 20.sp,
              ),
              SizedBox(width: 8.w),
              Text(
                'Payout Information',
                style: textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colors.textTitle,
                ),
              ),
            ],
          ),
          SizedBox(height: 14.h),
          _buildInfoRow(
            Icons.bolt_rounded,
            'Processing Time',
            'Settled within 24-48 business hours',
            colors,
            textTheme,
          ),
          SizedBox(height: 12.h),
          _buildInfoRow(
            Icons.savings_outlined,
            'Minimum Payout',
            '₹500 threshold for payout requests',
            colors,
            textTheme,
          ),
          SizedBox(height: 12.h),
          _buildInfoRow(
            Icons.account_balance_outlined,
            'Direct Transfer',
            'Transferred to your saved bank account or UPI',
            colors,
            textTheme,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    IconData icon,
    String title,
    String subtitle,
    AppColors colors,
    TextTheme textTheme,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: colors.textGrey, size: 18.sp),
        SizedBox(width: 10.w),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: textTheme.bodySmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colors.textTitle,
                ),
              ),
              Text(
                subtitle,
                style: textTheme.bodySmall?.copyWith(
                  color: colors.textGrey,
                  fontSize: 11.sp,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyHistory(AppColors colors, TextTheme textTheme) {
    return Container(
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
    );
  }

  Widget _buildHistoryList(
    List history,
    AppColors colors,
    TextTheme textTheme,
  ) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: history.length,
      separatorBuilder: (_, _) => SizedBox(height: 10.h),
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
                      color: statusColor.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      status == 'approved' || status == 'completed'
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
                      horizontal: 8.w,
                      vertical: 2.h,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
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
    );
  }

  Widget _buildDetailRow({
    required String label,
    required String value,
    required AppColors colors,
    required TextTheme textTheme,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: textTheme.bodySmall?.copyWith(
            color: colors.textGrey,
            fontWeight: FontWeight.w500,
          ),
        ),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: textTheme.bodyMedium?.copyWith(
              color: colors.textTitle,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPayoutTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required AppColors colors,
    required TextTheme textTheme,
    TextInputType keyboardType = TextInputType.text,
    TextCapitalization textCapitalization = TextCapitalization.none,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: colors.textTitle,
            fontSize: 12.sp,
          ),
        ),
        SizedBox(height: 6.h),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          textCapitalization: textCapitalization,
          style: textTheme.bodyMedium?.copyWith(
            color: colors.textTitle,
            fontWeight: FontWeight.w600,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: textTheme.bodySmall?.copyWith(
              color: colors.textGrey.withValues(alpha: 0.7),
            ),
            isDense: true,
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            prefixIcon: Icon(icon, size: 18.sp, color: colors.primary),
            contentPadding: EdgeInsets.symmetric(
              horizontal: 14.w,
              vertical: 12.h,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: colors.primary, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}
