<template>
  <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-btn" @click="closeModal">&times;</button>
      <h3>이미지로 엑셀 만들기 (AI 프롬프트)</h3>
      <p>
        사용자 정보가 담긴 이미지를 AI에게 보여주고, 아래 프롬프트를 함께
        입력하면 손쉽게 엑셀 파일을 만들 수 있습니다.
      </p>
      <pre class="prompt-box">{{ promptText }}</pre>
      <button class="copy-btn" @click="copyPrompt">
        {{ copyButtonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const isModalOpen = ref(false);
const copyButtonText = ref("프롬프트 복사");
const promptText = ref(`
아래 엑셀 칼럼(열)과 예시를 참고해서, 주어진 이미지 속 사용자 정보를 엑셀 테이블로 만들어줘.

# 칼럼
| 이름 | 참여 횟수 | 최종 접속일 | 최종 참여일 | 자기소개 |

# 데이터 예시
| 김열정| 15 | 2024.10.25 | 2024.10.25 | 모임의 모든 활동에 참여하는 것을 좋아합니다. 다음 정모가 기대되네요! |
| 이꾸준| 8 | 2024.10.26 | 2024.10.20 | 꾸준히 참여하는 것이 중요하다고 생각합니다. |
`);

// 모달을 열고 닫는 함수
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};

// 부모 컴포넌트에서 openModal 함수를 호출할 수 있도록 노출
defineExpose({ openModal });

// 프롬프트 복사 기능
const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(promptText.value);
    copyButtonText.value = "복사 완료!";
    setTimeout(() => {
      copyButtonText.value = "프롬프트 복사";
    }, 2000);
  } catch (err) {
    console.error("클립보드 복사 실패:", err);
    alert("프롬프트 복사에 실패했습니다.");
  }
};

// Esc 키를 누르면 모달이 닫히도록 이벤트 리스너 추가
const handleKeydown = (e) => {
  if (e.key === "Escape" && isModalOpen.value) {
    closeModal();
  }
};
onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: var(--color-black);
  padding: 24px;
  border-radius: var(--border-radius);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  position: relative;
  text-align: left;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  border: none;
  background: none;
  font-size: 28px;
  cursor: pointer;
  color: #888;
}
.prompt-box {
  background-color: var(--color-white-opacity);
  padding: 16px;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
  max-height: 200px;
  overflow-y: auto;
}
.prompt-box::-webkit-scrollbar {
  width: 14px;
  border-radius: 10px;
}

.prompt-box::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background-color: #d4d4d4;
  background-clip: padding-box;
  border: 4px solid transparent;
}
.copy-btn {
  background-color: var(--color-primary);
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  margin-top: 16px;
  display: block; /* 버튼을 블록 요소로 만듭니다. */
  margin-left: auto; /* 오른쪽 정렬 */
}
.copy-btn:hover {
  background-color: var(--color-primary-opacity);
}
</style>
