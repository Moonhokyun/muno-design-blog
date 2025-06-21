<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";
import DataUploadContainer from "../components/DataUploadContainer.vue";
import ChartContainer from "../components/ChartContainer.vue";
import TableContainer from "../components/TableContainer.vue";
import UserDetailContainer from "../components/UserDetailContainer.vue";
import ExportContainer from "../components/ExportContainer.vue";

function getDummyData() {
  return [
    {
      name: "김열정",
      participationCount: 15,
      lastAccessDate: "2024.10.25",
      lastParticipationDate: "2024.10.25",
      introduction:
        "모임의 모든 활동에 참여하는 것을 좋아합니다. 다음 정모가 기대되네요!",
    },
    {
      name: "이꾸준",
      participationCount: 8,
      lastAccessDate: "2024.10.26",
      lastParticipationDate: "2024.10.20",
      introduction: "꾸준히 참여하는 것이 중요하다고 생각합니다.",
    },
    {
      name: "박신입",
      participationCount: 2,
      lastAccessDate: "2024.10.26",
      lastParticipationDate: "2024.10.26",
      introduction: "안녕하세요, 이번에 새로 가입했습니다. 잘 부탁드립니다.",
    },
    {
      name: "최초보",
      participationCount: 1,
      lastAccessDate: "2024.10.24",
      lastParticipationDate: "2024.10.24",
      introduction: "아직은 모든 것이 낯설지만 열심히 배워보겠습니다.",
    },
    {
      name: "강매니아",
      participationCount: 22,
      lastAccessDate: "2024.10.26",
      lastParticipationDate: "2024.10.25",
      introduction: "운영진 버금가는 열정으로 함께합니다.",
    },
    {
      name: "조유령",
      participationCount: 0,
      lastAccessDate: "2024.08.10",
      lastParticipationDate: "N/A",
      introduction: "가입만 하고 활동을 못했네요.",
    },
  ];
}

const users = ref([]);
const selectedUser = ref(null);

function loadDummyData() {
  users.value = getDummyData();
  selectedUser.value = null;
}

function handleFileUpload(file) {
  users.value = [];
  selectedUser.value = null;
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
  <div id="dashboard-app">
    <header>
      <h1>사용자 데이터 분석 대시보드</h1>
    </header>

    <DataUploadContainer
      @file-uploaded="handleFileUpload"
      @load-dummy-data="loadDummyData"
    />

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
/* 이 컴포넌트만을 위한 스타일 */
#dashboard-app {
  width: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 1rem;
}
</style>
