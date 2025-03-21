// 참가 신청 폼 자바스크립트

document.addEventListener('DOMContentLoaded', async function() {
    // 이벤트 정보 로드
    try {
      const applicationData = await loadApplications();
      const event = applicationData.event;
      
      if (event) {
        // 이벤트 정보 업데이트
        document.getElementById('event-date').textContent = formatDate(event.date);
        document.getElementById('event-location').textContent = event.location;
        document.getElementById('event-time').textContent = event.startTime;
        document.getElementById('event-deadline').textContent = formatDate(event.registrationDeadline);
        document.getElementById('event-current').textContent = event.currentParticipants;
        document.getElementById('event-max').textContent = event.maxParticipants;
        
        if (event.notes) {
          document.getElementById('event-notes').textContent = event.notes;
        }
      }
    } catch (error) {
      console.error('이벤트 정보 로드 중 오류 발생:', error);
    }
    
    // 폼 제출 이벤트 핸들러
    const form = document.getElementById('application-form');
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // 폼 데이터 수집
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        handicap: parseInt(document.getElementById('handicap').value),
        carType: document.getElementById('car-type').value,
        preferredGroup: document.getElementById('preferred-group').value,
        notes: document.getElementById('notes').value,
        registrationDate: new Date().toISOString().split('T')[0]
      };
      
      // [주의] 실제로는 여기서 서버로 데이터를 전송해야 하지만
      // GitHub Pages 정적 웹사이트에서는 백엔드 서버가 없으므로
      // 로컬 스토리지에 임시 저장하는 방식으로 구현
      saveApplication(formData);
      
      // 신청 완료 알림
      alert('신청이 완료되었습니다! 신청자 명단 페이지에서 확인할 수 있습니다.');
      
      // 폼 초기화
      form.reset();
    });
  });
  
  // 임시 데이터 저장 함수
  function saveApplication(application) {
    try {
      // 로컬 스토리지에서 기존 신청 데이터 가져오기
      let applications = localStorage.getItem('applications');
      
      if (applications) {
        applications = JSON.parse(applications);
      } else {
        applications = [];
      }
      
      // 새 신청 추가
      application.id = applications.length + 1;
      application.confirmed = false;
      applications.push(application);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('applications', JSON.stringify(applications));
      
      console.log('신청 데이터 저장됨:', application);
      return true;
    } catch (error) {
      console.error('신청 데이터 저장 중 오류 발생:', error);
      return false;
    }
  }