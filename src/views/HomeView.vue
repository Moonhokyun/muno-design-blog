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
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>블로그 게시물을 불러오는 중입니다... {{ loadingProgress }}%</p>
      </div>
      <div v-else-if="error" class="error-message">
        데이터를 불러오는데 실패했습니다: {{ error }}
      </div>
      <div v-else-if="selectedCard" class="blog-detail-view">
        <div class="blog-header">
          <button @click="goBack" class="back-button">
            <span class="mdi mdi-chevron-left"></span>
          </button>
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
        <div
          class="blog-content post-content"
          v-html="selectedCard.content"
        ></div>

        <div class="button-group">
          <a
            href="https://forms.gle/N83gwgwpiFEYMYEJ8"
            target="_blank"
            class="action-button feedback-button"
          >
            글에 대한 피드백 남기기 💬
          </a>
          <button @click="sharePost" class="action-button share-button">
            <span v-if="copyButtonState === 'copied'">copied</span>
            <span v-else class="mdi mdi-share-variant-outline"></span>
          </button>
        </div>

        <hr />
        <div class="blog-navigation">
          <button
            :disabled="!previousCard"
            @click="navigateToCard(previousCard)"
          >
            &lt; 이전 글
          </button>
          <button :disabled="!nextCard" @click="navigateToCard(nextCard)">
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
              @click="navigateToCard(card)"
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
          @click="navigateToCard(card)"
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
import { useRoute, useRouter } from "vue-router";
import { marked } from "marked";

// =================================================================
// ==============  👇 여기를 true/false 로 바꾸세요 👇 ==============
// =================================================================
const USE_LOCAL_DATA = false; // true: 로컬 데이터 사용, false: 서버 API 사용
// =================================================================

const route = useRoute();
const router = useRouter();
const cards = ref([]);
const selectedCard = ref(null);
const selectedTag = ref("전체");
const loading = ref(true);
const error = ref(null);
const copyButtonState = ref("default");
const loadingProgress = ref(0);
let progressInterval = null;

const localPosts = [
  {
    id: "1",
    title:
      "2025년 소모임 어플 추천 TOP 3, 우리 동네 자기계발 분야 1위 모임장은 이것부터 확인했습니다.",
    summary:
      "안녕하세요! 김포에서 상위권 자기계발 모임을 운영중이에요. 제가 직접 써보고 분석한 소모임 앱 선택 기준, 간단하게 공유해 드릴게요.",
    image: "/assets/img/open-graph.png",
    thumbnail: "/assets/img/open-graph.png",
    tags: ["커뮤니티"],
    creationDate: "2025-06-22",
    content: `# 2025년 소모임 어플 추천 TOP 3, 우리 동네 자기계발 분야 1위 모임장은 이것부터 확인했습니다.
## 소모임 어플, 어떤 기준으로 고르고 계신가요?
![대체 텍스트: 당근 동네생활 앱 캡쳐](/assets/img/open-graph.png)
### **김포 1위 모임장이 직접 써보고 분석한 소모임 어플 TOP 3**
| 플랫폼 | 장점 👍 | 단점 👎 | 추천 모임 유형 |
| :--- | :--- | :--- | :--- |
| 카카오톡 오픈채팅 | • 높은 접근성 | • '빌런' 유입 가능성 | • 전국 단위 서비스 |
| 문토 (Munto) | • 전문성 기반 운영 | • 제한된 사용자 풀 | • 수익화 모임 |
| 당근 (Karrot) | • 지역 기반 | • 한정적인 유저 풀 | • 동네 친목 모임 |`,
  },
];

const API_BASE_URL = "https://notion-blog-backend-tau.vercel.app";

const fetchPosts = async () => {
  loading.value = true;
  error.value = null;
  loadingProgress.value = 0;

  // 로딩 진행률 시뮬레이션 시작
  progressInterval = setInterval(() => {
    if (loadingProgress.value < 95) {
      loadingProgress.value += 5;
    }
  }, 100);

  if (USE_LOCAL_DATA) {
    setTimeout(() => {
      cards.value = localPosts.map((post) => ({ ...post, content: undefined }));
      loadingProgress.value = 100;
      clearInterval(progressInterval);
      loading.value = false;
    }, 1000); // 로컬 데이터도 약간의 딜레이를 주어 로딩 확인
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      cards.value = await response.json();
    } catch (err) {
      error.value = "게시물을 불러오지 못했습니다.";
    } finally {
      loadingProgress.value = 100;
      clearInterval(progressInterval);
      loading.value = false;
    }
  }
};

const fetchPostContent = async (id) => {
  if (USE_LOCAL_DATA) {
    const post = localPosts.find((p) => p.id === id);
    return post ? post.content : "로컬 데이터를 찾을 수 없습니다.";
  } else {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${id}/content`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.content; // 백엔드에서 받은 HTML을 그대로 반환
    } catch (err) {
      return "<p>콘텐츠를 불러오는 데 실패했습니다.</p>";
    }
  }
};

const navigateToCard = (card) => {
  if (!card) return;
  router.push({ query: { post: card.id } });
};

const goBack = () => {
  router.push({ query: {} });
};

const sharePost = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyButtonState.value = "copied";
    setTimeout(() => {
      copyButtonState.value = "default";
    }, 2000);
  } catch (err) {
    alert("링크 복사에 실패했습니다.");
  }
};

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

const selectTag = (tag) => {
  selectedTag.value = tag;
  goBack();
};

watch(
  () => route.query.post,
  async (newId) => {
    if (loading.value) {
      await new Promise((resolve) =>
        watch(loading, (val) => !val && resolve())
      );
    }

    if (newId) {
      const cardToSelect = cards.value.find((c) => c.id === newId);
      if (cardToSelect) {
        selectedCard.value = {
          ...cardToSelect,
          content: "내용을 불러오는 중...",
        };
        // marked 라이브러리 제거, HTML을 직접 사용
        const htmlContent = await fetchPostContent(newId);
        selectedCard.value = { ...cardToSelect, content: htmlContent };
      } else {
        error.value = "해당 게시물을 찾을 수 없습니다.";
        selectedCard.value = null;
      }
    } else {
      selectedCard.value = null;
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchPosts();
  viewState.resetHomeView = goBack;
});

onUnmounted(() => {
  viewState.resetHomeView = () => {};
});
</script>

<style scoped>
/* [수정] 스크롤 처리를 부모에게 위임 */
.blog-content {
  line-height: 1.8;
  padding: 1rem;
  overflow-x: auto; /* 내용이 넘칠 때만 가로 스크롤 생성 */
}
/* 기존 스타일 ... */

/* [추가] Notion 블록 스타일에 맞게 CSS 추가 */
.post-content :deep(.notion-table-block) {
  overflow: auto;
}
.post-content :deep(.notion-image-block) {
  margin: 2em 0;
  text-align: center;
}
.post-content :deep(.notion-image-block img) {
  max-width: 100%;
  border-radius: 8px;
}
.post-content :deep(.notion-list-item-box) {
  padding-left: 2em;
}

/* [추가] 블로그 본문 링크 Embed 스타일 */
.post-content :deep(a) {
  display: block;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  margin: 1em 0;
  transition: background-color 0.2s;
}
.post-content :deep(a:hover) {
  background-color: #f5f5f5;
}

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
.blog-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
}
/* [수정] 테이블 스타일 변경 */
.blog-content :deep(table) {
  width: 100%;
  border-collapse: separate; /* border-radius를 셀에 적용하기 위해 'separate'로 설정 */
  border-spacing: 0;
  margin: 1rem 0;
  min-width: 400px; /* 테이블의 최소 너비를 지정해 가독성 확보 */
}
.blog-content :deep(th),
.blog-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

/* 셀 사이의 border가 중복되지 않도록 처리 */
.blog-content :deep(th:not(:first-child)),
.blog-content :deep(td:not(:first-child)) {
  border-left: none;
}
.blog-content :deep(tbody td) {
  border-top: none;
}

/* 테이블의 네 모서리에 border-radius 적용 */
.blog-content :deep(thead tr:first-child > th:first-child) {
  border-top-left-radius: 6px;
}
.blog-content :deep(thead tr:first-child > th:first-child) {
  border-bottom-left-radius: 6px;
}
.blog-content :deep(thead tr:first-child > th:last-child) {
  border-top-right-radius: 6px;
}
.blog-content :deep(thead tr:first-child > th:last-child) {
  border-bottom-right-radius: 6px;
}
.blog-content :deep(tbody tr:last-child > td:first-child) {
  border-bottom-left-radius: 6px;
}
.blog-content :deep(tbody tr:last-child > td:last-child) {
  border-bottom-right-radius: 6px;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.2rem;
  color: var(--color-gray);
}
.card-description {
  justify-content: space-between;
  height: 100%;
}
.card-description-title {
  font-size: 16px;
}
.card-description-detail {
  font-size: 12px;
}
.creation-date {
  font-size: 12px;
  color: var(--color-gray);
  margin: 0;
  white-space: nowrap;
}
.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 20px;
}
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-button-bg);
  color: var(--color-button-text);
  padding: 8px 16px;
  text-decoration: none;
  font-size: var(--font-size-default);
  font-weight: 500;
  transition: background-color 0.3s, color 0.3s;
  height: 40px;
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  white-space: nowrap;
}
.action-button:hover {
  background-color: #eee;
  color: #000;
}
.share-button {
  background-color: transparent;
  border: 1px solid #d4d4d4;
  color: #d4d4d4;
  min-width: 80px;
}
.share-button:hover {
  background-color: #eee;
  color: #000;
}
.share-button .mdi {
  font-size: 20px;
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
  font-size: 10px;
  color: #000;
  padding: 2px 8px;
}
.home-container {
  display: flex;
  width: 100%;
  height: 100%;
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
  flex-direction: column;
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
  height: auto;
  box-sizing: border-box;
}
.contents-grid {
  display: grid;
  column-gap: 1rem;
  gap: 1rem;
  grid-template-columns: repeat(12, minmax(0.3125rem, 1fr));
  margin: 1rem;
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
  height: auto;
  min-height: 200px;
}
.card-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.img-container {
  width: 100%;
  height: 0;
  padding-bottom: 40%;
  background-color: #eee;
  position: relative;
  overflow: hidden;
}
.img-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-description {
  width: 100%;
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
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
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
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.back-button .mdi {
  font-size: 24px;
}
.back-button:hover {
  background-color: #eee;
  color: #000;
  transition: background-color 0.3s, color 0.3s;
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
  display: flex;
  flex-direction: column;
  height: auto;
}
.card-container-small:hover {
  transform: scale(1.05);
}
.img-container-small {
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  overflow: hidden;
}
.img-container-small img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-description-small {
  padding: var(--size-default);
  color: #000;
  flex-grow: 1;
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
@media (min-width: 600px) {
  .contents-grid {
    grid-template-columns: repeat(6, minmax(0.3125rem, 1fr));
  }
  .card-container {
    grid-column-end: span 3;
  }
}
@media (min-width: 1024px) {
  .contents-grid {
    grid-template-columns: repeat(9, minmax(0.3125rem, 1fr));
  }
  .card-container {
    grid-column-end: span 3;
  }
}
@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    position: static;
    height: auto;
    overflow-y: visible;
    padding: 1rem;
    padding-bottom: 0;
  }
  .sidebar ul {
    display: flex; /* [수정] flex display 추가 */
    flex-direction: row;
    gap: 8px; /* [수정] gap 추가 */
    overflow-x: auto; /* [수정] 가로 스크롤 추가 */
    white-space: nowrap; /* [수정] 줄바꿈 방지 */
    padding-bottom: 8px; /* 스크롤바 공간 확보 */
  }
  .sidebar li {
    flex-shrink: 0; /* [수정] 아이템이 줄어들지 않도록 설정 */
    width: auto; /* [수정] 너비 자동 조정 */
    max-width: none;
  }
  .sidebar li a {
    justify-content: center;
    border-radius: 32px;
    border: 1px solid #eee;
  }
  .contents-grid {
    grid-template-columns: 1fr;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  gap: 20px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--color-primary);
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.dark .feedback-button {
  color: #000;
}
</style>
