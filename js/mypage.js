// 마이페이지 자바스크립트

// 차트 객체 저장 변수
let handicapChart = null;
let scoreChart = null;

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // 모든 연도의 스코어 데이터 로드
    const allScores = await loadAllScores();
    
    // 회원 목록 가져오기
    populateMemberList(allScores);
    
    // 회원 선택 이벤트 리스너
    document.getElementById('member-select').addEventListener('change', function() {
      const memberName = this.value;
      if (memberName) {
        displayMemberStats(memberName, allScores);
      } else {
        hideMemberStats();
      }
    });
  } catch (error) {
    console.error('데이터 로드 중 오류 발생:', error);
  }
});

// 회원 목록 채우기
function populateMemberList(allScores) {
  const memberSelect = document.getElementById('member-select');
  const members = new Set();
  
  // 모든 연도에서 회원 이름 수집
  for (const year in allScores) {
    allScores[year].members.forEach(member => {
      if (Object.keys(member.score).length > 0) {
        members.add(member.name);
      }
    });
  }
  
  // 알파벳 순으로 정렬
  const sortedMembers = Array.from(members).sort();
  
  // 회원 선택 목록 채우기
  memberSelect.innerHTML = '<option value="">회원을 선택하세요</option>';
  sortedMembers.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    memberSelect.appendChild(option);
  });
}

// 회원 통계 표시
function displayMemberStats(memberName, allScores) {
  // 해당 회원의 모든 스코어 데이터 추출
  const memberData = {
    years: {},
    scores: [],
    handicaps: [],
    attendances: []
  };
  
  // 각 연도별 데이터 수집
  for (const year in allScores) {
    const memberYearData = allScores[year].members.find(m => m.name === memberName);
    
    if (memberYearData && Object.keys(memberYearData.score).length > 0) {
      memberData.years[year] = {
        scores: memberYearData.score,
        bestScore: memberYearData.best_score,
        handicap: memberYearData.handicap
      };
      
      // 스코어 데이터 수집
      for (const month in memberYearData.score) {
        memberData.scores.push({
          date: `${year}년 ${month}`,
          score: memberYearData.score[month]
        });
      }
      
      // 핸디캡 데이터 수집
      if (memberYearData.handicap !== null) {
        memberData.handicaps.push({
          year: year,
          handicap: memberYearData.handicap
        });
      }
      
      // 출석 데이터 수집
      const attendances = Object.keys(memberYearData.score).map(month => {
        return {
          date: `${year}년 ${month}`,
          score: memberYearData.score[month]
        };
      });
      
      memberData.attendances = [...memberData.attendances, ...attendances];
    }
  }
  
  // 최신 날짜순으로 정렬
  memberData.scores.sort((a, b) => {
    const aDate = new Date(`${a.date.split('년')[0]}-${a.date.split('년')[1].trim()}-01`);
    const bDate = new Date(`${b.date.split('년')[0]}-${b.date.split('년')[1].trim()}-01`);
    return bDate - aDate;
  });
  
  memberData.handicaps.sort((a, b) => parseInt(b.year) - parseInt(a.year));
  
  memberData.attendances.sort((a, b) => {
    const aDate = new Date(`${a.date.split('년')[0]}-${a.date.split('년')[1].trim()}-01`);
    const bDate = new Date(`${b.date.split('년')[0]}-${b.date.split('년')[1].trim()}-01`);
    return bDate - aDate;
  });
  
  // 최신 핸디캡 및 최고 스코어
  const latestHandicap = memberData.handicaps.length > 0 ? memberData.handicaps[0].handicap : '-';
  
  // 최고 스코어 찾기
  let bestScore = Infinity;
  for (const year in memberData.years) {
    if (memberData.years[year].bestScore && memberData.years[year].bestScore < bestScore) {
      bestScore = memberData.years[year].bestScore;
    }
  }
  
  // 마지막 참석일
  const lastAttendance = memberData.attendances.length > 0 ? memberData.attendances[0].date : '-';
  
  // 참석률 계산 (간소화: 모든 연도에 12번의 이벤트가 있다고 가정)
  const yearsActive = Object.keys(memberData.years).length;
  const totalEvents = yearsActive * 12;
  const attendedEvents = memberData.attendances.length;
  const attendanceRate = totalEvents > 0 ? Math.round((attendedEvents / totalEvents) * 100) : 0;
  
  // 데이터 표시
  document.getElementById('member-name').textContent = memberName;
  document.getElementById('member-handicap').textContent = latestHandicap;
  document.getElementById('member-best-score').textContent = bestScore !== Infinity ? bestScore : '-';
  document.getElementById('member-last-attendance').textContent = lastAttendance;
  document.getElementById('member-attendance-rate').textContent = `${attendanceRate}%`;
  
  // 섹션 표시
  document.getElementById('profile-section').classList.remove('hidden');
  document.getElementById('score-section').classList.remove('hidden');
  document.getElementById('attendance-section').classList.remove('hidden');
  document.getElementById('empty-state').classList.add('hidden');
  
  // 핸디캡 차트 그리기
  createHandicapChart(memberData.handicaps);
  
  // 스코어 차트 그리기
  createScoreChart(memberData.scores);
  
  // 참가 기록 표 채우기
  createAttendanceTable(memberData.attendances);
}

// 회원 통계 숨기기
function hideMemberStats() {
  document.getElementById('profile-section').classList.add('hidden');
  document.getElementById('score-section').classList.add('hidden');
  document.getElementById('attendance-section').classList.add('hidden');
  document.getElementById('empty-state').classList.remove('hidden');
  
  // 차트 초기화
  if (handicapChart) {
    handicapChart.destroy();
    handicapChart = null;
  }
  
  if (scoreChart) {
    scoreChart.destroy();
    scoreChart = null;
  }
}

// 핸디캡 차트 생성
function createHandicapChart(handicapData) {
  // 기존 차트 제거
  if (handicapChart) {
    handicapChart.destroy();
  }
  
  // 차트 데이터 준비
  const years = handicapData.map(item => item.year);
  const handicaps = handicapData.map(item => item.handicap);
  
  const ctx = document.getElementById('handicap-chart').getContext('2d');
  handicapChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: '핸디캡',
        data: handicaps,
        borderColor: '#1a3a6e',
        backgroundColor: 'rgba(26, 58, 110, 0.2)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          reverse: true, // 핸디캡은 낮을수록 좋으므로 역순으로 표시
          title: {
            display: true,
            text: '핸디캡'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '연도별 핸디캡 추이'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `핸디캡: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

// 스코어 차트 생성
function createScoreChart(scoreData) {
  // 최근 10개 기록만 사용 (역순으로)
  const recentScores = scoreData.slice(0, 10).reverse();
  
  // 기존 차트 제거
  if (scoreChart) {
    scoreChart.destroy();
  }
  
  // 차트 데이터 준비
  const dates = recentScores.map(item => item.date);
  const scores = recentScores.map(item => item.score);
  
  const ctx = document.getElementById('score-chart').getContext('2d');
  scoreChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: '스코어',
        data: scores,
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: '스코어'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '최근 스코어 트렌드'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `스코어: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

// 참가 기록 테이블 생성
function createAttendanceTable(attendanceData) {
  const tbody = document.getElementById('attendance-tbody');
  tbody.innerHTML = '';
  
  if (attendanceData.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="4" class="text-center">참가 기록이 없습니다.</td>';
    tbody.appendChild(row);
    return;
  }
  
  // 최근 15개 기록만 표시
  const recentAttendances = attendanceData.slice(0, 15);
  
  recentAttendances.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.score}</td>
      <td>-</td>
      <td></td>
    `;
    tbody.appendChild(row);
  });
}