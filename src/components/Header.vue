<template>
  <header class="app-header">
    <div v-if="isMenuOpen" class="menu-backdrop" @click="closeMenu"></div>

    <div class="header-content">
     <div class="left-section">
        <router-link to="/" class="logo-area" @click="goHomeAndReset">
          <img
            :src="logoSrc"
            alt="logo"
            class="logo-image"
          />
          <h1 class="desktop-title">Muno design blog</h1>
        </router-link>
        <div class="desktop-nav">
          <nav class="main-nav">
            <router-link to="/">Home</router-link>
            <router-link to="/about">About</router-link>
            <router-link to="/contact">Contact</router-link>
          </nav>
        </div>
      </div>

      <div class="right-section">
        <router-link to="/dashboard" class="dashboard-link">
          사용자 데이터 분석 대시보드
        </router-link>
        <button @click="toggleTheme" class="theme-toggle-btn">
          <span class="mdi" :class="isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"></span>
        </button>
        <div class="hamburger-button" @click="toggleMenu">
          <span v-if="!isMenuOpen">&#9776;</span>
          <span v-else>&times;</span>
        </div>
      </div>
          <button @click="toggleTheme" class="theme-toggle-btn mobile-theme-toggle">
      <span class="mdi" :class="isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"></span>
    </button>

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
import { ref, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { viewState } from "../store/viewState";

const isMenuOpen = ref(false);
const isDark = ref(false);
const route = useRoute();

const logoSrc = computed(() => isDark.value ? '/assets/img/portfolio_web_logo_white.svg' : '/assets/img/portfolio_web_logo_blue.svg');

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

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  const theme = localStorage.getItem('theme');
  isDark.value = theme === 'dark';
});

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
  border-bottom: 1px solid var(--color-border);
  box-sizing: border-box;
  position: sticky;
  top: 0;
  background-color: var(--color-background);
  z-index: 999;
  transition: background-color 0.3s, border-color 0.3s;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.left-section, .right-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-area {
  display: flex;
  align-items: center;
  font-size: 24px;
  text-decoration: none;
  gap: 8px;
}

.logo-image {
  height: 24px;
  transition: filter 0.3s;
}

.logo-area .desktop-title {
  display: none;
  color: var(--color-text-primary);
  font-size: 1rem;
  font-weight: bold;
}

/* --- 데스크탑 메뉴 --- */
.desktop-nav .main-nav {
  display: flex;
  gap: 10px;
}

.desktop-nav a {
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  transition: background-color 0.3s, color 0.3s;
}

.desktop-nav a:hover {
  background-color: var(--color-button-hover-bg);
  color: var(--color-text-primary);
}

.desktop-nav a.router-link-exact-active {
  color: var(--color-text-primary);
  background-color: var(--color-button-hover-bg);
}

/* --- 대시보드 링크 --- */
.dashboard-link {
  color: #7f7fd5;
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.3s, color 0.3s;
}

.dashboard-link:hover {
  background: linear-gradient(90deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%);
  color: #fff;
}

/* --- Theme Toggle Button --- */
.theme-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-toggle-btn:hover {
  background-color: var(--color-button-hover-bg);
}
.theme-toggle-btn .mdi {
  font-size: 20px;
}
.mobile-theme-toggle {
  display: none;
}

/* --- 드롭다운 메뉴 --- */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--color-background);
  padding: 1rem;
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
}

.dropdown-menu nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dropdown-menu a {
  display: flex;
  padding: 8px;
  min-height: 40px;
  align-items: center;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-default);
  color: var(--color-text-secondary);
}

.dropdown-menu a:hover {
  background-color: var(--color-button-hover-bg);
  color: var(--color-text-primary);
}

/* --- 반응형 처리 --- */
.hamburger-button {
  display: none;
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  z-index: 1003;
  color: var(--color-text-primary);
}

@media (min-width: 769px) {
  .desktop-nav, .logo-area .desktop-title {
    display: flex;
  }
}

@media (max-width: 768px) {
   .desktop-nav,
  .right-section .theme-toggle-btn {
    display: none;
  }
  .hamburger-button {
    display: block;
  }
  .header-content {
    justify-content: space-between;
  }
  .left-section {
    flex-grow: 1;
  }
    .mobile-theme-toggle {
    display: flex;
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--color-button-bg);
    color: var(--color-button-text);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 1000;
    transition: background-color 0.3s, color 0.3s;
  }

  .mobile-theme-toggle:hover {
    background-color: var(--color-button-hover-bg);
    color: var(--color-button-hover-text);
  }

  .mobile-theme-toggle .mdi {
    font-size: 20px;
  }

}
</style>