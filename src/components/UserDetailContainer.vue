<template>
  <section class="dashboard-container user-detail-container">
    <h3>유저 상세보기</h3>
    <div class="user-detail-scroll-wrapper">
      <div v-if="selectedUser" class="user-detail-content">
        <div class="detail-item">
          <strong>이름:</strong> {{ selectedUser.name }}
        </div>
        <div class="detail-item">
          <strong>등급:</strong> {{ selectedUser.grade?.icon }}
          {{ selectedUser.grade?.name }}
        </div>
        <div class="detail-item">
          <strong>최종 접속일:</strong> {{ selectedUser.lastAccessDate }}
        </div>
        <div class="detail-item">
          <strong>최종 참여일:</strong> {{ selectedUser.lastParticipationDate }}
        </div>
        <div class="detail-item">
          <strong>자기소개</strong>
          <div class="introduction">{{ selectedUser.introduction }}</div>
        </div>
      </div>
      <div v-else class="user-detail-placeholder">
        <p class="subtitle">
          테이블에서 사용자를 선택하면 상세 정보를 볼 수 있습니다.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineProps } from "vue";
const props = defineProps({ selectedUser: Object });
</script>

<style scoped>
/* 스타일은 기존과 동일합니다. */
.user-detail-placeholder {
  .subtitle {
    text-align: center;
    color: var(--color-gray);
    margin-block-start: 0;
    margin-block-end: 0;
    text-align: left;
  }
}
</style>
