import 'package:flutter/material.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';

/// GPS 좌표를 앱 안 네이버 지도로 표시 (Mobile SDK Client ID 필요)
class NaverMapPreview extends StatelessWidget {
  const NaverMapPreview({
    super.key,
    required this.latitude,
    required this.longitude,
    this.height = 220,
  });

  final double latitude;
  final double longitude;
  final double height;

  @override
  Widget build(BuildContext context) {
    final target = NLatLng(latitude, longitude);

    return SizedBox(
      height: height,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: NaverMap(
          options: NaverMapViewOptions(
            initialCameraPosition: NCameraPosition(target: target, zoom: 16),
            scrollGesturesEnable: false,
            tiltGesturesEnable: false,
            rotationGesturesEnable: false,
            zoomGesturesEnable: true,
          ),
          onMapReady: (controller) {
            controller.addOverlay(
              NMarker(
                id: 'attendance_location',
                position: target,
                caption: const NOverlayCaption(text: '현재 위치'),
              ),
            );
          },
        ),
      ),
    );
  }
}
