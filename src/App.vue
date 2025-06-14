<script setup>
import { ref } from "vue";
import FileInputContainer from "./components/FileInputContainer.vue";
import ChartContainer from "./components/ChartContainer.vue";
import TableContainer from "./components/TableContainer.vue";
import UserDetailContainer from "./components/UserDetailContainer.vue";
import ExportContainer from "./components/ExportContainer.vue";

const users = ref([]);
const fileName = ref("");
const selectedUser = ref(null);

function handleFileUpload(file) {
  fileName.value = file.name;
  // 실제 PDF 파싱 대신 모의 데이터 사용
  loadMockData();
}

function loadMockData() {
  users.value = [
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
      name: "정단골",
      participationCount: 7,
      lastAccessDate: "2024.10.21",
      lastParticipationDate: "2024.10.18",
      introduction: "이 모임, 정말 마음에 들어요.",
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
    {
      name: "윤새내기",
      participationCount: 3,
      lastAccessDate: "2024.10.22",
      lastParticipationDate: "2024.10.22",
      introduction: "만나서 반갑습니다.",
    },
  ];
  selectedUser.value = null;
}

function selectUser(user) {
  selectedUser.value = user;
}
</script>

<template>
  <div id="app">
    <header>
      <h1>사용자 데이터 분석 대시보드</h1>
    </header>
    <FileInputContainer
      @file-uploaded="handleFileUpload"
      :fileName="fileName"
    />
    <main v-if="users.length > 0" class="main-content-area">
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
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
