import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/viewmodels/auth/auth_viewmodel.dart';
import 'package:mobile/views/widgets/my_buttons.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final AuthViewmodel _authVm = Get.find<AuthViewmodel>();
  final ImagePicker _picker = ImagePicker();

  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _bioController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;

  File? _selectedImageFile;
  String? _currentAvatarUrl;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    final u = _authVm.currentUser;
    _firstNameController =
        TextEditingController(text: u['firstName'] as String? ?? '');
    _lastNameController =
        TextEditingController(text: u['lastName'] as String? ?? '');
    _emailController =
        TextEditingController(text: u['email'] as String? ?? '');
    _phoneController =
        TextEditingController(text: u['phone'] as String? ?? '');
    _bioController = TextEditingController(text: u['bio'] as String? ?? '');
    _cityController = TextEditingController(text: u['city'] as String? ?? '');
    _stateController =
        TextEditingController(text: u['state'] as String? ?? '');
    _currentAvatarUrl = u['avatarUrl'] as String?;
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
      Material(
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
                  child: Icon(Icons.camera_alt_rounded, color: colors.primary),
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
                  child: Icon(Icons.photo_library_rounded, color: colors.primary),
                ),
                title: Text('Choose from Gallery', style: textTheme.bodyMedium),
                onTap: () {
                  Get.back();
                  _pickImage(ImageSource.gallery);
                },
              ),
              if (_selectedImageFile != null ||
                  (_currentAvatarUrl != null && _currentAvatarUrl!.isNotEmpty))
                ListTile(
                  leading: Container(
                    padding: EdgeInsets.all(8.w),
                    decoration: BoxDecoration(
                      color: colors.error.withValues(alpha: 0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.delete_outline_rounded,
                        color: colors.error),
                  ),
                  title: Text(
                    'Remove Photo',
                    style: textTheme.bodyMedium?.copyWith(color: colors.error),
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
  );
}

  Future<void> _handleSave() async {
    setState(() => _isSaving = true);

    String? avatarData;
    if (_selectedImageFile != null) {
      final bytes = await _selectedImageFile!.readAsBytes();
      final base64String = base64Encode(bytes);
      avatarData = 'data:image/jpeg;base64,$base64String';
    } else if (_currentAvatarUrl == '') {
      avatarData = '';
    }

    final updateData = <String, dynamic>{
      'firstName': _firstNameController.text.trim(),
      'lastName': _lastNameController.text.trim(),
      'bio': _bioController.text.trim(),
      'city': _cityController.text.trim(),
      'state': _stateController.text.trim(),
      if (avatarData != null) 'avatarUrl': avatarData,
    };

    final success = await _authVm.updateProfile(updateData);
    if (mounted) setState(() => _isSaving = false);
    if (success) {
      Get.back();
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
          'Edit Profile',
          style: textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            color: colors.textTitle,
          ),
        ),
      ),
      body: SingleChildScrollView(
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
                        border: Border.all(
                          color: colors.primary,
                          width: 3,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: _buildAvatarContent(colors),
                      ),
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

            // ── Section 2: Contact Info (Read-Only) ───────────────
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
                  readOnly: true,
                  suffixWidget: Icon(
                    Icons.lock_outline_rounded,
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
                  readOnly: true,
                  suffixWidget: Icon(
                    Icons.lock_outline_rounded,
                    size: 16,
                    color: colors.textGrey,
                  ),
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
                        hint: 'e.g. Mumbai',
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
                        hint: 'e.g. Maharashtra',
                        prefixIcon: Icons.map_outlined,
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
              height: 50.h,
              width: double.infinity,
              onTap: _isSaving ? () {} : _handleSave,
              backgroundColor: colors.primary,
              textStyle: textTheme.bodyMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 15.sp,
              ),
            ),
            SizedBox(height: 24.h),
          ],
        ),
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
      child: Icon(
        Icons.person_rounded,
        size: 52,
        color: colors.primary,
      ),
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
            color: readOnly ? colors.textGrey : colors.textTitle,
            fontSize: 12.sp,
          ),
        ),
        SizedBox(height: 6.h),
        TextFormField(
          controller: controller,
          readOnly: readOnly,
          maxLines: maxLines,
          style: textTheme.bodyMedium?.copyWith(
            color: readOnly ? colors.textGrey : colors.textTitle,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: textTheme.bodySmall?.copyWith(
              color: colors.textGrey.withValues(alpha: 0.7),
            ),
            isDense: true,
            filled: true,
            fillColor:
                readOnly ? const Color(0xFFF7F7F8) : Colors.transparent,
            prefixIcon: Icon(
              prefixIcon,
              size: 18,
              color: readOnly ? colors.textGrey : colors.primary,
            ),
            suffixIcon: suffixWidget != null
                ? Padding(
                    padding: EdgeInsets.only(right: 12.w),
                    child: suffixWidget,
                  )
                : null,
            contentPadding:
                EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: readOnly
                    ? const Color(0xFFE0E0E0)
                    : const Color(0xFFDCDCDC),
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: readOnly ? const Color(0xFFE0E0E0) : colors.primary,
                width: readOnly ? 1 : 1.5,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
