// 청구회 공통 자바스크립트 파일

// 현재 페이지에 해당하는 네비게이션 링크 활성화
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // 네비게이션 링크 활성화
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage) {
      link.classList.add('active');
    }
  });

  // HTML 페이지 내 컴포넌트 로드 기능
  loadComponents();
});

// HTML 컴포넌트 로드 기능
function loadComponents() {
  const componentElements = document.querySelectorAll('[data-component]');
  
  componentElements.forEach(async element => {
    const componentName = element.getAttribute('data-component');
    try {
      // 절대 경로가 아닌 상대 경로로 변경
      const response = await fetch(`components/${componentName}.html`);
      if (response.ok) {
        const componentContent = await response.text();
        element.innerHTML = componentContent;
      } else {
        console.error(`컴포넌트 로드 실패: ${componentName}`);
      }
    } catch (error) {
      console.error(`컴포넌트 로드 중 오류 발생: ${componentName}`, error);
    }
  });
}

// 날짜 형식 포맷팅 함수
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 스코어 데이터 로드 함수
async function loadScoreData(year) {
  try {
    const response = await fetch(`data/scores_${year}.json`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error(`스코어 데이터 로드 실패: ${year}년`);
      return null;
    }
  } catch (error) {
    console.error(`스코어 데이터 로드 중 오류 발생: ${year}년`, error);
    return null;
  }
}