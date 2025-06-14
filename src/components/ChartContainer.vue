<template>
  <section class="dashboard-container chart-container">
    <h3>등급별 인원 현황</h3>
    <canvas ref="chartRef"></canvas>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref, defineProps } from "vue";
const props = defineProps({ users: Array });
let chartInstance = null;
const chartRef = ref(null);

function getUserGrade(participationCount) {
  if (participationCount === 0) return "미참여";
  if (participationCount <= 3) return "신입";
  if (participationCount < 10) return "꾸준";
  return "열혈";
}

function getGradeCounts(users) {
  const counts = { 신입: 0, 꾸준: 0, 열혈: 0, 미참여: 0 };
  users.forEach((user) => {
    const grade = getUserGrade(user.participationCount);
    counts[grade]++;
  });
  return counts;
}

function renderChart() {
  if (chartInstance) chartInstance.destroy();
  const ctx = chartRef.value.getContext("2d");
  const gradeCounts = getGradeCounts(props.users);
  chartInstance = new window.Chart(ctx, {
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
  }
);

onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>
