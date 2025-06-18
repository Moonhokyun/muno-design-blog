<template>
  <div class="home-container">
    <aside class="sidebar">
      <ul>
        <li :class="{ active: selectedTag === '전체' }">
          <a href="#" @click.prevent="selectTag('전체')">전체</a>
        </li>
        <li v-for="tag in allTags" :key="tag" :class="{ active: selectedTag === tag }">
          <a href="#" @click.prevent="selectTag(tag)">{{ tag }}</a>
        </li>
      </ul>
    </aside>

    <main class="main-content">
      <div v-if="selectedCard" class="blog-detail-view">
        <div class="blog-header">
          <button @click="goBack" class="back-button">← 뒤로 가기</button>
          <div class="thumbnail-container">
            <img :src="selectedCard.image" alt="Thumbnail" />
          </div>
          <div class="summary-container">
            <h2>{{ selectedCard.title }}</h2>
            <p class="creation-date">작성일: {{ selectedCard.creationDate }}</p>
            <p>{{ selectedCard.summary }}</p>
            <div class="tags-container">
              <span v-for="tag in selectedCard.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
        <hr />
        <div class="blog-content">
          <p>{{ selectedCard.content }}</p>
        </div>

        <div class="comment-section">
            <a href="https://forms.gle/N83gwgwpiFEYMYEJ8" target="_blank" class="comment-button">
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
            <img :src="card.image" alt="Image" />
          </div>
          <div class="card-description">
            <h3>{{ card.title }}</h3>
            <p>{{ card.summary }}</p>
            <div class="card-footer">
                <div class="tags-container">
                    <span v-for="tag in card.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <p class="creation-date">{{ card.creationDate }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { viewState } from "../store/viewState";

// --- 데이터 ---
const selectedCard = ref(null);
const selectedTag = ref("전체");

// 예시 데이터 (각 항목에 'creationDate' 속성 추가)
const cards = ref([
  {
    id: 1,
    title: "Vue 3 시작하기",
    summary: "Vue 3의 새로운 기능과 Composition API에 대해 알아봅니다.",
    content: "Vue 3는 더 빠르고, 작고, 유지보수하기 쉬워졌습니다. 특히 Composition API는 코드 재사용성과 가독성을 크게 향상시킵니다...",
    image: "https://vuejs.org/images/logo.png",
    tags: ["UI/UX", "브랜딩"],
    creationDate: "2024.05.01",
  },
  {
    id: 2,
    title: "커뮤니티를 만들며 얻은 인사이트",
    summary: "활발한 온라인 커뮤니티를 구축하고 운영하는 노하우를 공유합니다.",
    content: "좋은 커뮤니티는 저절로 만들어지지 않습니다. 초기 멤버 모집부터 콘텐츠 전략, 갈등 관리까지 실제 경험을 바탕으로 한 팁들을 알려드립니다.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    tags: ["커뮤니티 빌드 및 활동"],
    creationDate: "2024.05.10",
  },
  {
    id: 3,
    title: "도쿄의 미니멀리즘 디자인",
    summary: "일본 디자인 특유의 미니멀리즘과 여백의 미에 대해 탐구합니다.",
    content: "도쿄의 건축, 제품, 그래픽 디자인에서 공통적으로 발견되는 미니멀리즘 철학은 무엇일까요? 'Design in Japan' 시리즈의 첫 번째 글입니다.",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop",
    tags: ["Design in japan", "UI/UX"],
    creationDate: "2024.05.15",
  },
  {
    id: 4,
    title: "사용자 경험을 개선하는 5가지 방법",
    summary: "데이터를 기반으로 사용자의 만족도를 높이는 UI/UX 개선안을 제시합니다.",
    content: "사용자 피드백과 데이터를 분석하여 웹사이트의 이탈률을 낮추고 전환율을 높인 5가지 실제 사례를 소개합니다.",
    image: "https://images.unsplash.com/photo-1559028006-44a36f1153d5?q=80&w=1932&auto=format&fit=crop",
    tags: ["UI/UX"],
    creationDate: "2024.05.20",
  },
  {
    id: 5,
    title: "성공적인 브랜딩을 위한 스토리텔링",
    summary: "고객의 마음에 오래 남는 브랜드 스토리를 만드는 법을 알아봅니다.",
    content: "단순히 제품을 파는 것을 넘어, 브랜드의 철학과 가치를 전달하는 스토리텔링 전략은 강력한 팬덤을 형성하는 기초가 됩니다.",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop",
    tags: ["브랜딩"],
    creationDate: "2024.05.25",
  },
  {
    id: 6,
    title: "오프라인 모임 활성화 전략",
    summary: "온라인 커뮤니티 멤버들을 오프라인으로 이끌어내는 구체적인 방법들.",
    content: "정기적인 오프라인 모임은 커뮤니티의 결속력을 다지는 최고의 방법입니다. 성공적인 모임을 기획하고 실행하기 위한 체크리스트를 공유합니다.",
    image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop",
    tags: ["커뮤니티 빌드 및 활동"],
    creationDate: "2024.06.01",
  },
]);

// --- Computed 속성 ---
const allTags = computed(() => {
  const tags = new Set();
  cards.value.forEach(card => {
    card.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
});

const filteredCards = computed(() => {
  if (selectedTag.value === '전체') {
    return cards.value;
  }
  return cards.value.filter(card => card.tags.includes(selectedTag.value));
});

const previousCard = computed(() => {
  if (!selectedCard.value) return null;
  const currentIndex = filteredCards.value.findIndex(c => c.id === selectedCard.value.id);
  return currentIndex > 0 ? filteredCards.value[currentIndex - 1] : null;
});

const nextCard = computed(() => {
  if (!selectedCard.value) return null;
  const currentIndex = filteredCards.value.findIndex(c => c.id === selectedCard.value.id);
  return currentIndex < filteredCards.value.length - 1 ? filteredCards.value[currentIndex + 1] : null;
});

// --- 메소드 ---
const selectTag = (tag) => {
  selectedTag.value = tag;
  selectedCard.value = null;
};

const selectCard = (card) => {
  selectedCard.value = card;
};

// goBack 함수를 HomeView의 상태를 초기화하는 함수로 사용합니다.
const goBack = () => {
  selectedCard.value = null;
  selectedTag.value = '전체'; // 태그 필터도 초기화합니다.
};

// --- 라이프사이클 훅 ---
// HomeView 컴포넌트가 화면에 나타날 때 실행됩니다.
onMounted(() => {
  // viewState의 resetHomeView 함수를 이 컴포넌트의 goBack 함수로 지정합니다.
  // 이제 다른 컴포넌트에서 viewState.resetHomeView()를 호출하면 goBack()이 실행됩니다.
  viewState.resetHomeView = goBack;
});

// HomeView 컴포넌트가 화면에서 사라질 때 실행됩니다.
onUnmounted(() => {
  // 다른 페이지에서는 이 기능이 필요 없으므로, 기본 함수로 되돌려 놓습니다.
  viewState.resetHomeView = () => {};
});
</script>

<style scoped>
/* 기존 스타일은 유지하고 아래 스타일만 추가 또는 수정합니다. */

/* --- 카드 설명 & 푸터 스타일 --- */
.card-description {
  justify-content: space-between; /* 내부 요소를 위아래로 분산 */
}
.card-footer {
    display: flex
;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    gap: var(--size-default);
}
.creation-date {
    font-size: 13px;
    color: var(--color-gray);
    margin: 0;
    white-space: nowrap; /* 날짜가 줄바꿈되지 않도록 */
}

/* 상세 뷰의 작성일 스타일 */
.summary-container .creation-date {
    margin-bottom: 10px;
}

/* 댓글(구글 폼) 버튼 섹션 */
.comment-section {
    text-align: center;
    margin: 30px 0;
}
.comment-button {
    display: inline-block;
    background-color: var(--color-primary);
    color: white;
    padding: 4px 8px;
    text-decoration: none;
    font-size: var(--font-size-default);
    font-weight: 500;
    transition: background-color 0.3s, transform 0.2s;
}
.comment-button:hover {
    background-color: var(--color-secondary);
    transform: translateY(-2px);
}


/* --- 사이드바 활성/비활성 스타일 --- */
.sidebar li.active a {
  background-color: var(--color-primary);
  color: white;
  font-weight: 700;
}

/* --- 카드 및 상세 뷰에 태그 스타일 추가 --- */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-default);
}
.tag {
  background-color: var(--color-secondary);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
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
  background-color: #1a1a1a;
  padding: var(--size-default);
  color: white;
  box-sizing: border-box;
  font-size: var(--font-size-default);

  /* 스크롤 시 따라오면서 상단 고정 */
  position: sticky;
  top: 0; /* 헤더가 있다면 헤더 아래에 위치 */
  height: 100vh; /* 뷰포트 높이만큼 */
  overflow-y: auto; /* 사이드바 내용이 길어지면 사이드바 자체 스크롤 */
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sidebar li a {
  color: white;
  text-decoration: none;
  display: block;
  padding: var(--size-default);
  transition: background-color 0.3s;
}
.sidebar li a:hover {
  background-color: var(--color-primary-opacity);
}
.main-content {
  flex-grow: 1;
  padding: var(--size-default);
  /* overflow-y: auto; 제거 */
  height: auto; /* 내용 길이에 따라 자연스럽게 늘어나도록 */
  box-sizing: border-box;
}
.contents-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: var(--size-default);
  grid-row-gap: var(--size-default);
  height: 100%;
}
.card-container {
  display: flex;
  flex-direction: column;
  background-color: #2f1d58;
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  color: white;
}
.card-container:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.img-container {
  width: 100%;
  height: 50%;
  background-color: lightblue;
}
.img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-description {
  width: 100%;
  height: 50%;
  padding: var(--size-default);
  box-sizing: border-box;
  background-color: #2f1d58;
  display: flex;
  flex-direction: column;
}
.card-description h3 {
    margin: 0 0 10px 0;
    color: var(--color-primary);
}
.card-description p {
    margin: 0;
    flex-grow: 1;
    font-size: var(--font-size-default);
}
.blog-detail-view { color: white; }
.blog-header {
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-template-rows: auto auto;
  gap: var(--size-default);
  align-items: center;
  margin-bottom: 20px;
}
.back-button {
  grid-column: 1 / -1;
  justify-self: start;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-default);
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
  grid-column: 2 / 3;
  grid-row: 2 / 3;
}
.summary-container h2 {
    color: var(--color-primary);
    margin: 0 0 10px 0;
}
.blog-content {
  line-height: 1.8;
  margin: 20px 0;
  p {
    font-size: var(--font-size-default);
  }
}
hr {
  border: none;
  border-top: 1px solid var(--color-gray);
  margin: 30px 0;
}
.blog-navigation {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-default);
}
.blog-navigation button {
    background-color: #333;
    border: 1px solid var(--color-gray);
    padding: 8px 12px;
    font-size: inherit;
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
    background-color: #2f1d58;
    border-radius: var(--border-radius);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s;
}
.card-container-small:hover { transform: scale(1.05); }
.img-container-small img {
    width: 100%;
    height: 120px;
    object-fit: cover;
}
.card-description-small { padding: var(--size-default); color: white; }
.card-description-small h4 {
    margin: 0;
    font-size: var(--font-size-default);
    color: var(--color-primary);
}
@media (max-width: 1024px) {
  .contents-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, minmax(250px, auto));
  }
}
@media (max-width: 768px) {
  .home-container {
    flex-direction: column;
    height: auto;
    /* 뷰포트가 작아질 때는 .home-container 자체의 높이 제한을 해제 */
    min-height: 100vh;
  }
  .sidebar {
    width: 100%;
    height: auto;
    border-bottom: 1px solid var(--color-gray);
    position: static; /* 스크롤 시 사라지도록 static으로 변경 */
    height: auto; /* 모바일에서는 높이 자동 조정 */
    overflow-y: visible; /* 스크롤바 비활성화 */
  }
  .sidebar h3 {
    display: none; /* h3 카테고리 label 사라짐 */
  }
  .sidebar ul {
    display: flex; /* sidebar 내부에 ul 을 display: flex로 가로로 정렬함. */
    flex-wrap: wrap; /* 항목이 많을 경우 줄바꿈 */
    justify-content: center; /* 가운데 정렬 */
    gap: var(--size-default); /* 항목 간 간격 */
  }
  .sidebar li {
    flex-grow: 1; /* 항목들이 가능한 공간을 채우도록 */
    max-width: 150px; /* 각 태그 버튼의 최대 너비 */
  }
  .sidebar li a {
    text-align: center;
    padding: 4px 8px;/* 패딩 조정 */
  }
  .main-content {
    height: auto;
  }
  .contents-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  .blog-header {
    grid-template-columns: 1fr;
  }
  .thumbnail-container, .summary-container {
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
</style>