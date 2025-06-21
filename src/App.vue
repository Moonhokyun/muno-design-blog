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
