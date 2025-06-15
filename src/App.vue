<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";
// 새로 만든 DataUploadContainer를 import 합니다.
import DataUploadContainer from "./components/DataUploadContainer.vue";
import ChartContainer from "./components/ChartContainer.vue";
import TableContainer from "./components/TableContainer.vue";
import UserDetailContainer from "./components/UserDetailContainer.vue";
import ExportContainer from "./components/ExportContainer.vue";
// PromptAccordion은 이제 DataUploadContainer 내부에서만 사용되므로 여기서 import할 필요 없습니다.

const users = ref([]);
const selectedUser = ref(null); // fileName은 이제 DataUploadContainer가 관리합니다.

// ... handleFileUpload, selectUser, formatDate 함수 등은 그대로 유지 ...
function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = e.target.result;
      const workbook = XLSX.read(data, {
        type: "array",
        codepage: 949,
        cellDates: true,
      });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      users.value = jsonData.map((row) => ({
        name: row["이름"],
        participationCount: row["참여 횟수"],
        lastAccessDate: formatDate(row["최종 접속일"]),
        lastParticipationDate: formatDate(row["최종 참여일"]),
        introduction: row["자기소개"],
      }));
    } catch (error) {
      console.error("파일을 처리하는 중 오류가 발생했습니다:", error);
      alert(
        "파일을 처리하는 데 실패했습니다. 파일 형식이나 내용을 확인해주세요."
      );
    }
  };
  reader.readAsArrayBuffer(file);
}

function selectUser(user) {
  selectedUser.value = user;
}

function formatDate(date) {
  if (typeof date !== "object" || date === null) {
    return date;
  }
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }
  return date;
}
</script>

<template>
  <div id="app">
    <header>
      <h1>사용자 데이터 분석 대시보드</h1>
    </header>

    <DataUploadContainer @file-uploaded="handleFileUpload" />

    <main
      v-if="users.length > 0"
      id="dashboard-content"
      class="main-content-area"
    >
      <ChartContainer :users="users" />
      <TableContainer
        :users="users"
        :selectedUser="selectedUser"
        @select-user="selectUser"
      />
      <UserDetailContainer :selectedUser="selectedUser" />
      <ExportContainer :users="users" />
    </main>
  </div>
</template>

<style scoped>
/* ... */
</style>
