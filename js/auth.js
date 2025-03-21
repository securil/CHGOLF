/**
 * 청구회 인증 관련 스크립트
 * - 로그인, 로그아웃, 인증 상태 확인 등의 기능 제공
 */

// 로컬 스토리지에 사용자 정보 저장을 위한 키
const USER_KEY = 'chgolf_current_user';
const ADMIN_ID = 'admin';
const ADMIN_PW = '132400admin';

/**
 * 로그인 함수
 * @param {string} nameOrId - 이름 또는 아이디
 * @param {string} phoneOrPw - 전화번호 뒷 4자리 또는 비밀번호
 * @returns {Promise<{success: boolean, user?: Object, message?: string}>}
 */
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
    
    const data = await response.json();
    const members = data.members || [];
    
    // 사용자 찾기 (성함과 전화번호 뒷 4자리로 확인)
    const user = members.find(member => 
      member.name === nameOrId && 
      member.phone && member.phone.slice(-4) === phoneOrPw
    );
    
    if (!user) {
      return { success: false, message: '사용자 정보가 일치하지 않습니다.' };
    }
    
    // 사용자 정보를 로컬 스토리지에 저장
    const userData = {
      id: user.name, // 고유 ID가 없으므로 이름을 ID로 사용
      name: user.name,
      cohort: user.cohort, // 기수 정보
      phone: user.phone,
      gender: user.gender,
      isAdmin: false
    };
    
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    return { success: true, user: userData };
  } catch (error) {
    console.error('로그인 오류:', error);
    return { success: false, message: '로그인 처리 중 오류가 발생했습니다.' };
  }
}

/**
 * 로그아웃 함수
 */
function logout() {
  localStorage.removeItem(USER_KEY);
  updateAuthUI(); // UI 상태 업데이트
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 * @returns {Object|null} - 사용자 정보 객체 또는 null
 */
function getCurrentUser() {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) {
    return null;
  }
  return JSON.parse(userJson);
}

/**
 * 로그인 상태에 따라 UI 업데이트
 */
function updateAuthUI() {
  const user = getCurrentUser();
  
  // 로그인 버튼과 사용자 정보 영역
  const loginBtn = document.getElementById('login-btn');
  const userInfo = document.getElementById('user-info');
  const userName = document.getElementById('user-name');
  
  // 마이페이지 메뉴
  const myPageLink = document.getElementById('nav-mypage');
  
  // 관리자 전용 메뉴
  const adminOnlyMenus = document.querySelectorAll('.admin-only');
  
  if (user) {
    // 로그인 상태
    if (loginBtn) loginBtn.style.display = 'none';
    if (userInfo) {
      userInfo.style.display = 'flex';
      if (userName) userName.textContent = user.name;
    }
    
    // 마이페이지 활성화
    if (myPageLink) myPageLink.parentElement.style.display = 'block';
    
    // 관리자 메뉴는 관리자만 표시
    if (user.isAdmin) {
      adminOnlyMenus.forEach(menu => menu.style.display = 'block');
    } else {
      adminOnlyMenus.forEach(menu => menu.style.display = 'none');
    }
  } else {
    // 로그아웃 상태
    if (loginBtn) loginBtn.style.display = 'block';
    if (userInfo) userInfo.style.display = 'none';
    
    // 마이페이지 비활성화 (옵션)
    // if (myPageLink) myPageLink.parentElement.style.display = 'none';
    
    // 관리자 메뉴 숨김
    adminOnlyMenus.forEach(menu => menu.style.display = 'none');
  }
}

/**
 * 인증 상태 확인 및 페이지 접근 제어
 * @param {boolean} requireAdmin - 관리자 권한 요구 여부
 * @returns {boolean} - 접근 가능 여부
 */
function checkAuth(requireAdmin = false) {
  const user = getCurrentUser();
  
  // 로그인이 필요한 페이지인데 로그인되지 않은 경우
  if (!user && (requireAdmin || window.location.pathname.includes('/mypage.html'))) {
    window.location.href = 'index.html';
    return false;
  }
  
  // 관리자 페이지에 일반 사용자가 접근하는 경우
  if (requireAdmin && !user.isAdmin) {
    window.location.href = 'mypage.html';
    return false;
  }
  
  return true;
}

/**
 * 로그인 모달 열기
 */
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.style.display = 'block';
  }
}

/**
 * 로그인 모달 닫기
 */
function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// 문서가 로드되면 인증 UI 업데이트
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
  
  // 로그인 버튼 클릭 이벤트
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }
  
  // 로그아웃 버튼 클릭 이벤트
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
  
  // 모달 닫기 버튼 이벤트
  const closeModalBtn = document.querySelector('.close-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeLoginModal);
  }
  
  // 로그인 모달 외부 클릭 시 닫기
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    window.addEventListener('click', function(e) {
      if (e.target === loginModal) {
        closeLoginModal();
      }
    });
  }
  
  // 로그인 폼 제출 이벤트
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('login-name');
      const phoneInput = document.getElementById('login-phone');
      
      if (!nameInput || !phoneInput) return;
      
      const result = await login(nameInput.value, phoneInput.value);
      
      if (result.success) {
        closeLoginModal();
        updateAuthUI();
        
        // 필요한 경우 페이지 리디렉션
        if (result.user.isAdmin) {
          window.location.href = 'admin.html';
        }
      } else {
        alert(result.message || '로그인에 실패했습니다.');
      }
    });
  }
});
