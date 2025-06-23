<template>
  <div class="home-container">
    <aside class="sidebar">
      <ul>
        <li :class="{ active: selectedTag === '전체' }">
          <a href="#" @click.prevent="selectTag('전체')">전체</a>
        </li>
        <li
          v-for="tag in allTags"
          :key="tag"
          :class="{ active: selectedTag === tag }"
        >
          <a href="#" @click.prevent="selectTag(tag)">{{ tag }}</a>
        </li>
      </ul>
    </aside>

    <main class="main-content">
      <div v-if="loading" class="loading-message">
        블로그 게시물을 불러오는 중입니다...
      </div>
      <div v-else-if="error" class="error-message">
        데이터를 불러오는데 실패했습니다: {{ error }}
      </div>
      <div v-else-if="selectedCard" class="blog-detail-view">
        <div class="blog-header">
          <button @click="goBack" class="back-button">← 뒤로 가기</button>
          <div class="summary-container">
            <h2>{{ selectedCard.title }}</h2>
            <div class="summary-info">
              <p class="creation-date">
                작성일: {{ selectedCard.creationDate }}
              </p>
              <div class="tags-container">
                <span v-for="tag in selectedCard.tags" :key="tag" class="tag">{{
                  tag
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div class="blog-content">
          <p class="content-style" v-html="selectedCard.content"></p>
        </div>

        <div class="comment-section">
          <a
            href="https://forms.gle/N83gwgwpiFEYMYEJ8"
            target="_blank"
            class="comment-button"
          >
            글에 대한 피드백 남기기 💬
          </a>
        </div>

        <hr />
        <div class="blog-navigation">
          <button :disabled="!previousCard" @click="selectCard(previousCard)">
            &lt; 이전 글
          </button>
          <button :disabled="!nextCard" @click="selectCard(nextCard)">
            다음 글 &gt;
          </button>
        </div>
        <hr />
        <div class="related-content">
          <h3>다른 콘텐츠 둘러보기</h3>
          <div class="contents-grid">
            <section
              v-for="card in filteredCards"
              :key="card.id"
              class="card-container-small"
              @click="selectCard(card)"
            >
              <div class="img-container-small">
                <img :src="card.image" alt="Image" />
              </div>
              <div class="card-description-small">
                <h4>{{ card.title }}</h4>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div v-else class="contents-grid">
        <section
          v-for="card in filteredCards"
          :key="card.id"
          class="card-container"
          @click="selectCard(card)"
        >
          <div class="img-container">
            <img :src="card.image" :alt="card.title + ' 썸네일 이미지'" />
          </div>
          <div class="card-description">
            <h3 class="card-description-title">{{ card.title }}</h3>
            <p class="card-description-detail">{{ card.summary }}</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { viewState } from "../store/viewState";
import { useRoute } from "vue-router";

const route = useRoute();

// --- 데이터 ---
const cards = ref([]); // 하드코딩된 데이터를 빈 배열로 변경
const selectedCard = ref(null);
const selectedTag = ref("전체");
const loading = ref(true); // 로딩 상태 추가
const error = ref(null); // 에러 상태 추가

// 백엔드 API의 기본 URL
const API_BASE_URL = "http://localhost:3000"; // 백엔드 서버 주소

// 블로그 게시물 목록을 가져오는 함수
const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    cards.value = data; // Notion에서 가져온 데이터로 cards 업데이트
  } catch (err) {
    console.error("Failed to fetch posts:", err);
    error.value = "게시물을 불러오지 못했습니다. 서버를 확인해주세요.";
  } finally {
    loading.value = false;
  }
};

// 특정 블로그 게시물의 상세 내용을 가져오는 함수
const fetchPostContent = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}/content`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.content; // 백엔드에서 반환하는 content 필드
  } catch (err) {
    console.error(`Failed to fetch content for post ${id}:`, err);
    // 오류 발생 시 임시 메시지 또는 요약을 반환
    return "게시물 내용을 불러올 수 없습니다.";
  }
};

// --- Computed 속성 (기존과 동일) ---
const allTags = computed(() => {
  const tags = new Set();
  cards.value.forEach((card) => {
    card.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
});

const filteredCards = computed(() => {
  if (selectedTag.value === "전체") {
    return cards.value;
  }
  return cards.value.filter((card) => card.tags.includes(selectedTag.value));
});

const previousCard = computed(() => {
  if (!selectedCard.value) return null;
  const currentIndex = filteredCards.value.findIndex(
    (c) => c.id === selectedCard.value.id
  );
  return currentIndex > 0 ? filteredCards.value[currentIndex - 1] : null;
});

const nextCard = computed(() => {
  if (!selectedCard.value) return null;
  const currentIndex = filteredCards.value.findIndex(
    (c) => c.id === selectedCard.value.id
  );
  return currentIndex < filteredCards.value.length - 1
    ? filteredCards.value[currentIndex + 1]
    : null;
});

// --- 메소드 ---
const selectTag = (tag) => {
  selectedTag.value = tag;
  selectedCard.value = null; // 태그 변경 시 상세 보기 초기화
};

// selectCard 함수를 수정하여 상세 내용도 가져오도록 변경
const selectCard = async (card) => {
  // 로딩 상태를 true로 설정하여 사용자에게 데이터를 가져오는 중임을 알림
  selectedCard.value = { ...card, content: "내용을 불러오는 중..." }; // 임시 로딩 메시지
  const content = await fetchPostContent(card.id);
  selectedCard.value = { ...card, content: content }; // 실제 내용으로 업데이트
};

const goBack = () => {
  selectedCard.value = null;
  selectedTag.value = "전체";
};

// --- 라이프사이클 훅 ---
onMounted(() => {
  fetchPosts(); // 컴포넌트 마운트 시 블로그 게시물 데이터 로드
  viewState.resetHomeView = goBack;
  updateMetaTags(route.meta.title, route.meta.description);
});

onUnmounted(() => {
  viewState.resetHomeView = () => {};
});

watch(
  selectedCard,
  (newCard) => {
    if (newCard) {
      updateMetaTags(`${newCard.title} | Muno's design blog`, newCard.summary);
    } else {
      updateMetaTags(route.meta.title, route.meta.description);
    }
  },
  { immediate: true }
);

function updateMetaTags(title, description) {
  document.title = title || "기본 타이틀";
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", description || "기본 설명");
}
</script>

<style scoped>
/* 기존 스타일은 유지하고 아래 스타일만 추가 또는 수정합니다. */

.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.2rem;
  color: var(--color-gray);
}

/* --- 카드 설명 & 푸터 스타일 --- */
.card-description {
  justify-content: space-between; /* 내부 요소를 위아래로 분산 */
  height: 100%;
  .card-description-title {
    font-size: 16px;
  }
  .card-description-detail {
    font-size: 12px;
  }
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.creation-date {
  font-size: 12px;
  color: var(--color-gray);
  margin: 0;
  white-space: nowrap; /* 날짜가 줄바꿈되지 않도록 */
}

/* 댓글(구글 폼) 버튼 섹션 */
.comment-section {
  text-align: center;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.comment-button {
  display: inline-block;
  background-color: var(--color-primary);
  color: #fff;
  padding: 4px 8px;
  text-decoration: none;
  font-size: var(--font-size-default);
  font-weight: 500;
  transition: background-color 0.3s, transform 0.2s;
  min-height: 40px;
  display: flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
}
.comment-button:hover {
  background-color: #eee;
  color: #000;
  transition: background-color 0.3s, color 0.3s;
}

/* --- 사이드바 활성/비활성 스타일 --- */
.sidebar li.active a {
  background-color: #eee;
  color: #000;
  font-weight: 700;
}

/* --- 카드 및 상세 뷰에 태그 스타일 추가 --- */
.tags-container {
  display: flex;
  gap: 4px;
  flex-direction: row;
}
.tag {
  background-color: #eee;
  border-radius: 12px;
  color: #eee;
  font-size: 10px;
  color: #000;
  padding: 2px 8px;
}

/* --- 기존 스타일 (변경 없음) --- */
.home-container {
  display: flex;
  width: 100%;
  height: 100%; /* 뷰포트 높이에서 헤더 높이를 뺀 값 */
  /* main-content 스크롤을 웹 기본 창으로 옮기기 위해 overflow-y를 제거 */
}
.sidebar {
  width: 200px;
  min-width: 200px;
  padding: var(--size-default);
  color: #000;
  border-right: 1px solid #eee;
  box-sizing: border-box;
  font-size: var(--font-size-default);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-direction: column; /* 변경된 부분 */
}
.sidebar li a {
  color: #000;
  text-decoration: none;
  display: block;
  padding: 4px 20px;
  transition: background-color 0.3s;
}
.sidebar li a:hover {
  background-color: #eeeeeeb2;
}
.main-content {
  flex-grow: 1;
  padding: var(--size-default);
  height: auto; /* 기본적으로 auto로 설정 */
  box-sizing: border-box;
}
.contents-grid {
  display: grid;
  column-gap: 1rem;
  gap: 1rem; /* column-gap과 동일하게 설정 */
  grid-template-columns: repeat(12, minmax(0.3125rem, 1fr));
  margin: 1rem;

  /* height: 100vh; 이 속성을 제거하여 유동적인 높이를 허용합니다. */
}

.card-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  color: #000;
  border: 1px solid #eee;
  border-radius: var(--border-radius);
  width: 100%;
  height: auto; /* padding-bottom 기반으로 높이 설정 예정이므로 auto로 둠 */
  min-height: 200px; /* 최소 높이 설정 (720px 이하에서 unset) */
}
.card-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.img-container {
  width: 100%;
  height: 0; /* padding-bottom으로 높이 지정 */
  padding-bottom: 40%; /* 16:9 비율 유지 (예시) */
  background-color: #eee;
  position: relative; /* img 태그 absolute 포지셔닝을 위해 */
  overflow: hidden;
}
.img-container img {
  position: absolute; /* 부모 컨테이너 내에서 위치 지정 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-description {
  width: 100%;
  /* height: 50%; 제거 - content에 따라 유동적으로 */
  padding: 12px;
  gap: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.card-description h3 {
  color: var(--color-primary);
}
.card-description p {
  max-height: 100px;
  margin: 0;
  flex-grow: 1;
  font-size: var(--font-size-default);
}
.blog-detail-view {
  color: #000;
  .related-content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
  }
}
.blog-header {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 20px;
  flex-direction: column;
}
.back-button {
  justify-self: start;
  background: unset;
  color: #000;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-default);
  padding: 8px 12px;
  &:hover {
    background-color: #eee;
    color: #000;
    transition: background-color 0.3s, color 0.3s;
    border-radius: 8px;
  }
}
.thumbnail-container {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  width: 100%;
  max-width: 200px;
}
.thumbnail-container img {
  width: 100%;
  border-radius: var(--border-radius);
}
.summary-container {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 1rem;
  .summary-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
.summary-container h2 {
  color: var(--color-primary);
  font-size: 2rem;
}
.blog-content {
  line-height: 1.8;
  padding: 1rem;
  .content-style {
    margin: 0;
    font-size: var(--font-size-default);
  }
}
hr {
  border: none;
  border-top: 1px solid #eee;
  margin: auto 1rem;
}
.blog-navigation {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-default);
  padding: 20px;
}
.blog-navigation button {
  padding: 8px 12px;
  font-size: inherit;
  background-color: unset;
  border: 0;
  &:hover {
    background-color: #eee;
    color: #000;
    transition: background-color 0.3s, color 0.3s;
    border-radius: 8px;
  }
}
.blog-navigation button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  font-size: inherit;
}
.related-content .contents-grid {
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  grid-template-rows: auto;
  height: auto;
}
.card-container-small {
  border-radius: var(--border-radius);
  border: 1px solid #eee;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex; /* flexbox 적용 */
  flex-direction: column; /* 세로 정렬 */
  height: auto; /* 유동적으로 높이 조절 */
}
.card-container-small:hover {
  transform: scale(1.05);
}
.img-container-small {
  width: 100%;
  height: 0; /* padding-bottom으로 높이 지정 */
  padding-bottom: 56.25%; /* 16:9 비율 유지 (예시) */
  position: relative; /* img 태그 absolute 포지셔닝을 위해 */
  overflow: hidden;
}
.img-container-small img {
  position: absolute; /* 부모 컨테이너 내에서 위치 지정 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-description-small {
  padding: var(--size-default);
  color: #000;
  flex-grow: 1; /* 남은 공간을 채우도록 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.card-description-small h4 {
  padding: 1rem;
  margin: 0;
  font-size: 12px;
  height: 100%;
  color: var(--color-primary);
}

/* --- 반응형 그리드 (.card-group--grid 참고) --- */

/* Medium devices (tablets, 600px and up) */
@media (min-width: 600px) {
  .contents-grid {
    column-gap: 1rem;
    row-gap: 1rem;
    grid-template-columns: repeat(6, minmax(0.3125rem, 1fr));
    /* grid-template-rows: repeat(3, minmax(0.3125rem, 1fr)); */
    margin-left: 1rem;
    margin-right: 1rem;
  }
  .card-container {
    grid-column-end: span 3; /* 6칸 그리드에서 3칸 (1/2) = 2개 */
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .contents-grid {
    grid-template-columns: repeat(9, minmax(0.3125rem, 1fr));
    column-gap: 1rem; /* 20px */
    row-gap: 1rem; /* 20px */
    margin-left: 1rem;
    margin-right: 1rem;
  }
  .card-container {
    grid-column-end: span 3; /* 9칸 그리드에서 3칸 (1/3) = 3개 */
  }
}

/* Extra large devices (large desktops, 1441px and up) */
@media (min-width: 1441px) {
  .contents-grid {
    column-gap: 1rem; /* 27px */
    row-gap: 1rem; /* 27px */
    margin-left: 1rem; /* 80px */
    margin-right: 1rem; /* 80px */
  }
}

/* Mobile devices (less than 768px) */
@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
  .sidebar {
    width: 100%;
    height: auto;
    border-left: 0;
    border-right: 0;
    position: static;
    height: auto;
    overflow-y: visible;
    padding: 1rem;
    padding-bottom: 0;
  }
  .sidebar h3 {
    display: none;
  }
  .sidebar ul {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10px;
    flex-direction: row;
  }
  .sidebar li {
    flex-grow: 1;
    max-width: 150px;
  }
  .sidebar li a {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    flex-direction: row;
    align-items: center;
    min-height: 40px;
    border-radius: 32px;
    border: 1px solid #eee;
    white-space: pre;
  }
  .main-content {
    height: auto;
  }
  .contents-grid {
    grid-template-columns: 1fr; /* 모바일에서는 1열 */
    grid-template-rows: auto;
    margin-left: 1rem;
    margin-right: 1rem;
    height: auto;
    gap: 1rem; /* 모바일에서도 gap을 통일 */
  }
  .card-container {
    height: auto; /* 카드 높이 자동 조정 */
  }
  .blog-header {
    grid-template-columns: 1fr;
  }
  .thumbnail-container,
  .summary-container {
    grid-column: 1 / -1;
    text-align: center;
  }
  .thumbnail-container {
    grid-row: 2;
    margin-bottom: 10px;
  }
  .summary-container {
    grid-row: 3;
  }
}

/* New media query for viewport height */
@media (max-height: 720px) {
  .main-content {
    height: calc(
      100vh - 80px
    ); /* 헤더 높이를 뺀 만큼 계산 (예시: 헤더 높이 80px) */
    overflow-y: auto;
  }

  .main-content::-webkit-scrollbar {
    width: 8px;
  }

  .main-content::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }

  .main-content::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  .contents-grid {
    height: auto; /* contents-grid 자체의 높이 제한 해제 */
  }

  .card-container {
    min-height: unset; /* min-height 제한 해제 */
  }
}
</style>
