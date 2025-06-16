<template>
  <div id="app-container">
    <Header />
    <main class="content-wrapper">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Header from "./components/Header.vue";
</script>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
}

.content-wrapper {
  flex-grow: 1; /* 헤더를 제외한 나머지 공간을 모두 차지 */
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}
</style>
