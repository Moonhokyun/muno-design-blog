<template>
  <header class="app-header">
    <div v-if="isMenuOpen" class="menu-backdrop" @click="closeMenu"></div>

    <div class="header-content">
      <router-link to="/" class="logo" @click="goHomeAndReset">🚀</router-link>

      <div class="desktop-menu">
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>
        <span class="project-title">Toy project</span>
        <router-link to="/dashboard" class="dashboard-link"
          >사용자 데이터 분석 대시보드</router-link
        >
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
      <router-link to="/dashboard" class="dashboard-link" @click="closeMenu">
        사용자 데이터 분석 대시보드
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
// 1단계에서 만든 viewState를 불러옵니다.
import { viewState } from "../store/viewState";

const isMenuOpen = ref(false);
const route = useRoute();

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// 로고를 클릭했을 때 실행할 새로운 함수
const goHomeAndReset = () => {
  // 메뉴를 닫고,
  closeMenu();
  // HomeView의 상태를 초기화하는 함수를 호출합니다.
  viewState.resetHomeView();
};

// 라우트(페이지)가 변경될 때마다 메뉴를 닫도록 수정
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
  position: relative; /* 자식 absolute 요소의 기준점 */
  z-index: 999; /* dim 배경보다 위에 있도록 z-index 조정 */
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo {
  font-size: 24px;
  text-decoration: none;
}

/* --- 데스크탑 메뉴 --- */
.desktop-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}
.desktop-menu nav {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.desktop-menu a {
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
  transition: color 0.3s;
  padding: 8px 12px;
  border-radius: 8px;
}
.desktop-menu a:hover {
  background-color: #eee;
  color: #000;
  transition: background-color 0.3s, color 0.3s;
}
.desktop-menu nav a.router-link-exact-active {
  color: var(--color-primary);
  background-color: #eee;
}
.project-title {
  color: var(--color-primary);
  font-size: var(--font-size-default);
}

/* --- 모달 및 드롭다운 메뉴 스타일 --- */

.dropdown-menu {
  /* 헤더 바로 아래에 붙도록 position: absolute 사용 */
  position: absolute;
  top: 100%; /* 헤더 높이만큼 아래에 위치 */
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: var(--size-default);
  box-sizing: border-box;
  box-shadow: 0 4px 6px var(--shadow-color);

  display: flex;
  flex-direction: column;
  gap: 10px;

  z-index: 999; /* dim 배경 위에 오도록 z-index 추가 */

  /* 애니메이션을 위한 초기 상태 */
  visibility: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease-in-out;
}

.dropdown-menu.open {
  /* 메뉴가 열렸을 때의 상태 */
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  background-color: #fff;
  padding: 1rem;
  a {
    display: flex;
    padding: 4px 8px;
    min-height: 40px;
    align-items: center;
    border-radius: 8px;
  }
  a:hover {
    background-color: #eee;
    color: var(--color-primary);
    transition: 0.3s;
  }
}

.dropdown-menu a {
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
  padding: var(--size-default) 0;
}
.dropdown-menu a:hover {
  color: var(--color-primary);
  transition: color 0.3s;
}
.dropdown-menu nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* --- 반응형 처리 --- */

.hamburger-button {
  display: none; /* 평소에는 햄버거 버튼 숨김 */
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  z-index: 1003; /* 버튼이 항상 위에 있도록 */
}

@media (max-width: 768px) {
  .desktop-menu {
    display: none;
  }
  .hamburger-button {
    display: block;
  }
}
</style>
