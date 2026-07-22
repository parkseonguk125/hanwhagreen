# 한화그린 출격(출결) Flutter 앱



현장에서 GPS·사진·작업 내용을 기록해 홈페이지 **고객센터 → 출결서비스**와 연동하는 Android 앱입니다.



> **상세 문서**: [docs/출격서비스_0단계_사전준비.md](../docs/출격서비스_0단계_사전준비.md) ~ [4단계 APK배포](../docs/출격서비스_4단계_APK배포.md)



## 빠른 시작



```powershell

# 환경 점검

..\출격앱_환경확인.bat



# 에뮬레이터/기기 개발 실행

..\출격앱_Android실행.bat



# Release APK 빌드 (태블릿 배포)

..\출격앱_APK빌드.bat

```



## 주요 파일



| 경로 | 설명 |

|------|------|

| `lib/screens/attendance_form_page.dart` | 출격 작성 화면 |

| `lib/config/app_config.dart` | API URL·키 (`--dart-define`) |

| `scripts/run-android-dev.ps1` | 개발 실행 |

| `scripts/build-android-release.ps1` | Release APK 빌드 |

| `dist/` | 빌드된 APK (Git 제외) |



## 설정값 (--dart-define)



| 이름 | 설명 |

|------|------|

| `API_BASE_URL` | 예: `https://domain.com/api` |

| `APP_API_KEY` | `.env`의 `ATTENDANCE_APP_API_KEY`와 동일 |

| `NAVER_MAP_CLIENT_ID` | NCP **Mobile** Maps Client ID |



APK 빌드 시 `.env`의 `ATTENDANCE_APP_API_BASE_URL` 사용 — [4단계 문서](../docs/출격서비스_4단계_APK배포.md)



## 패키지 정보



- **Android 패키지**: `com.hanwhagreen.hanwha_attendance`

- **앱 표시 이름**: 한화그린 출격



## 구현 로드맵



| 단계 | 내용 | 상태 |

|------|------|------|

| 0 | Flutter 프로젝트·문서·환경 | ✅ |

| 1 | 백엔드 `/api/attendance` | ✅ |

| 2 | 홈페이지 출결서비스 메뉴 | ✅ |

| 3 | 지도·카메라·제출 UI | ✅ |

| 4 | APK 빌드·배포 | ✅ |


