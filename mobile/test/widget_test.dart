import 'package:flutter_test/flutter_test.dart';
import 'package:hanwha_attendance/main.dart';

void main() {
  testWidgets('설정 미완료 시 안내 화면', (WidgetTester tester) async {
    await tester.pumpWidget(const HanwhaAttendanceApp());

    expect(find.text('한화그린 출결'), findsOneWidget);
    expect(find.textContaining('앱 설정'), findsOneWidget);
  });
}
