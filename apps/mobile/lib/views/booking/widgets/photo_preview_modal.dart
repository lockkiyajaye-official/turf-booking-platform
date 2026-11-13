import 'dart:io';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile/core/constants/app_constants.dart';
import 'package:mobile/core/responsive/screen_extensions.dart';
import 'package:mobile/data/services/uploadcare_service.dart';

/// Full-screen interactive Photo Viewer and Editor for turf creation & editing.
/// Allows viewing high-res zoomable photos, reordering, replacing, interactive draggable cropping, setting primary cover, and deleting.
void showPhotoPreviewModal({
  required BuildContext context,
  required int initialIndex,
  required List<String> imageUrls,
  required int primaryIndex,
  required ValueChanged<int> onSetPrimary,
  required ValueChanged<int> onRemove,
  void Function(int oldIndex, int newIndex)? onReorder,
  required Future<void> Function(int index) onReplace,
  required void Function(int index, String newUrl) onCropApplied,
}) {
  showDialog(
    context: context,
    barrierColor: Colors.black.withValues(alpha: 0.92),
    builder: (dialogCtx) {
      return _PhotoPreviewDialogContent(
        initialIndex: initialIndex,
        imageUrls: List<String>.from(imageUrls),
        primaryIndex: primaryIndex,
        onSetPrimary: onSetPrimary,
        onRemove: onRemove,
        onReorder: onReorder,
        onReplace: onReplace,
        onCropApplied: onCropApplied,
      );
    },
  );
}

class _PhotoPreviewDialogContent extends StatefulWidget {
  final int initialIndex;
  final List<String> imageUrls;
  final int primaryIndex;
  final ValueChanged<int> onSetPrimary;
  final ValueChanged<int> onRemove;
  final void Function(int oldIndex, int newIndex)? onReorder;
  final Future<void> Function(int index) onReplace;
  final void Function(int index, String newUrl) onCropApplied;

  const _PhotoPreviewDialogContent({
    required this.initialIndex,
    required this.imageUrls,
    required this.primaryIndex,
    required this.onSetPrimary,
    required this.onRemove,
    this.onReorder,
    required this.onReplace,
    required this.onCropApplied,
  });

  @override
  State<_PhotoPreviewDialogContent> createState() =>
      _PhotoPreviewDialogContentState();
}

class _PhotoPreviewDialogContentState
    extends State<_PhotoPreviewDialogContent> {
  late PageController _pageController;
  late int _currentIndex;
  late int _currentPrimary;
  late List<String> _images;

  @override
  void initState() {
    super.initState();
    _images = List<String>.from(widget.imageUrls);
    _currentIndex = widget.initialIndex.clamp(
      0,
      _images.isEmpty ? 0 : _images.length - 1,
    );
    _currentPrimary = widget.primaryIndex;
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Widget _buildImage(String path) {
    final normalized = UploadcareService.normalizeCdnUrl(path);
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return Image.network(
        normalized,
        fit: BoxFit.contain,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return const Center(
            child: CircularProgressIndicator(
              color: Colors.white,
              strokeWidth: 2,
            ),
          );
        },
        errorBuilder: (_, _, _) => const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.broken_image_rounded, color: Colors.white54, size: 54),
              SizedBox(height: 8),
              Text(
                'Could not load image',
                style: TextStyle(color: Colors.white70),
              ),
            ],
          ),
        ),
      );
    }
    return Image.file(
      File(path),
      fit: BoxFit.contain,
      errorBuilder: (_, _, _) => const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.broken_image_rounded, color: Colors.white54, size: 54),
            SizedBox(height: 8),
            Text('File not found', style: TextStyle(color: Colors.white70)),
          ],
        ),
      ),
    );
  }

  void _openDraggableCropper() {
    final currentUrl = _images[_currentIndex];
    Get.to(
      () => _DraggableCropScreen(
        imageUrl: currentUrl,
        onCropDone: (newUrl) {
          setState(() {
            _images[_currentIndex] = newUrl;
          });
          widget.onCropApplied(_currentIndex, newUrl);
          // Dismiss the photo preview modal so the user returns directly to the edit page with the updated photo
          if (mounted) {
            Navigator.of(context).pop();
          }
        },
      ),
      fullscreenDialog: true,
      transition: Transition.fadeIn,
    );
  }

  void _handleDelete() {
    if (_images.isEmpty) return;
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Delete Photo?',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: const Text(
          'Are you sure you want to remove this photo from the turf?',
          style: TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text(
              'Cancel',
              style: TextStyle(color: Colors.white60),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              final deletedIdx = _currentIndex;
              widget.onRemove(deletedIdx);

              setState(() {
                _images.removeAt(deletedIdx);
                if (_currentPrimary == deletedIdx) {
                  _currentPrimary = 0;
                  widget.onSetPrimary(0);
                } else if (_currentPrimary > deletedIdx) {
                  _currentPrimary--;
                  widget.onSetPrimary(_currentPrimary);
                }

                if (_images.isEmpty) {
                  Navigator.of(context).pop();
                  return;
                }

                if (_currentIndex >= _images.length) {
                  _currentIndex = _images.length - 1;
                }
              });

              if (_images.isNotEmpty) {
                _pageController.jumpToPage(_currentIndex);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDC2626),
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_images.isEmpty) {
      return const SizedBox.shrink();
    }

    final isCover = _currentIndex == _currentPrimary;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.close_rounded,
                      color: Colors.white,
                      size: 26,
                    ),
                    tooltip: 'Close preview',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    'Photo ${_currentIndex + 1} of ${_images.length}',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15.sp,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const Spacer(),
                  if (isCover)
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 10.w,
                        vertical: 4.h,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE43434),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.star_rounded,
                            color: Colors.white,
                            size: 14,
                          ),
                          SizedBox(width: 4.w),
                          Text(
                            'Cover Photo',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11.sp,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            // Zoomable Interactive Viewer
            Expanded(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  PageView.builder(
                    controller: _pageController,
                    itemCount: _images.length,
                    onPageChanged: (idx) {
                      setState(() => _currentIndex = idx);
                    },
                    itemBuilder: (context, idx) {
                      return InteractiveViewer(
                        minScale: 0.8,
                        maxScale: 4.0,
                        child: Center(child: _buildImage(_images[idx])),
                      );
                    },
                  ),

                  // Left navigation arrow
                  if (_currentIndex > 0)
                    Positioned(
                      left: 12.w,
                      child: IconButton(
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: Colors.black45,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.chevron_left_rounded,
                            color: Colors.white,
                            size: 28,
                          ),
                        ),
                        onPressed: () {
                          _pageController.previousPage(
                            duration: const Duration(milliseconds: 250),
                            curve: Curves.easeInOut,
                          );
                        },
                      ),
                    ),

                  // Right navigation arrow
                  if (_currentIndex < _images.length - 1)
                    Positioned(
                      right: 12.w,
                      child: IconButton(
                        icon: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: Colors.black45,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.chevron_right_rounded,
                            color: Colors.white,
                            size: 28,
                          ),
                        ),
                        onPressed: () {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 250),
                            curve: Curves.easeInOut,
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),

            // Bottom Actions Toolbar
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.85),
                border: const Border(top: BorderSide(color: Colors.white12)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      // Set as Cover
                      _ActionButton(
                        icon: isCover
                            ? Icons.star_rounded
                            : Icons.star_outline_rounded,
                        label: isCover ? 'Cover' : 'Set Cover',
                        color: isCover
                            ? const Color(0xFFFBBF24)
                            : Colors.white70,
                        onTap: isCover
                            ? null
                            : () {
                                widget.onSetPrimary(_currentIndex);
                                setState(() => _currentPrimary = _currentIndex);
                              },
                      ),

                      // Draggable Crop Tool
                      _ActionButton(
                        icon: Icons.crop_rounded,
                        label: 'Crop',
                        color: const Color(0xFF10B981),
                        onTap: _openDraggableCropper,
                      ),

                      // Replace photo
                      _ActionButton(
                        icon: Icons.sync_rounded,
                        label: 'Replace',
                        color: Colors.white,
                        onTap: () async {
                          Navigator.of(context).pop();
                          await widget.onReplace(_currentIndex);
                        },
                      ),

                      // Delete photo
                      _ActionButton(
                        icon: Icons.delete_outline_rounded,
                        label: 'Delete',
                        color: const Color(0xFFEF4444),
                        onTap: _handleDelete,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback? onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: enabled ? color : Colors.white24, size: 22.sp),
            SizedBox(height: 4.h),
            Text(
              label,
              style: TextStyle(
                color: enabled ? color : Colors.white24,
                fontSize: 10.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FULLSCREEN DRAGGABLE & RESIZABLE CROP SCREEN
// ─────────────────────────────────────────────────────────────────────────────
class _DraggableCropScreen extends StatefulWidget {
  final String imageUrl;
  final ValueChanged<String> onCropDone;

  const _DraggableCropScreen({
    required this.imageUrl,
    required this.onCropDone,
  });

  @override
  State<_DraggableCropScreen> createState() => _DraggableCropScreenState();
}

enum _CropHandle { none, move, topLeft, topRight, bottomLeft, bottomRight }

class _DraggableCropScreenState extends State<_DraggableCropScreen> {
  ImageInfo? _imageInfo;
  double? _aspectRatio; // null = free, 16/9, 4/3, 1/1

  Rect? _imageRect;
  Rect? _cropRect;
  _CropHandle _activeHandle = _CropHandle.none;

  @override
  void initState() {
    super.initState();
    _aspectRatio = 16 / 9; // Default 16:9 banner for turf platforms
    _resolveImage();
  }

  void _resolveImage() {
    final normalized = UploadcareService.normalizeCdnUrl(widget.imageUrl);
    final ImageProvider provider = normalized.startsWith('http')
        ? NetworkImage(normalized)
        : FileImage(File(normalized)) as ImageProvider;

    provider
        .resolve(const ImageConfiguration())
        .addListener(
          ImageStreamListener((info, _) {
            if (mounted) {
              setState(() {
                _imageInfo = info;
                _cropRect = null; // Will recalculate on next layout
              });
            }
          }),
        );
  }

  void _initCropRect(Rect imgRect) {
    _imageRect = imgRect;
    if (_cropRect != null) return;

    double w = imgRect.width * 0.9;
    double h = imgRect.height * 0.9;

    if (_aspectRatio != null) {
      final target = _aspectRatio!;
      final current = imgRect.width / imgRect.height;
      if (target > current) {
        w = imgRect.width * 0.92;
        h = w / target;
      } else {
        h = imgRect.height * 0.92;
        w = h * target;
      }
    }

    final l = imgRect.left + (imgRect.width - w) / 2;
    final t = imgRect.top + (imgRect.height - h) / 2;
    _cropRect = Rect.fromLTWH(l, t, w, h);
  }

  void _snapToRatio(double? ratio) {
    if (_imageRect == null) return;
    setState(() {
      _aspectRatio = ratio;
      final imgRect = _imageRect!;
      double w = imgRect.width * 0.9;
      double h = imgRect.height * 0.9;

      if (ratio != null) {
        final current = imgRect.width / imgRect.height;
        if (ratio > current) {
          w = imgRect.width * 0.92;
          h = w / ratio;
        } else {
          h = imgRect.height * 0.92;
          w = h * ratio;
        }
      }

      final l = imgRect.left + (imgRect.width - w) / 2;
      final t = imgRect.top + (imgRect.height - h) / 2;
      _cropRect = Rect.fromLTWH(l, t, w, h);
    });
  }

  _CropHandle _hitTest(Offset p, Rect r) {
    const handleHitRadius = 30.0;
    if ((p - r.topLeft).distance <= handleHitRadius) return _CropHandle.topLeft;
    if ((p - r.topRight).distance <= handleHitRadius) {
      return _CropHandle.topRight;
    }
    if ((p - r.bottomLeft).distance <= handleHitRadius) {
      return _CropHandle.bottomLeft;
    }
    if ((p - r.bottomRight).distance <= handleHitRadius) {
      return _CropHandle.bottomRight;
    }
    if (r.contains(p)) return _CropHandle.move;
    return _CropHandle.none;
  }

  void _onPanStart(DragStartDetails d) {
    if (_cropRect == null) return;
    _activeHandle = _hitTest(d.localPosition, _cropRect!);
  }

  void _onPanUpdate(DragUpdateDetails d) {
    if (_cropRect == null ||
        _imageRect == null ||
        _activeHandle == _CropHandle.none) {
      return;
    }

    final dx = d.delta.dx;
    final dy = d.delta.dy;
    final img = _imageRect!;
    var r = _cropRect!;

    if (_activeHandle == _CropHandle.move) {
      double nextL = r.left + dx;
      double nextT = r.top + dy;
      if (nextL < img.left) nextL = img.left;
      if (nextT < img.top) nextT = img.top;
      if (nextL + r.width > img.right) nextL = img.right - r.width;
      if (nextT + r.height > img.bottom) nextT = img.bottom - r.height;
      setState(() {
        _cropRect = Rect.fromLTWH(nextL, nextT, r.width, r.height);
      });
      return;
    }

    // Corner dragging resize
    double nl = r.left;
    double nt = r.top;
    double nr = r.right;
    double nb = r.bottom;

    if (_activeHandle == _CropHandle.bottomRight) {
      nr = (nr + dx).clamp(nl + 40, img.right);
      nb = (nb + dy).clamp(nt + 40, img.bottom);
      if (_aspectRatio != null) {
        nb = (nt + (nr - nl) / _aspectRatio!).clamp(nt + 40, img.bottom);
        nr = (nl + (nb - nt) * _aspectRatio!).clamp(nl + 40, img.right);
      }
    } else if (_activeHandle == _CropHandle.topLeft) {
      nl = (nl + dx).clamp(img.left, nr - 40);
      nt = (nt + dy).clamp(img.top, nb - 40);
      if (_aspectRatio != null) {
        nt = (nb - (nr - nl) / _aspectRatio!).clamp(img.top, nb - 40);
        nl = (nr - (nb - nt) * _aspectRatio!).clamp(img.left, nr - 40);
      }
    } else if (_activeHandle == _CropHandle.topRight) {
      nr = (nr + dx).clamp(nl + 40, img.right);
      nt = (nt + dy).clamp(img.top, nb - 40);
      if (_aspectRatio != null) {
        nt = (nb - (nr - nl) / _aspectRatio!).clamp(img.top, nb - 40);
        nr = (nl + (nb - nt) * _aspectRatio!).clamp(nl + 40, img.right);
      }
    } else if (_activeHandle == _CropHandle.bottomLeft) {
      nl = (nl + dx).clamp(img.left, nr - 40);
      nb = (nb + dy).clamp(nt + 40, img.bottom);
      if (_aspectRatio != null) {
        nb = (nt + (nr - nl) / _aspectRatio!).clamp(nt + 40, img.bottom);
        nl = (nr - (nb - nt) * _aspectRatio!).clamp(img.left, nr - 40);
      }
    }

    setState(() {
      _cropRect = Rect.fromLTRB(nl, nt, nr, nb);
    });
  }

  void _onPanEnd(DragEndDetails _) {
    _activeHandle = _CropHandle.none;
  }

  bool _isSavingCrop = false;

  Future<void> _applyCrop() async {
    if (_cropRect == null || _imageRect == null || _imageInfo == null) return;
    if (_isSavingCrop) return;

    setState(() => _isSavingCrop = true);

    try {
      final c = _cropRect!;
      final img = _imageRect!;
      final naturalW = _imageInfo!.image.width.toDouble();
      final naturalH = _imageInfo!.image.height.toDouble();

      final int pxX = ((c.left - img.left) / img.width * naturalW)
          .round()
          .clamp(0, naturalW.toInt() - 1);
      final int pxY = ((c.top - img.top) / img.height * naturalH).round().clamp(
        0,
        naturalH.toInt() - 1,
      );
      final int pxW = (c.width / img.width * naturalW).round().clamp(
        1,
        naturalW.toInt() - pxX,
      );
      final int pxH = (c.height / img.height * naturalH).round().clamp(
        1,
        naturalH.toInt() - pxY,
      );

      // Check if the URL contains an Uploadcare UUID
      final uuidRegex = RegExp(
        r'([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})',
        caseSensitive: false,
      );
      final uuidMatch = uuidRegex.firstMatch(widget.imageUrl);

      String croppedUrl;

      if (uuidMatch != null) {
        final uuid = uuidMatch.group(1)!;
        final rawClean = widget.imageUrl
            .split('/-/')
            .first
            .replaceAll(RegExp(r'/+$'), '');
        final baseUrl = rawClean.contains(uuid)
            ? rawClean
            : '${AppConstants.uploadcareCdnUrl}/$uuid';

        // Direct pixel crop transformation for Uploadcare
        croppedUrl = '$baseUrl/-/crop/${pxW}x${pxH}/${pxX},${pxY}/';
      } else {
        // Local file or external image: crop using dart:ui Canvas
        final recorder = ui.PictureRecorder();
        final canvas = Canvas(recorder);
        final srcRect = Rect.fromLTWH(
          pxX.toDouble(),
          pxY.toDouble(),
          pxW.toDouble(),
          pxH.toDouble(),
        );
        final dstRect = Rect.fromLTWH(0, 0, pxW.toDouble(), pxH.toDouble());
        canvas.drawImageRect(_imageInfo!.image, srcRect, dstRect, Paint());
        final picture = recorder.endRecording();
        final croppedUiImage = await picture.toImage(pxW, pxH);
        final byteData = await croppedUiImage.toByteData(
          format: ui.ImageByteFormat.png,
        );

        if (byteData == null) {
          throw Exception('Failed to encode cropped image');
        }

        final bytes = byteData.buffer.asUint8List();
        final tempDir = Directory.systemTemp;
        final tempFile = File(
          '${tempDir.path}/crop_${DateTime.now().millisecondsSinceEpoch}.png',
        );
        await tempFile.writeAsBytes(bytes);

        // Upload to Uploadcare CDN or fallback to local path
        try {
          final res = await UploadcareService().uploadFile(tempFile);
          croppedUrl = res.cdnUrl;
        } catch (_) {
          croppedUrl = tempFile.path;
        }
      }

      // Clear Flutter memory & disk image cache so the newly cropped image renders immediately
      PaintingBinding.instance.imageCache.clear();
      PaintingBinding.instance.imageCache.clearLiveImages();

      widget.onCropDone(croppedUrl);
      Get.back();
    } catch (e) {
      Get.snackbar(
        'Crop Failed',
        'Could not crop image: $e',
        backgroundColor: Colors.red.shade100,
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      if (mounted) {
        setState(() => _isSavingCrop = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.close_rounded,
                      color: Colors.white,
                      size: 26,
                    ),
                    onPressed: () => Get.back(),
                  ),
                  SizedBox(width: 8.w),
                  const Text(
                    'Drag & Resize to Crop',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  ElevatedButton.icon(
                    icon: _isSavingCrop
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(
                            Icons.check_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                    label: Text(
                      _isSavingCrop ? 'Saving...' : 'Save Crop',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(
                        horizontal: 14.w,
                        vertical: 8.h,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    onPressed: _isSavingCrop ? null : _applyCrop,
                  ),
                ],
              ),
            ),

            // Draggable Interactive Crop Stage
            Expanded(
              child: _imageInfo == null
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : LayoutBuilder(
                      builder: (context, constraints) {
                        final naturalW = _imageInfo!.image.width.toDouble();
                        final naturalH = _imageInfo!.image.height.toDouble();

                        final fitted = applyBoxFit(
                          BoxFit.contain,
                          Size(naturalW, naturalH),
                          Size(constraints.maxWidth, constraints.maxHeight),
                        );

                        final rw = fitted.destination.width;
                        final rh = fitted.destination.height;
                        final ox = (constraints.maxWidth - rw) / 2;
                        final oy = (constraints.maxHeight - rh) / 2;
                        final imgRect = Rect.fromLTWH(ox, oy, rw, rh);

                        if (_imageRect != imgRect) {
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            if (mounted) {
                              setState(() => _initCropRect(imgRect));
                            }
                          });
                        }

                        return GestureDetector(
                          onPanStart: _onPanStart,
                          onPanUpdate: _onPanUpdate,
                          onPanEnd: _onPanEnd,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              // Background fitted image
                              Positioned(
                                left: ox,
                                top: oy,
                                width: rw,
                                height: rh,
                                child: RawImage(
                                  image: _imageInfo!.image,
                                  fit: BoxFit.fill,
                                ),
                              ),

                              // Draggable overlay painter
                              if (_cropRect != null)
                                CustomPaint(
                                  size: Size(
                                    constraints.maxWidth,
                                    constraints.maxHeight,
                                  ),
                                  painter: _CropOverlayPainter(
                                    cropRect: _cropRect!,
                                    imageRect: imgRect,
                                  ),
                                ),
                            ],
                          ),
                        );
                      },
                    ),
            ),

            // Aspect Ratio Quick Snaps
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
              color: const Color(0xFF0F172A),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'DRAG CORNERS TO RESIZE • DRAG INSIDE TO MOVE',
                    style: TextStyle(
                      color: Colors.white54,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.6,
                    ),
                  ),
                  SizedBox(height: 10.h),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _buildRatioButton('16:9 Banner', 16 / 9),
                        SizedBox(width: 8.w),
                        _buildRatioButton('4:3 Standard', 4 / 3),
                        SizedBox(width: 8.w),
                        _buildRatioButton('1:1 Square', 1.0),
                        SizedBox(width: 8.w),
                        _buildRatioButton('Free Crop', null),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRatioButton(String label, double? ratio) {
    final isSelected = _aspectRatio == ratio;
    return InkWell(
      onTap: () => _snapToRatio(ratio),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFE43434) : Colors.white12,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFFE43434) : Colors.white24,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: Colors.white,
            fontSize: 11.sp,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class _CropOverlayPainter extends CustomPainter {
  final Rect cropRect;
  final Rect imageRect;

  _CropOverlayPainter({required this.cropRect, required this.imageRect});

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw darkened scrim outside cropRect, bounded to imageRect
    final fullPath = Path()..addRect(imageRect);
    final cropPath = Path()..addRect(cropRect);
    final darkPath = Path.combine(PathOperation.difference, fullPath, cropPath);

    final scrimPaint = Paint()..color = Colors.black.withValues(alpha: 0.65);
    canvas.drawPath(darkPath, scrimPaint);

    // 2. Draw border
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    canvas.drawRect(cropRect, borderPaint);

    // 3. Draw Rule of Thirds grid
    final gridPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.35)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final wThird = cropRect.width / 3;
    final hThird = cropRect.height / 3;

    canvas.drawLine(
      Offset(cropRect.left + wThird, cropRect.top),
      Offset(cropRect.left + wThird, cropRect.bottom),
      gridPaint,
    );
    canvas.drawLine(
      Offset(cropRect.left + wThird * 2, cropRect.top),
      Offset(cropRect.left + wThird * 2, cropRect.bottom),
      gridPaint,
    );
    canvas.drawLine(
      Offset(cropRect.left, cropRect.top + hThird),
      Offset(cropRect.right, cropRect.top + hThird),
      gridPaint,
    );
    canvas.drawLine(
      Offset(cropRect.left, cropRect.top + hThird * 2),
      Offset(cropRect.right, cropRect.top + hThird * 2),
      gridPaint,
    );

    // 4. Draw 4 corner handles
    final handlePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0
      ..strokeCap = StrokeCap.square;

    const len = 18.0;

    // Top-Left
    canvas.drawLine(
      cropRect.topLeft,
      cropRect.topLeft + const Offset(len, 0),
      handlePaint,
    );
    canvas.drawLine(
      cropRect.topLeft,
      cropRect.topLeft + const Offset(0, len),
      handlePaint,
    );

    // Top-Right
    canvas.drawLine(
      cropRect.topRight,
      cropRect.topRight + const Offset(-len, 0),
      handlePaint,
    );
    canvas.drawLine(
      cropRect.topRight,
      cropRect.topRight + const Offset(0, len),
      handlePaint,
    );

    // Bottom-Left
    canvas.drawLine(
      cropRect.bottomLeft,
      cropRect.bottomLeft + const Offset(len, 0),
      handlePaint,
    );
    canvas.drawLine(
      cropRect.bottomLeft,
      cropRect.bottomLeft + const Offset(0, -len),
      handlePaint,
    );

    // Bottom-Right
    canvas.drawLine(
      cropRect.bottomRight,
      cropRect.bottomRight + const Offset(-len, 0),
      handlePaint,
    );
    canvas.drawLine(
      cropRect.bottomRight,
      cropRect.bottomRight + const Offset(0, -len),
      handlePaint,
    );
  }

  @override
  bool shouldRepaint(_CropOverlayPainter oldDelegate) {
    return oldDelegate.cropRect != cropRect ||
        oldDelegate.imageRect != imageRect;
  }
}
