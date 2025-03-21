// admin.js
document.addEventListener('DOMContentLoaded', async function() {
  // 관리자 인증 확인
  if (!checkAuth()) return;
  
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.isAdmin) {
    window.location.href = 'index.html';
    return;
  }
  
  try {
    // 모든 데이터 로드
    const [members, scores, attendances] = await Promise.all([
      fetch('data/members.json').then(res => res.json()),
      fetch('data/scores.json').then(res => res.json()),
      fetch('data/attendances.json').then(res => res.json())
    ]);
    
    // 데이터 메모리에 저장
    window.adminData = {
      members,
      scores,
      attendances
    };
    
    // 회원 목록 렌더링
    renderMembersList(members);
    
    // 검색 이벤트 리스너
    const searchInput = document.getElementById('member-search');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredMembers = members.filter(member => 
          member.name.toLowerCase().includes(searchTerm) || 
          member.id.toLowerCase().includes(searchTerm) ||
          member.class.toString().includes(searchTerm)
        );
        renderMembersList(filteredMembers);
      });
    }
    
    // 필터링 이벤트 리스너
    const classFilter = document.getElementById('class-filter');
    if (classFilter) {
      // 기수 옵션 추가
      const classes = [...new Set(members.map(member => member.class))].sort();
      
      let options = '<option value="">전체 기수</option>';
      classes.forEach(cls => {
        options += `<option value="${cls}">${cls}기</option>`;
      });
      
      classFilter.innerHTML = options;
      
      classFilter.addEventListener('change', function() {
        const selectedClass = this.value;
        const searchTerm = document.getElementById('member-search').value.toLowerCase();
        
        let filteredMembers = members;
        
        if (selectedClass) {
          filteredMembers = filteredMembers.filter(member => 
            member.class.toString() === selectedClass
          );
        }
        
        if (searchTerm) {
          filteredMembers = filteredMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) || 
            member.id.toLowerCase().includes(searchTerm)
          );
        }
        
        renderMembersList(filteredMembers);
      });
    }
    
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    alert('데이터를 불러오는 중 오류가 발생했습니다.');
  }
});

// 회원 목록 렌더링
function renderMembersList(members) {
  const memberListElement = document.getElementById('members-list');
  if (!memberListElement) return;
  
  if (members.length === 0) {
    memberListElement.innerHTML = '<p>검색 결과가 없습니다.</p>';
    return;
  }
  
  let html = `
    <table class="members-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>기수</th>
          <th>가입년도</th>
          <th>연락처</th>
          <th>상세</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  members.forEach(member => {
    html += `
      <tr>
        <td>${member.name}</td>
        <td>${member.class}기</td>
        <td>${member.joinYear}</td>
        <td>${formatPhone(member.phone)}</td>
        <td>
          <button class="btn btn-sm" onclick="showMemberDetails('${member.id}')">
            상세보기
          </button>
        </td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  memberListElement.innerHTML = html;
}

// 회원 상세 정보 표시
function showMemberDetails(memberId) {
  const { members, scores, attendances } = window.adminData;
  
  // 회원 정보 찾기
  const member = members.find(m => m.id === memberId);
  if (!member) {
    alert('회원 정보를 찾을 수 없습니다.');
    return;
  }
  
  // 회원의 스코어 데이터
  const memberScores = scores.filter(score => score.userId === memberId);
  
  // 스코어 평균 계산
  const avgScore = memberScores.length > 0 
    ? (memberScores.reduce((sum, score) => sum + score.totalScore, 0) / memberScores.length).toFixed(1)
    : '-';
  
  // 베스트 스코어
  const bestScore = memberScores.length > 0
    ? memberScores.reduce((min, score) => score.totalScore < min ? score.totalScore : min, Infinity)
    : '-';
  
  // 참석 현황
  const memberAttendances = attendances.filter(event => 
    event.attendees.includes(memberId)
  );
  
  // 참석률 계산
  const attendanceRate = attendances.length > 0
    ? ((memberAttendances.length / attendances.length) * 100).toFixed(1)
    : 0;
  
  // 모달 내용 생성
  const modalContent = `
    <div class="member-details">
      <h2>${member.name} 회원 정보</h2>
      
      <div class="details-section">
        <h3>기본 정보</h3>
        <p><strong>기수:</strong> ${member.class}기</p>
        <p><strong>가입년도:</strong> ${member.joinYear}년</p>
        <p><strong>연락처:</strong> ${formatPhone(member.phone)}</p>
      </div>
      
      <div class="details-section">
        <h3>스코어 통계</h3>
        <p><strong>평균 스코어:</strong> ${avgScore}</p>
        <p><strong>베스트 스코어:</strong> ${bestScore}</p>
        <p><strong>기록된 라운드:</strong> ${memberScores.length}회</p>
      </div>
      
      <div class="details-section">
        <h3>참석 현황</h3>
        <p><strong>참석률:</strong> ${attendanceRate}% (${memberAttendances.length}/${attendances.length})</p>
      </div>
      
      <h3>최근 스코어</h3>
      <div class="recent-scores">
        <table class="scores-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th>코스</th>
              <th>스코어</th
