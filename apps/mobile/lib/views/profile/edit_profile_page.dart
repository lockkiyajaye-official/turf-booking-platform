import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/data/services/uploadcare_service.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';
import 'package:mobile/views/widgets/my_text_field.dart';
import 'package:mobile/views/widgets/state_selection_sheet.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();
  final ImagePicker _picker = ImagePicker();
  final UploadcareService _uploadcareService = UploadcareService();

  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _bioController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  String? _selectedState;

  File? _selectedImageFile;
  String? _currentAvatarUrl;
  bool _isSaving = false;
  late String _initialEmail;
  late String _initialPhone;

  @override
  void initState() {
    super.initState();
    final u = _authVm.currentUser;
    _initialEmail = u['email'] as String? ?? '';
    _initialPhone = u['phone'] as String? ?? '';
    _firstNameController = TextEditingController(
      text: u['firstName'] as String? ?? '',
    );
    _lastNameController = TextEditingController(
      text: u['lastName'] as String? ?? '',
    );
    _emailController = TextEditingController(text: _initialEmail);
    _phoneController = TextEditingController(text: _initialPhone);
    _bioController = TextEditingController(text: u['bio'] as String? ?? '');
    _cityController = TextEditingController(text: u['city'] as String? ?? '');
    final userState = (u['state'] as String? ?? '').trim();
    _stateController = TextEditingController(text: userState);
    _selectedState = userState.isNotEmpty ? userState : null;
    _currentAvatarUrl = (u['profileImage'] ?? u['avatarUrl']) as String?;
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImageFile = File(image.path);
        });
      }
    } catch (e) {
      Get.snackbar(
        'Permission / Error',
        'Could not select image: $e',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  void _showImagePickerModal(AppColors colors, TextTheme textTheme) {
    Get.bottomSheet(
      Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Material(
            color: colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            clipBehavior: Clip.antiAlias,
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 40.w,
                      height: 4.h,
                      margin: EdgeInsets.only(bottom: 16.h),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE0E0E0),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    Text(
                      'Profile Photo',
                      style: textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: colors.textTitle,
                      ),
                    ),
                    SizedBox(height: 16.h),
                    ListTile(
                      leading: Container(
                        padding: EdgeInsets.all(8.w),
                        decoration: BoxDecoration(
                          color: colors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.camera_alt_rounded,
                          color: colors.primary,
                        ),
                      ),
                      title: Text('Take Photo', style: textTheme.bodyMedium),
                      onTap: () {
                        Get.back();
                        _pickImage(ImageSource.camera);
                      },
                    ),
                    ListTile(
                      leading: Container(
                        padding: EdgeInsets.all(8.w),
                        decoration: BoxDecoration(
                          color: colors.primary.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.photo_library_rounded,
                          color: colors.primary,
                        ),
                      ),
                      title: Text(
                        'Choose from Gallery',
                        style: textTheme.bodyMedium,
                      ),
                      onTap: () {
                        Get.back();
                        _pickImage(ImageSource.gallery);
                      },
                    ),
                    if (_selectedImageFile != null ||
                        (_currentAvatarUrl != null &&
                            _currentAvatarUrl!.isNotEmpty))
                      ListTile(
                        leading: Container(
                          padding: EdgeInsets.all(8.w),
                          decoration: BoxDecoration(
                            color: colors.error.withValues(alpha: 0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.delete_outline_rounded,
                            color: colors.error,
                          ),
                        ),
                        title: Text(
                          'Remove Photo',
                          style: textTheme.bodyMedium?.copyWith(
                            color: colors.error,
                          ),
                        ),
                        onTap: () {
                          Get.back();
                          setState(() {
                            _selectedImageFile = null;
                            _currentAvatarUrl = '';
                          });
                        },
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _handleSave() async {
    if (_isSaving) return;
    setState(() => _isSaving = true);

    String? avatarData;
    if (_selectedImageFile != null) {
      try {
        final res = await _uploadcareService.uploadFile(_selectedImageFile!);
        avatarData = res.cdnUrl;
      } catch (e) {
        if (mounted) setState(() => _isSaving = false);
        Get.snackbar(
          'Upload Failed',
          'Could not upload profile picture to Uploadcare: $e',
          snackPosition: SnackPosition.BOTTOM,
        );
        return;
      }
    } else if (_currentAvatarUrl == '') {
      avatarData = '';
    }

    final newEmail = _emailController.text.trim();
    final newPhone = _phoneController.text.trim();
    final isEmailChanging =
        newEmail.toLowerCase() != _initialEmail.toLowerCase();
    final isPhoneChanging = newPhone != _initialPhone;

    // If contact info is changing, verify email OTP first
    if (isEmailChanging || isPhoneChanging) {
      if (newEmail.isEmpty || !GetUtils.isEmail(newEmail)) {
        if (mounted) setState(() => _isSaving = false);
        Get.snackbar('Invalid Email', 'Please enter a valid email address');
        return;
      }
      if (newPhone.isEmpty || newPhone.length < 10) {
        if (mounted) setState(() => _isSaving = false);
        Get.snackbar('Invalid Phone', 'Please enter a valid phone number');
        return;
      }

      final otpSent = await _authVm.requestContactOtp();
      if (mounted) setState(() => _isSaving = false);
      if (!otpSent) return;

      if (mounted) {
        _showOtpVerificationSheet(
          newEmail: newEmail,
          newPhone: newPhone,
          avatarData: avatarData,
        );
      }
      return;
    }

    final updateData = <String, dynamic>{
      'firstName': _firstNameController.text.trim(),
      'lastName': _lastNameController.text.trim(),
      'bio': _bioController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _selectedState ?? _stateController.text.trim(),
      if (avatarData != null) ...{
        'profileImage': avatarData,
        'avatarUrl': avatarData,
      },
    };

    final success = await _authVm.updateProfile(updateData);
    if (mounted) setState(() => _isSaving = false);
    if (success) {
      Get.back();
    }
  }

  void _showOtpVerificationSheet({
    required String newEmail,
    required String newPhone,
    String? avatarData,
  }) {
    final colors = Theme.of(context).extension<AppColors>()!;
    final textTheme = Theme.of(context).textTheme;
    final otpSheetController = TextEditingController();
    bool isVerifying = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (bottomSheetContext) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              padding: EdgeInsets.only(
                left: 20.w,
                right: 20.w,
                top: 20.h,
                bottom:
                    MediaQuery.of(bottomSheetContext).viewInsets.bottom + 24.h,
              ),
              decoration: BoxDecoration(
                color: colors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
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
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(8.w),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.shield_outlined,
                          color: Color(0xFFE43434),
                          size: 22,
                        ),
                      ),
                      SizedBox(width: 12.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Verify Contact Update',
                              style: textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: colors.textTitle,
                              ),
                            ),
                            SizedBox(height: 2.h),
                            Text(
                              'OTP verification required',
                              style: textTheme.bodySmall?.copyWith(
                                color: colors.textGrey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 14.h),
                  Text(
                    'A 6-digit verification code was sent to your email ($_initialEmail). Enter it below to confirm:',
                    style: textTheme.bodySmall?.copyWith(
                      color: colors.textGrey,
                      height: 1.4,
                    ),
                  ),
                  SizedBox(height: 16.h),
                  MyTextField(
                    controller: otpSheetController,
                    height: 50.h,
                    width: double.infinity,
                    type: TextInputType.number,
                    maxLength: 6,
                    fillColor: colors.background,
                    hintText: 'Enter 6-digit OTP',
                    prefixIcon: Icon(
                      Icons.lock_clock_outlined,
                      color: colors.textGrey,
                    ),
                  ),
                  SizedBox(height: 14.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton(
                        onPressed: isVerifying
                            ? null
                            : () async {
                                final sent = await _authVm.requestContactOtp();
                                if (sent) {
                                  Get.snackbar(
                                    'OTP Resent',
                                    'A new code was sent to your email',
                                  );
                                }
                              },
                        child: Text(
                          'Resend Code',
                          style: textTheme.bodySmall?.copyWith(
                            color: const Color(0xFFE43434),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: isVerifying
                            ? null
                            : () async {
                                final code = otpSheetController.text.trim();
                                if (code.length < 6) {
                                  Get.snackbar(
                                    'Invalid OTP',
                                    'Please enter the 6-digit code',
                                  );
                                  return;
                                }

                                setSheetState(() => isVerifying = true);

                                final updateData = <String, dynamic>{
                                  'firstName': _firstNameController.text.trim(),
                                  'lastName': _lastNameController.text.trim(),
                                  'bio': _bioController.text.trim(),
                                  'city': _cityController.text.trim(),
                                  'state':
                                      _selectedState ??
                                      _stateController.text.trim(),
                                  'email': newEmail,
                                  'phone': newPhone,
                                  'otp': code,
                                  if (avatarData != null) ...{
                                    'profileImage': avatarData,
                                    'avatarUrl': avatarData,
                                  },
                                };

                                final success = await _authVm.updateProfile(
                                  updateData,
                                );
                                setSheetState(() => isVerifying = false);

                                if (success) {
                                  Navigator.of(bottomSheetContext).pop();
                                  Get.back(); // exit edit profile
                                }
                              },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE43434),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: EdgeInsets.symmetric(
                            horizontal: 20.w,
                            vertical: 12.h,
                          ),
                        ),
                        child: isVerifying
                            ? SizedBox(
                                width: 16.w,
                                height: 16.w,
                                child: const CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              )
                            : Text(
                                'Confirm & Save',
                                style: textTheme.bodySmall?.copyWith(
                                  color: Colors.white,
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
          'Edit Profile',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: SingleChildScrollView(
            padding: EdgeInsets.all(20.w),
            child: Column(
              children: [
                SizedBox(height: 12.h),

                // ── Avatar Upload Section ──────────────────────────────
                Center(
                  child: Stack(
                    children: [
                      GestureDetector(
                        onTap: () => _showImagePickerModal(colors, textTheme),
                        child: Container(
                          width: 100.w,
                          height: 100.w,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: colors.white,
                            border: Border.all(color: colors.primary, width: 3),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.08),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ClipOval(child: _buildAvatarContent(colors)),
                        ),
                      ),
                      Positioned(
                        bottom: 2,
                        right: 2,
                        child: GestureDetector(
                          onTap: () => _showImagePickerModal(colors, textTheme),
                          child: Container(
                            padding: EdgeInsets.all(8.w),
                            decoration: BoxDecoration(
                              color: colors.primary,
                              shape: BoxShape.circle,
                              border: Border.all(color: colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.15),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.camera_alt_rounded,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 8.h),
                Text(
                  'Tap photo to update',
                  style: textTheme.bodySmall?.copyWith(
                    color: colors.textGrey,
                    fontSize: 12.sp,
                  ),
                ),
                SizedBox(height: 24.h),

                // ── Section 1: Personal Information ───────────────────
                _buildSectionCard(
                  colors: colors,
                  title: 'Personal Details',
                  icon: Icons.person_outline_rounded,
                  textTheme: textTheme,
                  children: [
                    _buildStyledTextField(
                      colors: colors,
                      textTheme: textTheme,
                      controller: _firstNameController,
                      label: 'First Name',
                      hint: 'Enter your first name',
                      prefixIcon: Icons.badge_outlined,
                    ),
                    SizedBox(height: 14.h),
                    _buildStyledTextField(
                      colors: colors,
                      textTheme: textTheme,
                      controller: _lastNameController,
                      label: 'Last Name',
                      hint: 'Enter your last name',
                      prefixIcon: Icons.badge_outlined,
                    ),
                    SizedBox(height: 14.h),
                    _buildStyledTextField(
                      colors: colors,
                      textTheme: textTheme,
                      controller: _bioController,
                      label: 'Bio',
                      hint: 'Tell us a bit about yourself',
                      prefixIcon: Icons.info_outline_rounded,
                      maxLines: 2,
                    ),
                  ],
                ),
                SizedBox(height: 16.h),

                // ── Section 2: Contact Info (Editable with Email OTP) ───────────────
                _buildSectionCard(
                  colors: colors,
                  title: 'Contact Information',
                  icon: Icons.contact_mail_outlined,
                  textTheme: textTheme,
                  children: [
                    _buildStyledTextField(
                      colors: colors,
                      textTheme: textTheme,
                      controller: _emailController,
                      label: 'Email Address',
                      hint: 'Email',
                      prefixIcon: Icons.email_outlined,
                      readOnly: false,
                      suffixWidget: Icon(
                        Icons.edit_outlined,
                        size: 16,
                        color: colors.textGrey,
                      ),
                    ),
                    SizedBox(height: 14.h),
                    _buildStyledTextField(
                      colors: colors,
                      textTheme: textTheme,
                      controller: _phoneController,
                      label: 'Phone Number',
                      hint: 'Phone',
                      prefixIcon: Icons.phone_android_outlined,
                      readOnly: false,
                      suffixWidget: Icon(
                        Icons.edit_outlined,
                        size: 16,
                        color: colors.textGrey,
                      ),
                    ),
                    SizedBox(height: 8.h),
                    Row(
                      children: [
                        Icon(
                          Icons.shield_outlined,
                          size: 13.sp,
                          color: colors.textGrey,
                        ),
                        SizedBox(width: 4.w),
                        Expanded(
                          child: Text(
                            'Requires email OTP verification when updating email or phone',
                            style: textTheme.bodySmall?.copyWith(
                              fontSize: 11.sp,
                              color: colors.textGrey,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                SizedBox(height: 16.h),

                // ── Section 3: Location Details ───────────────────────
                _buildSectionCard(
                  colors: colors,
                  title: 'Location Details',
                  icon: Icons.location_on_outlined,
                  textTheme: textTheme,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _buildStyledTextField(
                            colors: colors,
                            textTheme: textTheme,
                            controller: _cityController,
                            label: 'City',
                            hint: 'e.g. Naharlagun',
                            prefixIcon: Icons.location_city_outlined,
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: _buildStyledTextField(
                            colors: colors,
                            textTheme: textTheme,
                            controller: _stateController,
                            label: 'State',
                            hint: 'Select State',
                            prefixIcon: Icons.map_outlined,
                            readOnly: true,
                            onTap: () {
                              showStateSelectionSheet(
                                context,
                                selectedState: _selectedState,
                                onSelected: (val) {
                                  setState(() {
                                    _selectedState = val;
                                    _stateController.text = val;
                                  });
                                },
                              );
                            },
                            suffixWidget: Icon(
                              Icons.keyboard_arrow_down_rounded,
                              size: 20,
                              color: colors.textGrey,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                SizedBox(height: 28.h),

                // ── Submit Button ─────────────────────────────────────
                MyButtons(
                  text: _isSaving ? 'Saving Changes...' : 'Save Profile',
                  isLoading: _isSaving,
                  loadingText: 'Saving Changes...',
                  height: 50.h,
                  width: double.infinity,
                  onTap: _isSaving ? null : _handleSave,
                  backgroundColor: colors.primary,
                  textStyle: textTheme.bodyMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 15.sp,
                  ),
                ),
                SizedBox(height: 16.h),

                // ── Delete Account Option ──
                Center(
                  child: TextButton.icon(
                    onPressed: () => _confirmDeleteAccount(context, colors),
                    icon: Icon(
                      Icons.delete_forever_rounded,
                      color: colors.error,
                      size: 20.sp,
                    ),
                    label: Text(
                      'Delete Account',
                      style: TextStyle(
                        color: colors.error,
                        fontWeight: FontWeight.w600,
                        fontSize: 14.sp,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 24.h),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _confirmDeleteAccount(BuildContext context, AppColors colors) {
    final vm = Get.find<AuthViewmodel>();
    final TextEditingController reasonController = TextEditingController();

    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: colors.error.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.warning_amber_rounded,
                color: colors.error,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Delete Account',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Are you sure you want to delete your account? This action is permanent and cannot be undone.\n\nAll your personal data, profile details, bookings, and preferences will be permanently erased.',
              style: TextStyle(fontSize: 14, color: Color(0xFF475569)),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: reasonController,
              decoration: InputDecoration(
                hintText: 'Reason for deleting (optional)',
                hintStyle: TextStyle(fontSize: 13, color: colors.textGrey),
                isDense: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(
                    color: colors.textGrey.withValues(alpha: 0.3),
                  ),
                ),
                contentPadding: const EdgeInsets.all(12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Get.back();
              await vm.deleteAccount(reason: reasonController.text.trim());
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: colors.error,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              elevation: 0,
            ),
            child: const Text(
              'Delete Account',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarContent(AppColors colors) {
    if (_selectedImageFile != null) {
      return Image.file(
        _selectedImageFile!,
        fit: BoxFit.cover,
        width: 100.w,
        height: 100.w,
      );
    }

    if (_currentAvatarUrl != null && _currentAvatarUrl!.isNotEmpty) {
      if (_currentAvatarUrl!.startsWith('data:image')) {
        try {
          final base64Data = _currentAvatarUrl!.split(',').last;
          final bytes = base64Decode(base64Data);
          return Image.memory(
            bytes,
            fit: BoxFit.cover,
            width: 100.w,
            height: 100.w,
          );
        } catch (_) {}
      }
      return Image.network(
        _currentAvatarUrl!,
        fit: BoxFit.cover,
        width: 100.w,
        height: 100.w,
        errorBuilder: (context, error, stackTrace) =>
            _buildFallbackIcon(colors),
      );
    }

    return _buildFallbackIcon(colors);
  }

  Widget _buildFallbackIcon(AppColors colors) {
    return Container(
      color: colors.primary.withValues(alpha: 0.1),
      child: Icon(Icons.person_rounded, size: 52, color: colors.primary),
    );
  }

  Widget _buildSectionCard({
    required AppColors colors,
    required String title,
    required IconData icon,
    required TextTheme textTheme,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: colors.white,
        borderRadius: BorderRadius.circular(14),
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
            children: [
              Icon(icon, size: 18, color: colors.primary),
              SizedBox(width: 8.w),
              Text(
                title,
                style: textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colors.textTitle,
                ),
              ),
            ],
          ),
          SizedBox(height: 14.h),
          ...children,
        ],
      ),
    );
  }

  Widget _buildStyledTextField({
    required AppColors colors,
    required TextTheme textTheme,
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData prefixIcon,
    bool readOnly = false,
    VoidCallback? onTap,
    int maxLines = 1,
    Widget? suffixWidget,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: textTheme.bodySmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: readOnly && onTap == null
                ? colors.textGrey
                : colors.textTitle,
            fontSize: 12.sp,
          ),
        ),
        SizedBox(height: 6.h),
        TextFormField(
          controller: controller,
          readOnly: readOnly,
          onTap: onTap,
          maxLines: maxLines,
          style: textTheme.bodyMedium?.copyWith(
            color: readOnly && onTap == null
                ? colors.textGrey
                : colors.textTitle,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: textTheme.bodySmall?.copyWith(
              color: colors.textGrey.withValues(alpha: 0.7),
            ),
            isDense: true,
            filled: true,
            fillColor: readOnly && onTap == null
                ? const Color(0xFFF7F7F8)
                : Colors.transparent,
            prefixIcon: Icon(
              prefixIcon,
              size: 18,
              color: readOnly && onTap == null
                  ? colors.textGrey
                  : colors.primary,
            ),
            suffixIcon: suffixWidget != null
                ? Padding(
                    padding: EdgeInsets.only(right: 12.w),
                    child: suffixWidget,
                  )
                : null,
            contentPadding: EdgeInsets.symmetric(
              horizontal: 14.w,
              vertical: 12.h,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: readOnly && onTap == null
                    ? const Color(0xFFE0E0E0)
                    : const Color(0xFFDCDCDC),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: readOnly && onTap == null
                    ? const Color(0xFFE0E0E0)
                    : colors.primary,
                width: readOnly && onTap == null ? 1 : 1.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
