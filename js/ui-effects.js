// UI 효과 스크립트

document.addEventListener('DOMContentLoaded', function() {
    // 스크롤 관찰자 설정
    setupScrollObserver();
    
    // 스크롤 업 버튼 추가
    addScrollToTopButton();
    
    // 링크 트랜지션 효과
    setupLinkTransitions();
  });
  
  // 스크롤 관찰자 설정
  function setupScrollObserver() {
    // 스크롤 애니메이션 대상 요소
    const scrollElements = document.querySelectorAll('.card, .section-title, .hero-content, .gallery-item');
    
    // 각 요소에 reveal 클래스 추가
    scrollElements.forEach(element => {
      element.classList.add('scroll-reveal');
    });
    
    // IntersectionObserver 생성
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });
    
    // 각 요소 관찰 시작
    scrollElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  // 스크롤 업 버튼 추가
  function addScrollToTopButton() {
    // 버튼 생성
    const scrollButton = document.createElement('div');
    scrollButton.className = 'scroll-top';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollButton);
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollButton.classList.add('visible');
      } else {
        scrollButton.classList.remove('visible');
      }
    });
    
    // 클릭 이벤트 리스너
    scrollButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // 링크 트랜지션 효과
  function setupLinkTransitions() {
    // 내부 링크만 선택
    const internalLinks = document.querySelectorAll('a[href^="index"], a[href^="apply"], a[href^="applications"], a[href^="pairing"], a[href^="mypage"], a[href^="statistics"]');
    
    internalLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        // 현재 페이지와 같은 링크는 무시
        if (this.getAttribute('href') === window.location.pathname.split('/').pop()) {
          return;
        }
        
        event.preventDefault();
        const href = this.getAttribute('href');
        
        // 트랜지션 효과 적용
        document.body.classList.add('page-transition', 'transitioning');
        
        // 트랜지션 후 페이지 이동
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }