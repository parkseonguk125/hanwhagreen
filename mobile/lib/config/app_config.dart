/// 앱 실행 시 `--dart-define` 으로 주입하는 설정값.
///
/// 예 (Chrome/Windows 테스트):
/// ```bash
/// flutter run -d chrome \
///   --dart-define=API_BASE_URL=http://localhost:3001/api \
///   --dart-define=APP_API_KEY=로컬테스트용키 \
///   --dart-define=NAVER_MAP_CLIENT_ID=발급받은_모바일_Client_ID
/// ```
class AppConfig {
  /// 홈페이지 Express API 주소 (끝에 /api 포함)
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3001/api',
  );

  /// 앱 → 서버 제출용 비밀 키 (.env 의 ATTENDANCE_APP_API_KEY 와 동일)
  static const appApiKey = String.fromEnvironment(
    'APP_API_KEY',
    defaultValue: '',
  );

  /// NCP Maps **Mobile** SDK Client ID (웹용 VITE_NAVER_MAP_CLIENT_ID 와 별개)
  static const naverMapClientId = String.fromEnvironment(
    'NAVER_MAP_CLIENT_ID',
    defaultValue: '',
  );

  static const appName = '한화그린 출결';
  static const phaseLabel = '4단계 · 출결 작성 앱';

  static bool get hasApiKey => appApiKey.trim().isNotEmpty;

  static bool get hasNaverMapKey => naverMapClientId.trim().isNotEmpty;

  /// 1단계(백엔드 API) 이후 실제 제출에 필요한 최소 설정
  static bool get readyForBackendTest =>
      hasApiKey && apiBaseUrl.contains('/api');
}
