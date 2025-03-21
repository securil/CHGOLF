// auth.js
// 로컬 스토리지에 사용자 정보 저장을 위한 키
const USER_KEY = 'chgolf_current_user';
const ADMIN_ID = 'admin';
const ADMIN_PW = '132400admin';

// 로그인 함수
async function login(nameOrId, phoneOrPw) {
  // 관리자 로그인 체크
  if (nameOrId === ADMIN_ID && phoneOrPw === ADMIN_PW) {
    const adminUser = {
      id: 'admin',
      name: '관리자',
      isAdmin: true
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
    return { success: true, user: adminUser };
  }
  
  // 일반 사용자 로그인
  try {
    // members.json 파일 불러오기
    const response = await fetch('data/members.json');
    if (!response.ok) {
      throw new Error('멤버 정보를 불러올 수 없습니다.');
    }
    
    const members = await response.json();
    
    // 사용자 찾기 (성함과 전화번호 뒷 4자리로 확인)
    const user = members.find(member => 
      member.name === nameOrId && 
      member.phone.slice(-4) === phoneOrPw
    );
    
    if (!user) {
      return { success: false, message: '사용자 정보가 일치하지 않습니다.' };
    }
    
    // 사용자 정보를 로컬 스토리지에 저장
    const userData = {
      id: user.id,
      name: user.name,
      class: user.class, // 기수 정보 포함
      isAdmin: false
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return { success: true, user: userData };
  } catch (error) {
    console.error('로그인 오류:', error);
    return { success: false, message: '로그인 처리 중 오류가 발생했습니다.' };
  }
}

// 로그아웃 함수
function logout() {
  localStorage.removeItem(USER_KEY);
  window.location.href = 'index.html'; // 로그인 페이지로 리디렉션
}

// 현재 로그인한 사용자 정보 가져오기
function getCurrentUser() {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) {
    return null;
  }
  return JSON.parse(userJson);
}

// 로그인 상태 확인 및 페이지 접근 제어
function checkAuth() {
  const user = getCurrentUser();
  
  // 로그인되지 않은 경우, 로그인 페이지로 리디렉션
  if (!user && window.location.pathname !== '/index.html' && 
      window.location.pathname !== '/') {
    window.location.href = 'index.html';
    return false;
  }
  
  // 관리자 페이지 접근 제한
  if (window.location.pathname.includes('/admin') && (!user || !user.isAdmin)) {
    window.location.href = 'mypage.html';
    return false;
  }
  
  return true;
}

// HTML 요소에 현재 사용자 정보 표시
function updateUserInfo() {
  const user = getCurrentUser();
  const userNameElement = document.getElementById('user-name');
  
  if (user && userNameElement) {
    userNameElement.textContent = user.name;
    
    // 관리자인 경우 관리자 메뉴 표시
    const adminMenuElement = document.getElementById('admin-menu');
    if (adminMenuElement) {
      adminMenuElement.style.display = user.isAdmin ? 'block' : 'none';
    }
  }
}

// 페이지 로드 시 인증 확인
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  updateUserInfo();
  
  // 로그인 폼 이벤트 리스너
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nameOrId = document.getElementById('login-name').value;
      const phoneOrPw = document.getElementById('login-phone').value;
      
      const result = await login(nameOrId, phoneOrPw);
      if (result.success) {
        // 관리자는 관리자 페이지로, 일반 사용자는 마이페이지로 리디렉션
        window.location.href = result.user.isAdmin ? 'admin.html' : 'mypage.html';
      } else {
        alert(result.message);
      }
    });
  }
  
  // 로그아웃 버튼 이벤트 리스너
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      logout();
    });
  }
});
