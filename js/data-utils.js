// 데이터 관리 유틸리티 함수

// 회원 데이터 로드
async function loadMembers() {
    try {
      const response = await fetch('data/members.json');
      if (response.ok) {
        const data = await response.json();
        return data.members;
      } else {
        console.error('회원 데이터 로드 실패');
        return [];
      }
    } catch (error) {
      console.error('회원 데이터 로드 중 오류 발생:', error);
      return [];
    }
  }
  
  // 신청자 데이터 로드
  async function loadApplications() {
    try {
      const response = await fetch('data/applications.json');
      if (response.ok) {
        const data = await response.json();
        return {
          event: data.event,
          applications: data.applications
        };
      } else {
        console.error('신청자 데이터 로드 실패');
        return { event: {}, applications: [] };
      }
    } catch (error) {
      console.error('신청자 데이터 로드 중 오류 발생:', error);
      return { event: {}, applications: [] };
    }
  }
  
  // 연도별 스코어 데이터 로드
  async function loadScores(year) {
    try {
      const response = await fetch(`data/scores_${year}.json`);
      if (response.ok) {
        return await response.json();
      } else {
        console.error(`${year}년 스코어 데이터 로드 실패`);
        return null;
      }
    } catch (error) {
      console.error(`${year}년 스코어 데이터 로드 중 오류 발생:`, error);
      return null;
    }
  }
  
  // 모든 연도의 스코어 데이터 로드
  async function loadAllScores() {
    const years = [2020, 2021, 2022, 2023, 2024];
    const allScores = {};
    
    for (const year of years) {
      const yearData = await loadScores(year);
      if (yearData) {
        allScores[year] = yearData;
      }
    }
    
    return allScores;
  }
  
  // 회원별 통합 데이터 생성
  async function generateMemberStats() {
    const allScores = await loadAllScores();
    const members = await loadMembers();
    
    // 회원 목록에 통계 데이터 추가
    const memberStats = members.map(member => {
      const stats = {
        ...member,
        years: {},
        overallBestScore: null,
        currentHandicap: null,
        averageScore: null,
        attendanceRate: 0
      };
      
      let totalScores = 0;
      let scoreCount = 0;
      let eventCount = 0;
      let attendanceCount = 0;
      
      // 각 연도별 데이터 처리
      Object.entries(allScores).forEach(([year, yearData]) => {
        const memberYearData = yearData.members.find(m => m.name === member.name);
        
        if (memberYearData) {
          stats.years[year] = {
            scores: memberYearData.score || {},
            bestScore: memberYearData.best_score,
            handicap: memberYearData.handicap
          };
          
          // 점수가 기록된 경우만 통계에 포함
          if (memberYearData.best_score) {
            if (!stats.overallBestScore || memberYearData.best_score < stats.overallBestScore) {
              stats.overallBestScore = memberYearData.best_score;
            }
            
            // 가장 최근 핸디캡 업데이트
            if (memberYearData.handicap) {
              stats.currentHandicap = memberYearData.handicap;
            }
          }
          
          // 참석률 계산을 위한 데이터 수집
          const months = Object.keys(memberYearData.score || {});
          attendanceCount += months.length;
          
          // 평균 스코어 계산을 위한 데이터 수집
          months.forEach(month => {
            const score = memberYearData.score[month];
            if (score) {
              totalScores += score;
              scoreCount++;
            }
          });
        }
        
        // 해당 연도 이벤트 수 카운트 (간소화: 각 연도 10개 이벤트로 가정)
        eventCount += 10;
      });
      
      // 통계 계산
      if (scoreCount > 0) {
        stats.averageScore = Math.round(totalScores / scoreCount * 10) / 10;
      }
      
      if (eventCount > 0) {
        stats.attendanceRate = Math.round(attendanceCount / eventCount * 1000) / 10;
      }
      
      return stats;
    });
    
    return memberStats;
  }
  
  // 핸디캡 기준 회원 정렬
  function sortMembersByHandicap(members) {
    return [...members].sort((a, b) => {
      // 핸디캡이 없는 회원은 뒤로
      if (a.currentHandicap === null) return 1;
      if (b.currentHandicap === null) return -1;
      
      // 핸디캡 오름차순
      return a.currentHandicap - b.currentHandicap;
    });
  }
  
  // 가능한 조편성 생성
  function generatePairings(applications, groupSize = 4) {
    // 신청자 목록이 비어있으면 빈 배열 반환
    if (!applications || applications.length === 0) {
      return [];
    }
    
    // 확정된 신청자만 필터링
    const confirmedApplications = applications.filter(app => app.confirmed);
    
    // 핸디캡 순으로 정렬
    const sortedApplications = [...confirmedApplications].sort((a, b) => a.handicap - b.handicap);
    
    // 그룹으로 나누기
    const groups = [];
    for (let i = 0; i < sortedApplications.length; i += groupSize) {
      const group = sortedApplications.slice(i, i + groupSize);
      groups.push(group);
    }
    
    return groups;
  }
  
  // 날짜 포맷팅 함수
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
  }