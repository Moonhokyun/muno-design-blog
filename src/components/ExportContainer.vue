<template>
  <section class="dashboard-container export-container">
    <h3>데이터 내보내기</h3>
    <p>해당 정보를 다운로드 받으세요</p>
    <button @click="exportToExcel" class="export-btn">엑셀 리포트 저장</button>
  </section>
</template>

<script setup>
import { defineProps } from "vue";
const props = defineProps({ users: Array });

function getUserGrade(participationCount) {
  if (participationCount === 0) return { name: "미참여", icon: "👻" };
  if (participationCount <= 3) return { name: "신입", icon: "🐥" };
  if (participationCount < 10) return { name: "꾸준", icon: "📈" };
  return { name: "열혈", icon: "🔥" };
}

function exportToExcel() {
  const usersWithGrades = props.users.map((user) => ({
    ...user,
    grade: getUserGrade(user.participationCount),
  }));
  const dataToExport = usersWithGrades.map((user) => ({
    이름: user.name,
    등급: `${user.grade.icon} ${user.grade.name}`,
    "참여 횟수": user.participationCount,
    "최종 접속일": user.lastAccessDate,
    "최종 참여일": user.lastParticipationDate,
    자기소개: user.introduction,
  }));
  const worksheet = window.XLSX.utils.json_to_sheet(dataToExport);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "사용자 데이터");
  window.XLSX.writeFile(workbook, "사용자_분석_리포트.xlsx");
}
</script>
