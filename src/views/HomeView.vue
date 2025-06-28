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
          <div class="content-style" v-html="selectedCard.content"></div>
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
import { marked } from "marked";

// =================================================================
// ==============  👇 여기를 true/false 로 바꾸세요 👇 ==============
// =================================================================
const USE_LOCAL_DATA = false; // true: 로컬 데이터 사용, false: 서버 API 사용
// =================================================================

const route = useRoute();
const cards = ref([]);
const selectedCard = ref(null);
const selectedTag = ref("전체");
const loading = ref(true);
const error = ref(null);

// --- 로컬 데이터 정의 ---
const localPosts = [
  {
    id: '1',
    title: '2025년 소모임 어플 추천 TOP 3',
    summary: '안녕하세요! 김포에서 상위권 자기계발 모임을 운영중이에요. 제가 직접 써보고 분석한 소모임 앱 선택 기준, 간단하게 공유해 드릴게요.',
    image: '/assets/img/open-graph.png',
    tags: ['커뮤니티'],
    creationDate: '2025-06-22',
    content: `# 2025년 소모임 어플 추천 TOP 3, 우리 동네 자기계발 분야 1위 모임장은 이것부터 확인했습니다.

## 소모임 어플, 어떤 기준으로 고르고 계신가요?

저는 현재 제가 살고 있는 동네에서 당근 모임을 통한 커뮤니티를 운영 중입니다.
자기계발 분야에서는 1위를 해본 적도 있고, 열혈 유저 분들도 꽤 있는 모임을 운영 중이에요.
이 외에도 다양한 서비스의 모임에 열혈 유저로도 활동해보았는데요.
제가 모임을 운영하기 위해 어떤 서비스를 선택했고, 그 기준은 어땠는지 공유해 볼게요!

### **어떤 앱을 선택해야 할까? 내 모임에 딱 맞는 플랫폼 최종 선택 가이드**

| 플랫폼 | 장점 👍 | 단점 👎 | 추천 모임 유형 |
| --- | --- | --- | --- |
| 카카오톡 오픈채팅 | • 높은 접근성 | • '빌런' 유입 가능성 | • 전국 단위 서비스 |
| 문토 (Munto) | • 전문성 기반 운영 | • 제한된 사용자 풀 | • 수익화 모임 |
| 당근 (Karrot) | • 지역 기반 | • 한정적인 유저 풀 | • 동네 친목 모임 |`
  }
];

// --- API 및 데이터 로딩 로직 ---
const API_BASE_URL = "https://notion-blog-backend-tau.vercel.app";

const fetchPosts = async () => {
  loading.value = true;
  error.value = null;

  if (USE_LOCAL_DATA) {
    // 로컬 데이터 사용
    console.log("로컬 데이터를 불러옵니다.");
    setTimeout(() => {
      cards.value = localPosts.map(post => {
        const { content, ...cardData } = post;
        return cardData;
      });
      loading.value = false;
    }, 300);
  } else {
    // 서버 API 사용
    console.log("서버에서 데이터를 불러옵니다.");
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      cards.value = await response.json();
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      error.value = "게시물을 불러오지 못했습니다. 서버를 확인해주세요.";
    } finally {
      loading.value = false;
    }
  }
};

const fetchPostContent = async (id) => {
  if (USE_LOCAL_DATA) {
    const post = localPosts.find(p => p.id === id);
    return post ? post.content : "로컬 데이터를 찾을 수 없습니다.";
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}/content`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.content;
    } catch (err) {
      console.error(`Failed to fetch content for post ${id}:`, err);
      return "게시물 내용을 불러올 수 없습니다.";
    }
  }
};


// --- 아래부터는 기존 로직과 동일합니다 ---

const allTags = computed(() => {
  const tags = new Set();
  const source = USE_LOCAL_DATA ? localPosts : cards.value;
  source.forEach((card) => {
    card.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags);
});

const filteredCards = computed(() => {
  if (selectedTag.value === "전체") return cards.value;
  return cards.value.filter((card) => card.tags.includes(selectedTag.value));
});

const selectCard = async (card) => {
  selectedCard.value = { ...card, content: "내용을 불러오는 중..." };
  const markdownContent = await fetchPostContent(card.id);
  const htmlContent = marked.parse(markdownContent);
  selectedCard.value = { ...card, content: htmlContent };
};

const goBack = () => {
  selectedCard.value = null;
  selectedTag.value = "전체";
};

const previousCard = computed(() => {
  if (!selectedCard.value) return null;
  const currentIndex = filteredCards.value.findIndex( c => c.id === selectedCard.value.id );
  return currentIndex > 0 ? filteredCards.value[currentIndex - 1] : null;
});

const nextCard = computed(() => {
  if (!selectedCard.value) return null;
  const currentIndex = filteredCards.value.findIndex( c => c.id === selectedCard.value.id );
  return currentIndex < filteredCards.value.length - 1 ? filteredCards.value[currentIndex + 1] : null;
});

const selectTag = (tag) => {
  selectedTag.value = tag;
  selectedCard.value = null;
};

onMounted(() => {
  fetchPosts();
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
/* CSS는 이전과 동일합니다. */
.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: var(--color-gray);
}
.card-description {
  justify-content: space-between; /* 내부 요소를 위아래로 분산 */
  height: 100%;
}
.card-description-title {
  font-size: 16px;
}
.card-description-detail {
  font-size: 12px;
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
.sidebar li.active a {
  background-color: #eee;
  color: #000;
  font-weight: 700;
}
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
}
.related-content {
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
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
}
.back-button:hover {
  background-color: #eee;
  color: #000;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 8px;
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
}
.summary-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}
.summary-container h2 {
  color: var(--color-primary);
  font-size: 2rem;
}
.blog-content {
  line-height: 1.8;
  padding: 1rem;
}

/* :deep()을 사용하여 v-html 내부의 요소에 스타일 적용 */
.blog-content :deep(h1),
.blog-content :deep(h2),
.blog-content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  text-align: left;
}
.blog-content :deep(h2) {
  font-size: 20px;
}

.blog-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.blog-content :deep(th),
.blog-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
}
.content-style {
  margin: 0;
  font-size: var(--font-size-default);
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
}
.blog-navigation button:hover {
  background-color: #eee;
  color: #000;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 8px;
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