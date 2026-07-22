import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../config/app_config.dart';
import '../services/attendance_api.dart';
import '../services/location_service.dart';
import '../widgets/naver_map_preview.dart';

class AttendanceFormPage extends StatefulWidget {
  const AttendanceFormPage({super.key});

  @override
  State<AttendanceFormPage> createState() => _AttendanceFormPageState();
}

class _AttendanceFormPageState extends State<AttendanceFormPage> {
  final _formKey = GlobalKey<FormState>();
  final _reporterController = TextEditingController();
  final _personnelController = TextEditingController(text: '1');
  final _contentController = TextEditingController();
  final _imagePicker = ImagePicker();

  static const int _maxPhotos = 20;

  DateTime _workDate = DateTime.now();
  LocationSnapshot? _location;
  final List<XFile> _photos = [];
  bool _loadingLocation = false;
  bool _submitting = false;

  @override
  void dispose() {
    _reporterController.dispose();
    _personnelController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  String get _workDateLabel =>
      DateFormat('yyyy년 M월 d일', 'ko_KR').format(_workDate);

  String get _workDateApiValue => DateFormat('yyyy-MM-dd').format(_workDate);

  Future<void> _pickWorkDate() async {
    final picked = await showDatePicker(
      context: context,
      locale: const Locale('ko', 'KR'),
      initialDate: _workDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      helpText: '작업일 선택',
      cancelText: '취소',
      confirmText: '확인',
    );
    if (picked != null) {
      setState(() => _workDate = picked);
    }
  }

  Future<void> _captureLocation() async {
    setState(() => _loadingLocation = true);
    try {
      final snapshot = await captureCurrentLocation();
      if (!mounted) return;
      setState(() => _location = snapshot);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('현재 위치를 저장했습니다.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) setState(() => _loadingLocation = false);
    }
  }

  Future<void> _pickPhotosFromGallery() async {
    try {
      final files = await _imagePicker.pickMultiImage(
        maxWidth: 1920,
        imageQuality: 85,
      );
      if (files.isEmpty) return;

      final remaining = _maxPhotos - _photos.length;
      if (remaining <= 0) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('사진은 최대 $_maxPhotos장까지 등록할 수 있습니다.')),
        );
        return;
      }

      setState(() {
        _photos.addAll(files.take(remaining));
      });

      if (files.length > remaining && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('사진은 최대 $_maxPhotos장까지 등록할 수 있습니다.')),
        );
      }
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('사진을 가져올 수 없습니다: $error')),
      );
    }
  }

  Future<void> _pickPhotoFromCamera() async {
    if (_photos.length >= _maxPhotos) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('사진은 최대 $_maxPhotos장까지 등록할 수 있습니다.')),
      );
      return;
    }

    try {
      final file = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        imageQuality: 85,
      );
      if (file != null) {
        setState(() => _photos.add(file));
      }
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('사진을 가져올 수 없습니다: $error')),
      );
    }
  }

  void _removePhoto(int index) {
    setState(() => _photos.removeAt(index));
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_location == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('「현재 위치 저장」을 눌러 GPS 정보를 등록해 주세요.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final personnel = int.tryParse(_personnelController.text.trim()) ?? 1;
      final result = await AttendanceApi.submit(
        workDate: _workDateApiValue,
        workContent: _contentController.text.trim(),
        reporterName: _reporterController.text.trim(),
        personnelCount: personnel,
        latitude: _location!.latitude,
        longitude: _location!.longitude,
        address: _location!.address,
        photoPaths: _photos.map((photo) => photo.path).toList(),
      );

      if (!mounted) return;
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('출결 등록 완료'),
          content: Text(
            '홈페이지 출결서비스에 등록되었습니다.\n\n'
            '번호: ${result.id}\n'
            '${result.subject}',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('확인'),
            ),
          ],
        ),
      );

      _formKey.currentState!.reset();
      _reporterController.clear();
      _personnelController.text = '1';
      _contentController.clear();
      setState(() {
        _workDate = DateTime.now();
        _location = null;
        _photos.clear();
      });
    } on AttendanceApiException catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.message)),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('전송 실패: $error')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConfig.appName),
        centerTitle: true,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              '출결 기록 작성',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              '작성 후 홈페이지 고객센터 → 출결서비스에 등록됩니다.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('작업일'),
              subtitle: Text(_workDateLabel),
              trailing: OutlinedButton(
                onPressed: _pickWorkDate,
                child: const Text('날짜 선택'),
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _reporterController,
              decoration: const InputDecoration(
                labelText: '작성자명',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return '작성자명을 입력해 주세요.';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _personnelController,
              decoration: const InputDecoration(
                labelText: '인원 수',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                final count = int.tryParse(value?.trim() ?? '');
                if (count == null || count < 1) {
                  return '1명 이상 입력해 주세요.';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _contentController,
              decoration: const InputDecoration(
                labelText: '작업 내용',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              minLines: 4,
              maxLines: 8,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return '작업 내용을 입력해 주세요.';
                }
                return null;
              },
            ),
            const SizedBox(height: 20),
            Text(
              '현재 위치 (GPS)',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            if (_location != null) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('위도: ${_location!.latitude}'),
                      Text('경도: ${_location!.longitude}'),
                      if (_location!.address.isNotEmpty)
                        Text('주소: ${_location!.address}'),
                    ],
                  ),
                ),
              ),
              if (AppConfig.hasNaverMapKey && isMobilePlatform) ...[
                const SizedBox(height: 8),
                NaverMapPreview(
                  latitude: _location!.latitude,
                  longitude: _location!.longitude,
                ),
              ],
              if (isMobilePlatform)
                TextButton.icon(
                  onPressed: () => openNaverMapExternal(
                    latitude: _location!.latitude,
                    longitude: _location!.longitude,
                  ),
                  icon: const Icon(Icons.map_outlined),
                  label: const Text('네이버 지도에서 위치 보기'),
                ),
            ] else
              const Text('아직 위치가 저장되지 않았습니다.'),
            const SizedBox(height: 8),
            FilledButton.icon(
              onPressed: _loadingLocation ? null : _captureLocation,
              icon: _loadingLocation
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.my_location),
              label: Text(_loadingLocation ? '위치 확인 중...' : '현재 위치 저장'),
            ),
            if (!AppConfig.hasNaverMapKey)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  '앱 내 지도를 쓰려면 .env 에 NAVER_MAP_CLIENT_ID(모바일용)를 넣고 앱을 다시 실행하세요. '
                  '지금은 GPS 저장 + 외부 네이버 지도 열기로 사용합니다.',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            const SizedBox(height: 20),
            Text(
              '현장 사진',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            if (_photos.isNotEmpty) ...[
              Text(
                '선택된 사진 ${_photos.length}장',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 112,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _photos.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final photo = _photos[index];
                    return Stack(
                      clipBehavior: Clip.none,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: kIsWeb
                              ? Container(
                                  width: 112,
                                  height: 112,
                                  color: const Color(0xFFECEFF1),
                                  alignment: Alignment.center,
                                  child: Text(
                                    photo.name,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(fontSize: 11),
                                  ),
                                )
                              : Image.file(
                                  File(photo.path),
                                  width: 112,
                                  height: 112,
                                  fit: BoxFit.cover,
                                ),
                        ),
                        Positioned(
                          top: -8,
                          right: -8,
                          child: IconButton(
                            onPressed: () => _removePhoto(index),
                            icon: const Icon(Icons.cancel, color: Colors.red),
                            iconSize: 22,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 8),
            ],
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _pickPhotoFromCamera,
                    icon: const Icon(Icons.photo_camera),
                    label: const Text('카메라'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _pickPhotosFromGallery,
                    icon: const Icon(Icons.photo_library),
                    label: const Text('갤러리'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            FilledButton(
              onPressed: _submitting ? null : _submit,
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(48),
                backgroundColor: const Color(0xFF006B3F),
              ),
              child: _submitting
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('출결 등록하기'),
            ),
            const SizedBox(height: 12),
            Text(
              'API: ${AppConfig.apiBaseUrl}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
