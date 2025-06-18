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
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
}
</style>
