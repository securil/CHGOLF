// chart.js - Chart.js 기반 공통 차트 생성 유틸

// 공통 차트 옵션 (폰트, 라벨 등 기본 설정)
Chart.defaults.font.family = "'Noto Sans KR', sans-serif";
Chart.defaults.font.size = 14;
Chart.defaults.color = '#333';

// 라인 차트 생성 함수
function createLineChart(ctx, label, labels, data, color, title) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: `${color}33`, // 투명도 포함
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: label
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: title
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${label}: ${context.raw}`;
            }
          }
        }
      }
    }
  });
}

// 막대 차트 생성 함수
function createBarChart(ctx, label, labels, data, color, title) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        backgroundColor: color,
        borderColor: color,
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
            text: label
          }
        },
        x: {
          title: {
            display: true,
            text: '항목'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: title
        }
      }
    }
  });
}
