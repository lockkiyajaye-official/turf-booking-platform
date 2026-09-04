import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/models/support_ticket_model.dart';
import 'package:mobile/data/services/support_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/viewmodels/support/support_viewmodel.dart';

class SupportTicketDetailPage extends StatefulWidget {
  final SupportTicketModel ticket;

  const SupportTicketDetailPage({
    super.key,
    required this.ticket,
  });

  @override
  State<SupportTicketDetailPage> createState() =>
      _SupportTicketDetailPageState();
}

class _SupportTicketDetailPageState extends State<SupportTicketDetailPage> {
  late SupportTicketModel _ticket;
  final SupportService _supportService = SupportService();
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();

  @override
  void initState() {
    super.initState();
    _ticket = widget.ticket;
  }

  Future<void> _refreshTicket() async {
    final token = _authVm.token.value;
    if (token.isEmpty) return;

    try {
      final res = await _supportService.getTicketDetail(token, _ticket.id);
      if (res['success'] == true && res['data'] != null) {
        final data = res['data']['data'] ?? res['data'];
        if (data is Map<String, dynamic>) {
          if (mounted) {
            setState(() {
              _ticket = SupportTicketModel.fromJson(data);
            });
          }
        }
      }

      // Also refresh ticket list in background
      if (Get.isRegistered<SupportViewmodel>()) {
        Get.find<SupportViewmodel>().fetchMyTickets();
      }
    } catch (_) {}
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
          'Ticket Details',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _refreshTicket,
        color: colors.primary,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: EdgeInsets.all(16.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── TICKET OVERVIEW HEADER ─────────────────────────
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE8E8E8)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
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
                        Text(
                          'Ticket #${_ticket.id.length >= 8 ? _ticket.id.substring(0, 8).toUpperCase() : _ticket.id}',
                          style: textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w600,
                            color: colors.textMuted,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 10.w,
                            vertical: 4.h,
                          ),
                          decoration: BoxDecoration(
                            color: _ticket.statusBgColor,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 6.w,
                                height: 6.w,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _ticket.statusColor,
                                ),
                              ),
                              SizedBox(width: 6.w),
                              Text(
                                _ticket.statusText,
                                style: textTheme.bodySmall?.copyWith(
                                  color: _ticket.statusColor,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 11.sp,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 12.h),
                    Text(
                      _ticket.subject,
                      style: textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: colors.textTitle,
                        fontSize: 16.sp,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Row(
                      children: [
                        Icon(
                          Icons.access_time_rounded,
                          size: 14,
                          color: colors.textMuted,
                        ),
                        SizedBox(width: 4.w),
                        Text(
                          'Submitted on ${_ticket.formattedCreatedAt}',
                          style: textTheme.bodySmall?.copyWith(
                            color: colors.textMuted,
                            fontSize: 12.sp,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 16.h),

              // ── USER'S ORIGINAL MESSAGE ─────────────────────────
              Text(
                'Your Message',
                style: textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: colors.textTitle,
                ),
              ),
              SizedBox(height: 8.h),
              Container(
                width: double.infinity,
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE8E8E8)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 14.w,
                          backgroundColor:
                              colors.primary.withValues(alpha: 0.1),
                          child: Icon(
                            Icons.person,
                            size: 16,
                            color: colors.primary,
                          ),
                        ),
                        SizedBox(width: 8.w),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _ticket.name.isNotEmpty ? _ticket.name : 'You',
                              style: textTheme.bodyMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                                color: colors.textTitle,
                              ),
                            ),
                            if (_ticket.email.isNotEmpty)
                              Text(
                                _ticket.email,
                                style: textTheme.bodySmall?.copyWith(
                                  color: colors.textMuted,
                                  fontSize: 11.sp,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(height: 12.h),
                    Divider(height: 1, color: const Color(0xFFF0F0F0)),
                    SizedBox(height: 12.h),
                    Text(
                      _ticket.message,
                      style: textTheme.bodyMedium?.copyWith(
                        color: colors.textTitle,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 20.h),

              // ── ADMIN RESPONSE SECTION ─────────────────────────
              Text(
                'Admin Response',
                style: textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: colors.textTitle,
                ),
              ),
              SizedBox(height: 8.h),

              if (_ticket.hasAdminResponse)
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(16.w),
                  decoration: BoxDecoration(
                    color: colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFF16A34A).withValues(alpha: 0.3),
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color:
                            const Color(0xFF16A34A).withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 14.w,
                                backgroundColor: const Color(0xFFDCFCE7),
                                child: const Icon(
                                  Icons.support_agent_rounded,
                                  size: 16,
                                  color: Color(0xFF16A34A),
                                ),
                              ),
                              SizedBox(width: 8.w),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Lock Kiya Jaye Support',
                                    style: textTheme.bodyMedium?.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: colors.textTitle,
                                    ),
                                  ),
                                  Text(
                                    _ticket.respondedBy ??
                                        'Official Representative',
                                    style: textTheme.bodySmall?.copyWith(
                                      color: const Color(0xFF16A34A),
                                      fontWeight: FontWeight.w600,
                                      fontSize: 11.sp,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 8.w,
                              vertical: 3.h,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Verified',
                              style: textTheme.bodySmall?.copyWith(
                                color: const Color(0xFF16A34A),
                                fontWeight: FontWeight.w700,
                                fontSize: 10.sp,
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (_ticket.respondedAt != null) ...[
                        SizedBox(height: 8.h),
                        Row(
                          children: [
                            Icon(
                              Icons.check_circle_outline,
                              size: 13,
                              color: colors.textMuted,
                            ),
                            SizedBox(width: 4.w),
                            Text(
                              'Responded on ${_ticket.formattedRespondedAt}',
                              style: textTheme.bodySmall?.copyWith(
                                color: colors.textMuted,
                                fontSize: 11.sp,
                              ),
                            ),
                          ],
                        ),
                      ],
                      SizedBox(height: 12.h),
                      Divider(height: 1, color: const Color(0xFFF0F0F0)),
                      SizedBox(height: 12.h),
                      Text(
                        _ticket.adminResponse!,
                        style: textTheme.bodyMedium?.copyWith(
                          color: colors.textTitle,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                )
              else
                Container(
                  width: double.infinity,
                  padding: EdgeInsets.all(20.w),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7).withValues(alpha: 0.4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFFD97706).withValues(alpha: 0.3),
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        Icons.schedule_rounded,
                        size: 36,
                        color: const Color(0xFFD97706),
                      ),
                      SizedBox(height: 10.h),
                      Text(
                        'Awaiting Support Team Response',
                        style: textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFF92400E),
                        ),
                      ),
                      SizedBox(height: 6.h),
                      Text(
                        'Our team usually reviews and responds within 24 hours. Pull down to refresh anytime to check for new updates.',
                        textAlign: TextAlign.center,
                        style: textTheme.bodySmall?.copyWith(
                          color: const Color(0xFF92400E)
                              .withValues(alpha: 0.8),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),

              SizedBox(height: 32.h),
            ],
          ),
        ),
      ),
    );
  }
}
