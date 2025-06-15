<template>
  <section class="dashboard-container chart-container">
    <h3>등급별 인원 현황</h3>

    <div class="chart-wrapper">
      <canvas ref="chartRef"></canvas>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref, defineProps } from "vue";
import { Chart, registerables } from "chart.js";
// grade.js에서 등급 계산 함수와 등급 정보를 가져옵니다.
import { getUserGrade, grades } from "../utils/grade.js";
Chart.register(...registerables);

const props = defineProps({ users: Array });
let chartInstance = null;
const chartRef = ref(null);

function getGradeCounts(users) {
  // grades 객체를 기반으로 초기 카운트 객체를 생성합니다.
  const counts = Object.fromEntries(
    Object.values(grades).map((g) => [g.name, 0])
  );

  users.forEach((user) => {
    // 중앙 관리되는 함수를 사용합니다.
    const grade = getUserGrade(user.participationCount);
    if (grade) {
      counts[grade.name]++;
    }
  });
  return counts;
}

function renderChart() {
  if (chartInstance) chartInstance.destroy();
  // 'chartRef.value'가 null이 아닐 때만 차트를 렌더링하도록 방어 코드를 추가합니다.
  if (!chartRef.value) return;
  const ctx = chartRef.value.getContext("2d");
  const gradeCounts = getGradeCounts(props.users);
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(gradeCounts),
      datasets: [
        {
          label: "등급별 인원",
          data: Object.values(gradeCounts),
          backgroundColor: [
            "rgba(255, 206, 86, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 99, 132, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderColor: [
            "rgba(255, 206, 86, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      // maintainAspectRatio: false 옵션이 중요합니다.
      // 이 옵션이 true이면 캔버스가 부모의 크기를 무시하고 자체 비율을 유지하려고 합니다.
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

onMounted(() => {
  renderChart();
});

watch(
  () => props.users,
  () => {
    renderChart();
  },
  { deep: true } // 데이터 변경을 확실히 감지하기 위해 deep 옵션 추가
);

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  flex-grow: 1; /* 이 속성이 핵심입니다. 남는 공간을 모두 차지하게 합니다. */
  min-height: 0; /* flex-grow가 제대로 작동하기 위해 필요할 수 있습니다. */
}
</style>
