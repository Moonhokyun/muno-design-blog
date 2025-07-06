<template>
  <div id="app-container">
    <Header />
    <main class="content-wrapper">
      <transition name="fade" mode="out-in">
        <router-view :key="$route.fullPath" />
      </transition>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import Header from "./components/Header.vue";

// 로컬 스토리지에서 테마 설정을 불러와 적용합니다.
onMounted(() => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
});
</script>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background-color: var(--color-background);
}

.content-wrapper {
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>