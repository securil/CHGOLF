// 신청자 명단 자바스크립트

document.addEventListener('DOMContentLoaded', async function() {
    // 이벤트 정보 로드
    try {
      const applicationData = await loadApplications();
      const event = applicationData.event;
      let applications = applicationData.applications;
      
      // 로컬 스토리지에서 추가된 신청자가 있는지 확인
      const localApplications = localStorage.getItem('applications');
      if (localApplications) {
        const parsedLocalApps = JSON.parse(localApplications);
        applications = [...applications, ...parsedLocalApps];
      }
      
      if (event) {
        // 이벤트 정보 업데이트
        document.getElementById('event-date').textContent = formatDate(event.date);
        document.getElementById('event-location').textContent = event.location;
        document.getElementById('event-deadline').textContent = formatDate(event.registrationDeadline);
      }
      
      // 신청자 수 통계
      const confirmedCount = applications.filter(app => app.confirmed).length;
      document.getElementById('confirmed-count').textContent = confirmedCount;
      document.getElementById('total-count').textContent = applications.length;
      
      // 신청자 목록 표시
      displayApplications(applications);
    } catch (error) {
      console.error('신청자 데이터 로드 중 오류 발생:', error);
      document.getElementById('applications-tbody').innerHTML = 
        '<tr><td colspan="7" class="text-center">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
  });
  
  // 신청자 목록 표시 함수
  function displayApplications(applications) {
    const tbody = document.getElementById('applications-tbody');
    
    if (!applications || applications.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">신청자가 없습니다.</td></tr>';
      return;
    }
    
    // 신청일 기준 역순 정렬 (최신순)
    applications.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    
    // 테이블 내용 생성
    tbody.innerHTML = '';
    applications.forEach((app, index) => {
      const row = document.createElement('tr');
      
      // 상태에 따른 스타일 적용
      if (app.confirmed) {
        row.classList.add('table-success');
      }
      
      // 행 내용 추가
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${app.memberName || app.name}</td>
        <td>${app.handicap}</td>
        <td>${app.carType}</td>
        <td>${app.preferredGroup || '-'}</td>
        <td>${formatDate(app.registrationDate)}</td>
        <td>${app.confirmed ? '<span class="text-success">확정</span>' : '<span class="text-muted">대기</span>'}</td>
      `;
      
      tbody.appendChild(row);
    });
  }