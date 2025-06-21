<template>
  <header class="app-header">
    <div v-if="isMenuOpen" class="menu-backdrop" @click="closeMenu"></div>

    <div class="header-content">
      <div class="desktop-nav">
        <nav class="main-nav">
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>
      </div>
      <router-link to="/" class="logo-area" @click="goHomeAndReset">
        <img
          src="/assets/img/portfolio_web_logo_blue.svg"
          alt="logo"
          class="logo-image"
        />
        <h1 class="desktop-title">Muno design blog</h1>
      </router-link>
      <div>
        <router-link to="/dashboard" class="dashboard-link">
          사용자 데이터 분석 대시보드
        </router-link>
      </div>

      <div class="hamburger-button" @click="toggleMenu">
        <span v-if="!isMenuOpen">&#9776;</span>
        <span v-else>&times;</span>
      </div>
    </div>

    <div class="dropdown-menu" :class="{ open: isMenuOpen }">
      <nav>
        <router-link to="/" @click="closeMenu">Home</router-link>
        <router-link to="/about" @click="closeMenu">About</router-link>
        <router-link to="/contact" @click="closeMenu">Contact</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { viewState } from "../store/viewState";

const isMenuOpen = ref(false);
const route = useRoute();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const goHomeAndReset = () => {
  closeMenu();
  viewState.resetHomeView();
};

watch(
  () => route.path,
  () => {
    closeMenu();
  }
);
</script>

<style scoped>
.app-header {
  width: 100%;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  position: relative;
  z-index: 999;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo-area {
  display: flex;
  align-items: center;
  font-size: 24px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  gap: 8px;
}

.logo-area .desktop-title {
  display: none;
}

.logo-image {
  display: block;
  height: 24px;
}

/* --- 데스크탑 메뉴 (Home, About, Contact + Toy project) --- */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.desktop-nav .main-nav {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.desktop-nav a {
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
  transition: color 0.3s;
  padding: 8px 12px;
  border-radius: 8px;
}

.desktop-nav a:hover {
  background-color: #eee;
  color: #000;
  transition: background-color 0.3s, color 0.3s;
}

.desktop-nav .main-nav a.router-link-exact-active {
  color: var(--color-primary);
  background-color: #eee;
}

/* --- 대시보드 링크 (항상 헤더에 유지) --- */
.dashboard-link {
  color: #7f7fd5;
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
  transition: color 0.3s;
  padding: 8px 12px;
  border-radius: 8px;
}

.dashboard-link:hover {
  background: linear-gradient(90deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%);
  color: #fff;
  transition: background-color 0.3s, color 0.3s;
}

/* --- 모달 및 드롭다운 메뉴 스타일 --- */

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: var(--size-default);
  box-sizing: border-box;
  box-shadow: 0 4px 6px var(--shadow-color);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 999;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease-in-out;
}

.dropdown-menu.open {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  background-color: #fff;
  padding: 1rem;
}

.dropdown-menu nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dropdown-menu a {
  display: flex;
  padding: 4px 8px;
  min-height: 40px;
  align-items: center;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
}

.dropdown-menu a:hover {
  background-color: #eee;
  color: var(--color-primary);
  transition: 0.3s;
}

/* --- 반응형 처리 --- */

.hamburger-button {
  display: none; /* 평소에는 햄버거 버튼 숨김 */
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  z-index: 1003;
}

@media (max-width: 768px) {
  /* 모바일에서만 적용 */
  .desktop-title,
  .desktop-nav {
    display: none; /* 데스크탑 전용 요소 숨기기 */
  }

  .hamburger-button {
    display: block; /* 햄버거 버튼 표시 */
  }

  .header-content {
    /* 모바일에서는 로고, 대시보드 링크, 햄버거 버튼만 flex로 정렬 */
    justify-content: space-between;
  }
}
</style>
