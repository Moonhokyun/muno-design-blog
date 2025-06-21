import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import ContactView from "../views/ContactView.vue";
import DashboardView from "../views/DashboardView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: {
      title: "Muno's Design Blog",
      description:
        "디자인 작업을 하며 얻은 인사이트, 취미, 포트폴리오를 공유하는 공간입니다.",
      ogImage: "/assets/img/open-graph.png", // HomeView 전용 OG 이미지 (예시)
    },
  },
  {
    path: "/about",
    name: "About",
    component: AboutView,
    meta: {
      title: "소개",
      description: "저를 소개해요",
      ogImage: "/assets/img/open-graph.png", // AboutView 전용 OG 이미지 (예시)
    },
  },
  {
    path: "/contact",
    name: "Contact",
    component: ContactView,
    meta: {
      title: "문의",
      description: "저에게 연락할 수 있습니다",
      ogImage: "/assets/img/open-graph.png", // ContactView 전용 OG 이미지 (예시)
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: {
      title: "사용자 데이터 분석 대시보드",
      description:
        "사용자 데이터를 업로드하고, 차트 및 테이블로 분석 결과를 확인하며, PDF 리포트로 내보낼 수 있는 대시보드입니다.",
      ogImage: "/assets/img/open-graph.png", // DashboardView 전용 OG 이미지 (예시)
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // 기본 타이틀 및 설명 설정
  document.title = to.meta.title
    ? `${to.meta.title} | Muno's design blog`
    : "Muno's design blog"; //
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", to.meta.description || "기본 설명"); //

  // Open Graph 이미지 업데이트
  const ogImageTag = document.querySelector('meta[property="og:image"]'); //
  const twitterImageTag = document.querySelector('meta[name="twitter:image"]'); //
  const ogTitleTag = document.querySelector('meta[property="og:title"]'); //
  const ogDescriptionTag = document.querySelector(
    'meta[property="og:description"]'
  ); //
  const ogUrlTag = document.querySelector('meta[property="og:url"]'); //

  // 라우트 메타에 ogImage가 있으면 사용, 없으면 index.html에 설정된 기본 이미지 (public/assets/img/open-graph.png)
  const currentOgImage = to.meta.ogImage || "/assets/img/open-graph.png"; //
  const currentOgTitle = to.meta.title
    ? `${to.meta.title} | Muno's design blog`
    : "Muno's design blog"; //
  const currentOgDescription = to.meta.description || "기본 설명"; //
  const currentOgUrl = window.location.origin + to.fullPath; //

  if (ogImageTag) {
    ogImageTag.setAttribute("content", currentOgImage); //
  } else {
    const newOgImageTag = document.createElement("meta");
    newOgImageTag.setAttribute("property", "og:image");
    newOgImageTag.setAttribute("content", currentOgImage);
    document.head.appendChild(newOgImageTag);
  }

  // Twitter Image 업데이트 (OG Image와 동일하게 설정)
  if (twitterImageTag) {
    twitterImageTag.setAttribute("content", currentOgImage); //
  } else {
    const newTwitterImageTag = document.createElement("meta");
    newTwitterImageTag.setAttribute("name", "twitter:image");
    newTwitterImageTag.setAttribute("content", currentOgImage);
    document.head.appendChild(newTwitterImageTag);
  }

  // Open Graph 제목 및 설명 업데이트
  if (ogTitleTag) ogTitleTag.setAttribute("content", currentOgTitle); //
  if (ogDescriptionTag)
    ogDescriptionTag.setAttribute("content", currentOgDescription); //
  if (ogUrlTag) ogUrlTag.setAttribute("content", currentOgUrl); //

  next();
});

export default router;
