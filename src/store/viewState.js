import { reactive } from "vue";

// 다른 컴포넌트에서 HomeView의 상태를 초기화할 수 있도록 함수를 담는 공간
export const viewState = reactive({
  // HomeView.vue 컴포넌트가 마운트될 때,
  // 이 함수를 자신의 초기화 함수로 덮어쓸 예정입니다.
  resetHomeView: () => {},
});