// 통계 페이지 자바스크립트

// 차트 객체 저장 변수
let yearlyScoreChart = null;
let yearlyHandicapChart = null;
let attendanceChart = null;

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // 모든 연도의 스코어 데이터 로드
    const allScores = await loadAllScores();
    
    // 주요 통계 계산 및 표시
    calculateAndDisplayStats(allScores);
    
    // 핸디캡 순위 표시
    displayHandicapRanking(allScores);
    
    // 출석률 순위 표시
    displayAttendanceRanking(allScores);
    
    // 연도별 차트 생성
    createYearlyCharts(allScores);
    
    // 탭 버튼 이벤트 리스너
    setupTabButtons();
  } catch (error) {
    console.error('데이터 로드 중 오류 발생:', error);
  }
});

// 주요 통계 계산 및 표시
function calculateAndDisplayStats(allScores) {
  // 모든 활성 회원 수집
  const activeMembers = new Set();
  let totalHandicap = 0;
  let handicapCount = 0;
  let totalScore = 0;
  let scoreCount = 0;
  
  // 최신 연도 찾기
  const years = Object.keys(allScores).map(Number).sort((a, b) => b - a);
  const latestYear = years[0].toString();
  const latestYearData = allScores[latestYear];
  
  // 각 연도별 데이터 처리
  for (const year in allScores) {
    allScores[year].members.forEach(member => {
      // 스코어가 있는 회원만 활성 회원으로 간주
      if (Object.keys(member.score).length > 0) {
        activeMembers.add(member.name);
        
        // 핸디캡 집계
        if (member.handicap !== null) {
          totalHandicap += member.handicap;
          handicapCount++;
        }
        
        // 최신 연도의 스코어만 집계
        if (year === latestYear) {
          for (const month in member.score) {
            totalScore += member.score[month];
            scoreCount++;
          }
        }
      }
    });
  }
  
  // 평균 계산
  const avgHandicap = handicapCount > 0 ? (totalHandicap / handicapCount).toFixed(1) : '-';
  const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : '-';
  
  // 통계 표시
  document.getElementById('total-members').textContent = activeMembers.size;
  document.getElementById('avg-handicap').textContent = avgHandicap;
  document.getElementById('avg-score').textContent = avgScore;
}

// 핸디캡 순위 표시
function displayHandicapRanking(allScores) {
  // 최신 연도 찾기
  const years = Object.keys(allScores).map(Number).sort((a, b) => b - a);
  const latestYear = years[0].toString();
  
  // 회원 및 핸디캡 데이터 수집
  const members = [];
  for (const year in allScores) {
    allScores[year].members.forEach(member => {
      if (member.handicap !== null) {
        // 기존 회원 찾기
        const existingMember = members.find(m => m.name === member.name);
        
        if (existingMember) {
          // 더 최신 연도의 데이터인 경우 업데이트
          if (parseInt(year) > parseInt(existingMember.year)) {
            existingMember.handicap = member.handicap;
            existingMember.bestScore = member.best_score;
            existingMember.year = year;
          }
        } else {
          // 새 회원 추가
          members.push({
            name: member.name,
            handicap: member.handicap,
            bestScore: member.best_score,
            year: year
          });
        }
      }
    });
  }
  
  // 핸디캡 오름차순으로 정렬
  members.sort((a, b) => a.handicap - b.handicap);
  
  // 순위 표시 (최대 10명)
  const tbody = document.getElementById('handicap-tbody');
  tbody.innerHTML = '';
  
  if (members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">데이터가 없습니다.</td></tr>';
    return;
  }
  
  const topMembers = members.slice(0, 10);
  topMembers.forEach((member, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${member.name}</td>
      <td>${member.handicap}</td>
      <td>${member.bestScore || '-'}</td>
    `;
    tbody.appendChild(row);
  });
}

// 출석률 순위 표시
function displayAttendanceRanking(allScores) {
  // 회원별 출석 데이터 수집
  const memberAttendance = {};
  
  // 각 연도별 데이터 처리
  for (const year in allScores) {
    allScores[year].members.forEach(member => {
      const attendanceCount = Object.keys(member.score).length;
      
      if (!memberAttendance[member.name]) {
        memberAttendance[member.name] = {
          name: member.name,
          attendance: 0,
          years: new Set()
        };
      }
      
      memberAttendance[member.name].attendance += attendanceCount;
      
      // 활동 연도 기록
      if (attendanceCount > 0) {
        memberAttendance[member.name].years.add(year);
      }
    });
  }
  
  // 출석률 계산 및 정렬
  const members = Object.values(memberAttendance).map(member => {
    // 간소화: 각 연도별 12번의 이벤트가 있다고 가정
    const totalEvents = member.years.size * 12;
    const rate = totalEvents > 0 ? (member.attendance / totalEvents) * 100 : 0;
    
    return {
      ...member,
      totalEvents,
      rate: Math.round(rate)
    };
  });
  
  // 출석률 기준 정렬
  members.sort((a, b) => b.rate - a.rate);
  
  // 순위 표시 (최대 10명)
  const tbody = document.getElementById('attendance-rate-tbody');
  tbody.innerHTML = '';
  
  if (members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">데이터가 없습니다.</td></tr>';
    return;
  }
  
  // 최소 1회 이상 참석한 회원만 필터링
  const activeMembers = members.filter(member => member.attendance > 0);
  const topMembers = activeMembers.slice(0, 10);
  
  topMembers.forEach((member, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${member.name}</td>
      <td>${member.attendance}회</td>
      <td>${member.rate}%</td>
    `;
    tbody.appendChild(row);
  });
}

// 연도별 차트 생성
function createYearlyCharts(allScores) {
  // 연도별 평균 스코어
  createYearlyScoreChart(allScores);
  
  // 연도별 평균 핸디캡
  createYearlyHandicapChart(allScores);
  
  // 월별 참가자 수
  createAttendanceChart(allScores);
}

// 연도별 평균 스코어 차트
function createYearlyScoreChart(allScores) {
  // 연도별 평균 스코어 계산
  const yearlyData = [];
  
  for (const year in allScores) {
    let totalScore = 0;
    let count = 0;
    
    allScores[year].members.forEach(member => {
      for (const month in member.score) {
        totalScore += member.score[month];
        count++;
      }
    });
    
    const avgScore = count > 0 ? totalScore / count : 0;
    yearlyData.push({ year, avgScore });
  }
  
  // 연도순 정렬
  yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  
  // 차트 데이터 준비
  const years = yearlyData.map(item => item.year);
  const scores = yearlyData.map(item => item.avgScore.toFixed(1));
  
  // 차트 생성
  const ctx = document.getElementById('yearly-score-chart').getContext('2d');
  
  if (yearlyScoreChart) {
    yearlyScoreChart.destroy();
  }
  
  yearlyScoreChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: '평균 스코어',
        data: scores,
        backgroundColor: 'rgba(26, 58, 110, 0.7)',
        borderColor: 'rgba(26, 58, 110, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: '평균 스코어'
          }
        },
        x: {
          title: {
            display: true,
            text: '연도'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '연도별 평균 스코어'
        }
      }
    }
  });
}

// 연도별 평균 핸디캡 차트
function createYearlyHandicapChart(allScores) {
  // 연도별 평균 핸디캡 계산
  const yearlyData = [];
  
  for (const year in allScores) {
    let totalHandicap = 0;
    let count = 0;
    
    allScores[year].members.forEach(member => {
      if (member.handicap !== null) {
        totalHandicap += member.handicap;
        count++;
      }
    });
    
    const avgHandicap = count > 0 ? totalHandicap / count : 0;
    yearlyData.push({ year, avgHandicap });
  }
  
  // 연도순 정렬
  yearlyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  
  // 차트 데이터 준비
  const years = yearlyData.map(item => item.year);
  const handicaps = yearlyData.map(item => item.avgHandicap.toFixed(1));
  
  // 차트 생성
  const ctx = document.getElementById('yearly-handicap-chart').getContext('2d');
  
  if (yearlyHandicapChart) {
    yearlyHandicapChart.destroy();
  }
  
  yearlyHandicapChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: '평균 핸디캡',
        data: handicaps,
        backgroundColor: 'rgba(212, 175, 55, 0.7)',
        borderColor: 'rgba(212, 175, 55, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: '평균 핸디캡'
          }
        },
        x: {
          title: {
            display: true,
            text: '연도'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '연도별 평균 핸디캡'
        }
      }
    }
  });
}

// 월별 참가자 수 차트
function createAttendanceChart(allScores) {
  // 최신 연도의 월별 참가자 수 계산
  const years = Object.keys(allScores).map(Number).sort((a, b) => b - a);
  const latestYear = years[0].toString();
  
  // 월별 데이터 초기화
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const monthlyAttendance = Array(12).fill(0);
  
  // 모든 연도의 월별 참가자 수 집계
  for (const year in allScores) {
    allScores[year].members.forEach(member => {
      for (const month in member.score) {
        const monthIdx = months.indexOf(month);
        if (monthIdx !== -1) {
          monthlyAttendance[monthIdx]++;
        }
      }
    });
  }
  
  // 차트 생성
  const ctx = document.getElementById('attendance-chart').getContext('2d');
  
  if (attendanceChart) {
    attendanceChart.destroy();
  }
  
  attendanceChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: '참가자 수',
        data: monthlyAttendance,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '참가자 수'
          }
        },
        x: {
          title: {
            display: true,
            text: '월'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '월별 참가자 수 (전체 기간)'
        }
      }
    }
  });
}

// 탭 버튼 설정
function setupTabButtons() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // 모든 버튼에서 active 클래스 제거
      tabButtons.forEach(btn => btn.classList.remove('active'));
      
      // 현재 버튼에 active 클래스 추가
      this.classList.add('active');
      
      // 모든 탭 패널 숨기기
      tabPanes.forEach(pane => pane.classList.remove('active'));
      
      // 선택된 탭 패널 표시
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}