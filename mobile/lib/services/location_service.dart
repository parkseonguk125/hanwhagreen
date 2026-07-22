import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

class LocationSnapshot {
  const LocationSnapshot({
    required this.latitude,
    required this.longitude,
    this.address = '',
  });

  final double latitude;
  final double longitude;
  final String address;
}

Future<LocationSnapshot> captureCurrentLocation() async {
  if (kIsWeb) {
    throw Exception('웹에서는 GPS 테스트가 제한됩니다. Android 기기에서 실행하세요.');
  }

  final serviceEnabled = await Geolocator.isLocationServiceEnabled();
  if (!serviceEnabled) {
    throw Exception('위치 서비스(GPS)가 꺼져 있습니다. 설정에서 켜 주세요.');
  }

  var permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
  }
  if (permission == LocationPermission.denied) {
    throw Exception('위치 권한이 거부되었습니다.');
  }
  if (permission == LocationPermission.deniedForever) {
    throw Exception('위치 권한이 영구 거부되었습니다. 앱 설정에서 허용해 주세요.');
  }

  final position = await Geolocator.getCurrentPosition(
    locationSettings: const LocationSettings(
      accuracy: LocationAccuracy.high,
      timeLimit: Duration(seconds: 20),
    ),
  );

  var address = '';
  try {
    final placemarks = await placemarkFromCoordinates(
      position.latitude,
      position.longitude,
    );
    if (placemarks.isNotEmpty) {
      final p = placemarks.first;
      address = [
        p.administrativeArea,
        p.locality,
        p.subLocality,
        p.thoroughfare,
      ].whereType<String>().where((part) => part.trim().isNotEmpty).join(' ');
    }
  } catch (_) {
    /* 역지오코딩 실패 시 좌표만 사용 */
  }

  return LocationSnapshot(
    latitude: position.latitude,
    longitude: position.longitude,
    address: address,
  );
}

Future<void> openNaverMapExternal({
  required double latitude,
  required double longitude,
}) async {
  final uri = Uri.parse(
    'https://map.naver.com/v5/?c=$longitude,$latitude,16,0,0,0,dh',
  );
  if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
    throw Exception('네이버 지도를 열 수 없습니다.');
  }
}

bool get isMobilePlatform => !kIsWeb && (Platform.isAndroid || Platform.isIOS);
