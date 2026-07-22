import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class AttendanceSubmitResult {
  AttendanceSubmitResult({
    required this.id,
    required this.subject,
  });

  final int id;
  final String subject;

  factory AttendanceSubmitResult.fromJson(Map<String, dynamic> json) {
    return AttendanceSubmitResult(
      id: json['id'] as int,
      subject: json['subject'] as String? ?? '',
    );
  }
}

class AttendanceApiException implements Exception {
  AttendanceApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class AttendanceApi {
  AttendanceApi._();

  static Uri _uri(String path) {
    final base = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/+$'), '');
    final normalized = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$normalized');
  }

  static Future<AttendanceSubmitResult> submit({
    required String workDate,
    required String workContent,
    required String reporterName,
    required int personnelCount,
    double? latitude,
    double? longitude,
    String? address,
    String? photoPath,
    List<String> photoPaths = const [],
  }) async {
    if (!AppConfig.hasApiKey) {
      throw AttendanceApiException(
        'APP_API_KEY가 설정되지 않았습니다. --dart-define=APP_API_KEY=... 로 실행하세요.',
      );
    }

    final request = http.MultipartRequest('POST', _uri('/attendance'));
    request.headers['X-App-Key'] = AppConfig.appApiKey;
    request.fields['work_date'] = workDate;
    request.fields['work_content'] = workContent;
    request.fields['reporter_name'] = reporterName;
    request.fields['personnel_count'] = personnelCount.toString();

    if (latitude != null && longitude != null) {
      request.fields['latitude'] = latitude.toString();
      request.fields['longitude'] = longitude.toString();
    }
    if (address != null && address.trim().isNotEmpty) {
      request.fields['address'] = address.trim();
    }

    final paths = <String>[
      ...photoPaths.where((path) => path.trim().isNotEmpty),
      if (photoPath != null && photoPath.trim().isNotEmpty) photoPath.trim(),
    ];

    for (final path in paths) {
      request.files.add(await http.MultipartFile.fromPath('photo', path));
    }

    final streamed = await request.send();
    final body = await streamed.stream.bytesToString();
    Map<String, dynamic> data = {};
    if (body.isNotEmpty) {
      try {
        data = jsonDecode(body) as Map<String, dynamic>;
      } catch (_) {
        data = {};
      }
    }

    if (streamed.statusCode < 200 || streamed.statusCode >= 300) {
      throw AttendanceApiException(
        data['message'] as String? ?? '서버 오류 (${streamed.statusCode})',
        statusCode: streamed.statusCode,
      );
    }

    return AttendanceSubmitResult.fromJson(data);
  }
}
