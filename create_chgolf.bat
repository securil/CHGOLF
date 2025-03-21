@echo off
echo 청구회 골프모임 홈페이지 프로젝트 구조를 생성합니다...

:: 메인 디렉토리 생성
mkdir D:\CHGOLF
cd D:\CHGOLF

:: 하위 폴더 생성
mkdir components
mkdir data
mkdir js
mkdir css
mkdir images

:: HTML 파일 생성
echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>청구회^</title^>^</head^>^<body^>^</body^>^</html^> > index.html
echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>청구회 - 참가신청^</title^>^</head^>^<body^>^</body^>^</html^> > apply.html
echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>청구회 - 신청자 리스트^</title^>^</head^>^<body^>^</body^>^</html^> > applications.html
echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>청구회 - 마이페이지^</title^>^</head^>^<body^>^</body^>^</html^> > mypage.html
echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>청구회 - 조편성^</title^>^</head^>^<body^>^</body^>^</html^> > pairing.html
echo ^<!DOCTYPE html^>^<html^>^<head^>^<title^>청구회 - 통계^</title^>^</head^>^<body^>^</body^>^</html^> > statistics.html

:: 컴포넌트 파일 생성
echo ^<!-- 네비게이션 바 컴포넌트 --^> > components\navbar.html
echo ^<!-- 히어로 섹션 컴포넌트 --^> > components\hero.html
echo ^<!-- 소개 섹션 컴포넌트 --^> > components\about.html
echo ^<!-- 인사말 컴포넌트 --^> > components\greeting.html
echo ^<!-- 2025년 계획 컴포넌트 --^> > components\plans_2025.html
echo ^<!-- 조직도 컴포넌트 --^> > components\org_chart.html
echo ^<!-- 갤러리 컴포넌트 --^> > components\gallery.html

:: JS 파일 생성
echo // 메인 자바스크립트 파일 > js\main.js
echo // 신청 폼 처리 스크립트 > js\apply.js
echo // 조편성 스크립트 > js\pairing.js
echo // 차트 생성 스크립트 > js\chart.js
echo // 통계 처리 스크립트 > js\statistics.js

:: CSS 파일 생성
echo /* 청구회 스타일시트 */ > css\style.css

:: 데이터 파일 복사 안내
echo.
echo 프로젝트 구조가 성공적으로 생성되었습니다!
echo scores_2020.json부터 scores_2024.json 파일을 D:\CHGOLF\data 폴더에 복사해주세요.
echo 또한 추가로 다음 파일들을 만들어 주세요:
echo - D:\CHGOLF\data\members.json
echo - D:\CHGOLF\data\applications.json
echo.
echo 작업이 완료되면 "다음"을 입력해주세요.

pause