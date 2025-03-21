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
// admin.js (계속)
              <th>날짜</th>
              <th>코스</th>
              <th>스코어</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  // 최근 스코어 정렬
  const recentScores = [...memberScores]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  if (recentScores.length === 0) {
    modalContent += '<tr><td colspan="4">기록된 스코어가 없습니다.</td></tr>';
  } else {
    recentScores.forEach(score => {
      modalContent += `
        <tr>
          <td>${formatDate(score.date)}</td>
          <td>${score.course}</td>
          <td>${score.totalScore}</td>
          <td>
            <button class="btn btn-sm" onclick="showScoreDetails('${score.id}')">
              상세
            </button>
          </td>
        </tr>
      `;
    });
  }
  
  modalContent += `
          </tbody>
        </table>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `;
  
  // 모달 표시
  showModal(modalContent);
}

// 스코어 상세 정보 표시
function showScoreDetails(scoreId) {
  const { scores } = window.adminData;
  
  // 스코어 정보 찾기
  const score = scores.find(s => s.id === scoreId);
  if (!score) {
    alert('스코어 정보를 찾을 수 없습니다.');
    return;
  }
  
  // 모달 내용 생성
  const modalContent = `
    <div class="score-details">
      <h2>스코어 상세 정보</h2>
      
      <div class="details-section">
        <h3>기본 정보</h3>
        <p><strong>날짜:</strong> ${formatDate(score.date)}</p>
        <p><strong>코스:</strong> ${score.course}</p>
        <p><strong>총 스코어:</strong> ${score.totalScore}</p>
      </div>
      
      <div class="details-section">
        <h3>세부 스코어</h3>
        <p><strong>전반:</strong> ${score.details.front9}</p>
        <p><strong>후반:</strong> ${score.details.back9}</p>
        <p><strong>퍼팅:</strong> ${score.details.putts}</p>
        <p><strong>페어웨이 안착:</strong> ${score.details.fairways}/18</p>
        <p><strong>그린 적중:</strong> ${score.details.greens}/18</p>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `;
  
  // 모달 표시
  showModal(modalContent);
}

// 통계 대시보드 표시
function showStatsDashboard() {
  const { members, scores, attendances } = window.adminData;
  
  // 평균 스코어 계산
  const avgScore = scores.length > 0
    ? (scores.reduce((sum, score) => sum + score.totalScore, 0) / scores.length).toFixed(1)
    : '-';
  
  // 기수별 평균 스코어
  const classSummary = {};
  
  members.forEach(member => {
    const memberScores = scores.filter(score => score.userId === member.id);
    
    if (memberScores.length > 0) {
      const memberAvg = memberScores.reduce((sum, score) => sum + score.totalScore, 0) / memberScores.length;
      
      if (!classSummary[member.class]) {
        classSummary[member.class] = {
          count: 0,
          totalScore: 0
        };
      }
      
      classSummary[member.class].count++;
      classSummary[member.class].totalScore += memberAvg;
    }
  });
  
  // 클래스별 평균 계산
  Object.keys(classSummary).forEach(classKey => {
    const classData = classSummary[classKey];
    classData.average = (classData.totalScore / classData.count).toFixed(1);
  });
  
  // 참석률 계산
  const attendanceRates = {};
  
  attendances.forEach(event => {
    const year = new Date(event.date).getFullYear();
    
    if (!attendanceRates[year]) {
      attendanceRates[year] = {
        total: 0,
        attended: 0
      };
    }
    
    attendanceRates[year].total += members.length;
    attendanceRates[year].attended += event.attendees.length;
  });
  
  // 년도별 참석률 계산
  Object.keys(attendanceRates).forEach(year => {
    const yearData = attendanceRates[year];
    yearData.rate = (yearData.attended / yearData.total * 100).toFixed(1);
  });
  
  // 모달 내용 생성
  let modalContent = `
    <div class="stats-dashboard">
      <h2>전체 통계 대시보드</h2>
      
      <div class="details-section">
        <h3>개요</h3>
        <p><strong>총 회원수:</strong> ${members.length}명</p>
        <p><strong>총 라운드 수:</strong> ${scores.length}회</p>
        <p><strong>전체 평균 스코어:</strong> ${avgScore}</p>
      </div>
      
      <div class="details-section">
        <h3>기수별 평균 스코어</h3>
        <table class="stats-table">
          <thead>
            <tr>
              <th>기수</th>
              <th>평균 스코어</th>
              <th>회원 수</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  // 기수 정렬
  const sortedClasses = Object.keys(classSummary).sort((a, b) => a - b);
  
  sortedClasses.forEach(classKey => {
    const classData = classSummary[classKey];
    modalContent += `
      <tr>
        <td>${classKey}기</td>
        <td>${classData.average}</td>
        <td>${classData.count}명</td>
      </tr>
    `;
  });
  
  modalContent += `
          </tbody>
        </table>
      </div>
      
      <div class="details-section">
        <h3>년도별 참석률</h3>
        <table class="stats-table">
          <thead>
            <tr>
              <th>년도</th>
              <th>참석률</th>
              <th>이벤트 수</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  // 년도 정렬
  const sortedYears = Object.keys(attendanceRates).sort((a, b) => b - a);
  
  sortedYears.forEach(year => {
    const yearData = attendanceRates[year];
    const eventCount = attendances.filter(event => new Date(event.date).getFullYear().toString() === year).length;
    
    modalContent += `
      <tr>
        <td>${year}년</td>
        <td>${yearData.rate}%</td>
        <td>${eventCount}회</td>
      </tr>
    `;
  });
  
  modalContent += `
          </tbody>
        </table>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="closeModal()">닫기</button>
      </div>
    </div>
  `;
  
  // 모달 표시
  showModal(modalContent);
}

// 모달 표시 함수
function showModal(content) {
  // 기존 모달 제거
  closeModal();
  
  // 모달 컨테이너 생성
  const modal = document.createElement('div');
  modal.id = 'detail-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      ${content}
    </div>
  `;
  
  // 모달 추가
  document.body.appendChild(modal);
  
  // 모달 표시 (애니메이션을 위한 지연)
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// 모달 닫기 함수
function closeModal() {
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.classList.remove('show');
    
    // 애니메이션 완료 후 제거
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 전화번호 포맷팅
function formatPhone(phone) {
  // 전화번호가 이미 포맷팅되어 있는 경우
  if (phone.includes('-')) return phone;
  
  // 10자리 또는 11자리 전화번호 포맷팅
  if (phone.length === 10) {
    return `${phone.substring(0, 3)}-${phone.substring(3, 6)}-${phone.substring(6)}`;
  } else if (phone.length === 11) {
    return `${phone.substring(0, 3)}-${phone.substring(3, 7)}-${phone.substring(7)}`;
  }
  
  return phone;
}

// 날짜 포맷팅 함수
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
}
