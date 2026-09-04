import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/support_ticket_model.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/viewmodels/support/support_viewmodel.dart';
import 'package:mobile/views/profile/support_ticket_detail_page.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';

class SupportPage extends StatefulWidget {
  final int initialTab;

  const SupportPage({
    super.key,
    this.initialTab = 0,
  });

  @override
  State<SupportPage> createState() => _SupportPageState();
}

class _SupportPageState extends State<SupportPage>
    with SingleTickerProviderStateMixin {
  late final SupportViewmodel _supportVm;
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  late TabController _tabController;
  late TextEditingController _subjectController;
  late TextEditingController _messageController;

  final List<Map<String, String>> _faqs = [
    {
      'question': 'How do I cancel or reschedule my booking?',
      'answer':
          'Go to Profile > Cancellation/Reschedule, choose your upcoming booking, and tap Cancel Booking. You can re-book any available slot afterwards.',
    },
    {
      'question': 'When will my refund be processed?',
      'answer':
          'Refunds for eligible cancellations are automatically processed within 5-7 business days back to your original payment method.',
    },
    {
      'question': 'How do I book a turf slot?',
      'answer':
          'Browse available venues from the Home tab, choose your preferred sport, select an available date and time slot, and proceed to checkout to confirm your booking.',
    },
  ];

  @override
  void initState() {
    super.initState();
    // Ensure SupportViewmodel is available
    if (Get.isRegistered<SupportViewmodel>()) {
      _supportVm = Get.find<SupportViewmodel>();
    } else {
      _supportVm = Get.put(SupportViewmodel());
    }

    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab.clamp(0, 1),
    );
    _subjectController = TextEditingController();
    _messageController = TextEditingController();

    if (_authVm.token.value.isNotEmpty) {
      _supportVm.fetchMyTickets();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _subjectController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    final subject = _subjectController.text.trim();
    final message = _messageController.text.trim();

    if (subject.isEmpty || message.isEmpty) {
      Get.snackbar(
        'Error',
        'Please fill in both subject and message',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    if (subject.length < 5) {
      Get.snackbar(
        'Error',
        'Subject must be at least 5 characters long',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    if (message.length < 10) {
      Get.snackbar(
        'Error',
        'Message must be at least 10 characters long',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    final success = await _supportVm.submitTicket(
      subject: subject,
      message: message,
    );

    if (success) {
      _subjectController.clear();
      _messageController.clear();
      // Switch to My Requests tab to see the newly submitted ticket
      _tabController.animateTo(1);
    }
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
          'Help & Support',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: Size.fromHeight(48.h),
          child: Container(
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFFEEEEEE), width: 1),
              ),
            ),
            child: TabBar(
              controller: _tabController,
              indicatorColor: colors.primary,
              indicatorWeight: 3,
              labelColor: colors.primary,
              unselectedLabelColor: colors.textMuted,
              labelStyle: textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w700,
              ),
              unselectedLabelStyle: textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
              tabs: [
                const Tab(text: 'FAQs & Contact'),
                Tab(
                  child: Obx(() {
                    final count = _supportVm.tickets.length;
                    return Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('My Requests'),
                        if (count > 0) ...[
                          SizedBox(width: 6.w),
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 6.w,
                              vertical: 2.h,
                            ),
                            decoration: BoxDecoration(
                              color: _supportVm.resolvedCount > 0
                                  ? const Color(0xFF16A34A)
                                  : colors.primary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$count',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ],
                    );
                  }),
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // ── TAB 1: FAQS & CONTACT ──────────────────────────
          _buildFaqsAndContactTab(colors, textTheme),

          // ── TAB 2: MY REQUESTS & RESPONSES ────────────────
          _buildMyRequestsTab(colors, textTheme),
        ],
      ),
    );
  }

  Widget _buildFaqsAndContactTab(AppColors colors, TextTheme textTheme) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Frequently Asked Questions',
            style: textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: colors.textTitle,
            ),
          ),
          SizedBox(height: 12.h),
          ..._faqs.map(
            (faq) => Padding(
              padding: EdgeInsets.only(bottom: 8.h),
              child: Material(
                color: colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                  side: const BorderSide(color: Color(0xFFE8E8E8)),
                ),
                clipBehavior: Clip.antiAlias,
                child: ExpansionTile(
                  shape: const Border(),
                  collapsedShape: const Border(),
                  title: Text(
                    faq['question']!,
                    style: textTheme.bodyMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colors.textTitle,
                    ),
                  ),
                  children: [
                    Padding(
                      padding: EdgeInsets.all(12.w),
                      child: Text(
                        faq['answer']!,
                        style: textTheme.bodySmall?.copyWith(
                          color: colors.textGrey,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SizedBox(height: 24.h),
          Text(
            'Contact Support',
            style: textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.w700,
              color: colors.textTitle,
            ),
          ),
          SizedBox(height: 12.h),
          Text(
            'Subject',
            style: textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: colors.textTitle,
            ),
          ),
          SizedBox(height: 6.h),
          MyTextField(
            height: 50.h,
            type: TextInputType.text,
            fillColor: colors.white,
            controller: _subjectController,
            hintText: 'e.g. Issue with booking (min 5 chars)',
          ),
          SizedBox(height: 14.h),
          Text(
            'Message',
            style: textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w600,
              color: colors.textTitle,
            ),
          ),
          SizedBox(height: 6.h),
          Container(
            decoration: BoxDecoration(
              color: colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: colors.textMuted.withValues(alpha: 0.5),
              ),
            ),
            child: TextFormField(
              controller: _messageController,
              maxLines: 4,
              style: textTheme.bodyMedium?.copyWith(
                color: colors.textTitle,
                fontWeight: FontWeight.w500,
              ),
              decoration: InputDecoration(
                hintText:
                    'Describe your issue or question (min 10 chars)...',
                hintStyle: textTheme.bodySmall?.copyWith(
                  color: colors.textMuted.withValues(alpha: 0.7),
                ),
                contentPadding: EdgeInsets.all(12.w),
                border: InputBorder.none,
              ),
            ),
          ),
          SizedBox(height: 24.h),
          Obx(
            () => MyButtons(
              text: _supportVm.isSubmitting.value
                  ? 'Submitting...'
                  : 'Submit Support Ticket',
              height: 48.h,
              width: double.infinity,
              onTap: _supportVm.isSubmitting.value ? () {} : _submitForm,
              backgroundColor: colors.primary,
              textStyle: textTheme.bodyMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  Widget _buildMyRequestsTab(AppColors colors, TextTheme textTheme) {
    return Obx(() {
      if (_supportVm.isLoading.value && _supportVm.tickets.isEmpty) {
        return Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(colors.primary),
          ),
        );
      }

      if (_supportVm.tickets.isEmpty) {
        return Center(
          child: Padding(
            padding: EdgeInsets.all(32.w),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: EdgeInsets.all(20.w),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: colors.primary.withValues(alpha: 0.08),
                  ),
                  child: Icon(
                    Icons.chat_bubble_outline_rounded,
                    size: 48,
                    color: colors.primary,
                  ),
                ),
                SizedBox(height: 16.h),
                Text(
                  'No Support Requests Yet',
                  style: textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: colors.textTitle,
                    fontSize: 16.sp,
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  'Have a question or need assistance with a booking? Submit a request and our support team will respond here.',
                  textAlign: TextAlign.center,
                  style: textTheme.bodySmall?.copyWith(
                    color: colors.textMuted,
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 20.h),
                ElevatedButton.icon(
                  onPressed: () => _tabController.animateTo(0),
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Submit a Request'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: colors.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: EdgeInsets.symmetric(
                      horizontal: 20.w,
                      vertical: 12.h,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      }

      return RefreshIndicator(
        onRefresh: _supportVm.fetchMyTickets,
        color: colors.primary,
        child: ListView.separated(
          padding: EdgeInsets.all(16.w),
          itemCount: _supportVm.tickets.length,
          separatorBuilder: (context, index) => SizedBox(height: 12.h),
          itemBuilder: (context, index) {
            final ticket = _supportVm.tickets[index];
            return _buildTicketCard(ticket, colors, textTheme);
          },
        ),
      );
    });
  }

  Widget _buildTicketCard(
    SupportTicketModel ticket,
    AppColors colors,
    TextTheme textTheme,
  ) {
    return InkWell(
      onTap: () => Get.to(() => SupportTicketDetailPage(ticket: ticket)),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.all(16.w),
        decoration: BoxDecoration(
          color: colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: ticket.hasAdminResponse
                ? const Color(0xFF16A34A).withValues(alpha: 0.3)
                : const Color(0xFFE8E8E8),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 6,
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
                Text(
                  '#${ticket.id.length >= 8 ? ticket.id.substring(0, 8).toUpperCase() : ticket.id}',
                  style: textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: colors.textMuted,
                    fontSize: 11.sp,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 8.w,
                    vertical: 3.h,
                  ),
                  decoration: BoxDecoration(
                    color: ticket.statusBgColor,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 5.w,
                        height: 5.w,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: ticket.statusColor,
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        ticket.statusText,
                        style: TextStyle(
                          color: ticket.statusColor,
                          fontWeight: FontWeight.w700,
                          fontSize: 10.sp,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 8.h),
            Text(
              ticket.subject,
              style: textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w700,
                color: colors.textTitle,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 4.h),
            Text(
              ticket.message,
              style: textTheme.bodySmall?.copyWith(
                color: colors.textMuted,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 12.h),
            Divider(height: 1, color: const Color(0xFFF2F2F2)),
            SizedBox(height: 8.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  ticket.formattedCreatedAt,
                  style: textTheme.bodySmall?.copyWith(
                    color: colors.textMuted,
                    fontSize: 11.sp,
                  ),
                ),
                if (ticket.hasAdminResponse)
                  Row(
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        size: 14,
                        color: Color(0xFF16A34A),
                      ),
                      SizedBox(width: 4.w),
                      Text(
                        'Admin Replied',
                        style: TextStyle(
                          color: const Color(0xFF16A34A),
                          fontWeight: FontWeight.w700,
                          fontSize: 11.sp,
                        ),
                      ),
                    ],
                  )
                else
                  Text(
                    'Awaiting response',
                    style: textTheme.bodySmall?.copyWith(
                      color: const Color(0xFFD97706),
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
