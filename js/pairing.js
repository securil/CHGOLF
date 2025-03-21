// 조편성 자바스크립트

document.addEventListener('DOMContentLoaded', async function() {
    try {
      // 이벤트 및 신청자 데이터 로드
      const applicationData = await loadApplications();
      const event = applicationData.event;
      let applications = applicationData.applications;
      
      // 로컬 스토리지에서 추가된 신청자가 있는지 확인
      const localApplications = localStorage.getItem('applications');
      if (localApplications) {
        const parsedLocalApps = JSON.parse(localApplications);
        applications = [...applications, ...parsedLocalApps];
      }
      
      // 참가 확정된 신청자만 필터링
      const confirmedApplications = applications.filter(app => app.confirmed);
      
      // 이벤트 정보 업데이트
      if (event) {
        document.getElementById('event-date').textContent = formatDate(event.date);
        document.getElementById('event-location').textContent = event.location;
        document.getElementById('event-time').textContent = event.startTime;
      }
      
      // 참가자 수 표시
      document.getElementById('participant-count').textContent = confirmedApplications.length;
      
      // 조편성 생성 및 표시
      const pairings = generatePairings(confirmedApplications);
      displayPairings(pairings);
    } catch (error) {
      console.error('조편성 데이터 로드 중 오류 발생:', error);
      document.getElementById('pairings-container').innerHTML = 
        '<div class="text-center"><p>데이터를 불러오는 중 오류가 발생했습니다.</p></div>';
    }
  });
  
  // 조편성 결과 표시 함수
  function displayPairings(pairings) {
    const container = document.getElementById('pairings-container');
    
    if (!pairings || pairings.length === 0) {
      container.innerHTML = '<div class="text-center"><p>아직 확정된 참가자가 없습니다.</p></div>';
      return;
    }
    
    container.innerHTML = '';
    
    // 각 조 정보 생성
    pairings.forEach((group, index) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'pairing-group';
      
      // 티오프 시간 계산 (07:00부터 10분 간격)
      const teeTime = new Date();
      teeTime.setHours(7, index * 10, 0);
      const teeTimeStr = teeTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      
      groupEl.innerHTML = `
        <div class="pairing-header">
          <h3>${index + 1}조 (${teeTimeStr} 티오프)</h3>
        </div>
        <div class="pairing-body">
          ${group.map(member => `
            <div class="pairing-member">
              <div class="row">
                <div class="col-6">
                  <strong>${member.memberName || member.name}</strong>
                </div>
                <div class="col-6 text-right">
                  핸디캡: <span class="pairing-handicap">${member.handicap}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      container.appendChild(groupEl);
    });
  }