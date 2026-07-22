import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_naver_map/flutter_naver_map.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'config/app_config.dart';
import 'screens/attendance_form_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('ko_KR');

  if (AppConfig.hasNaverMapKey) {
    await FlutterNaverMap().init(
      clientId: AppConfig.naverMapClientId,
      onAuthFailed: (ex) {
        debugPrint('Naver Map auth failed: $ex');
      },
    );
  }

  runApp(const HanwhaAttendanceApp());
}

class HanwhaAttendanceApp extends StatelessWidget {
  const HanwhaAttendanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      locale: const Locale('ko', 'KR'),
      supportedLocales: const [Locale('ko', 'KR')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF006B3F),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: AppConfig.readyForBackendTest
          ? const AttendanceFormPage()
          : const ConfigRequiredPage(),
    );
  }
}

class ConfigRequiredPage extends StatelessWidget {
  const ConfigRequiredPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text(AppConfig.appName)),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.settings, size: 48, color: Color(0xFF006B3F)),
            const SizedBox(height: 16),
            Text(
              '앱 설정이 필요합니다',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Text('API_BASE_URL: ${AppConfig.apiBaseUrl}'),
            Text(
              'APP_API_KEY: ${AppConfig.hasApiKey ? "설정됨" : "미설정"}',
            ),
            Text(
              'NAVER_MAP_CLIENT_ID: ${AppConfig.hasNaverMapKey ? "설정됨" : "미설정 (선택)"}',
            ),
            const SizedBox(height: 16),
            const Text(
              '실행 예:\n'
              'flutter run --dart-define=API_BASE_URL=http://PC_IP:3001/api '
              '--dart-define=APP_API_KEY=키값 '
              '--dart-define=NAVER_MAP_CLIENT_ID=모바일_Client_ID',
            ),
            const Spacer(),
            Text(
              'docs/출결서비스_3단계_플러터앱.md 참고',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
