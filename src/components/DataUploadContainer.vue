<template>
  <section class="dashboard-container file-input-container">
    <h2>데이터 업로드</h2>
    <p class="subtitle">
      아래 방법 중 하나를 선택하여 데이터를 준비하고 업로드하세요.
    </p>

    <div class="method-container">
      <div class="method-box">
        <h3>방법 1</h3>
        <p class="description">
          '엑셀 양식 다운로드' 버튼을 눌러 양식을 받은 후 직접 작성하여 업로드
        </p>
        <div class="button-group">
          <label class="upload-btn">
            파일 첨부
            <input
              type="file"
              @change="onFileChange"
              accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
          </label>
          <a href="/template.xlsx" download class="template-btn">
            엑셀 양식 다운로드
          </a>
        </div>
        <div class="file-info" v-if="fileName">
          {{ fileName }} 파일이 준비되었습니다.
        </div>
      </div>

      <div class="method-box">
        <h3>방법 2</h3>
        <p class="description">
          사용자 정보 이미지를 AI에게 전달하여 받은 엑셀/CSV 파일을 업로드
        </p>
        <div class="button-group">
          <button class="prompt-btn" @click="showPromptModal">
            프롬프트 보기 및 복사
          </button>
        </div>
      </div>
    </div>
  </section>

  <PromptModal ref="promptModal" />
</template>

<script setup>
import { ref, defineEmits } from "vue";
// PromptAccordion 대신 PromptModal을 import 합니다.
import PromptModal from "./PromptModal.vue";

const fileName = ref("");
const emit = defineEmits(["file-uploaded"]);
// 모달 컴포넌트를 제어하기 위한 ref 생성
const promptModal = ref(null);

function onFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    fileName.value = file.name;
    emit("file-uploaded", file);
  }
}
// 모달을 여는 함수 (추가된 부분)
function showPromptModal() {
  if (promptModal.value) {
    promptModal.value.openModal();
  }
}
</script>

<style scoped>
.file-input-container {
  max-height: none;
}
.subtitle {
  text-align: center;
  margin-bottom: 24px;
  color: #666;
}
.method-container {
  display: flex;
  gap: 24px;
  width: 100%;
  flex-wrap: wrap;
}
.method-box {
  flex: 1;
  border: 1px solid var(--light-gray-color);
  border-radius: var(--border-radius);
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 300px; /* 박스의 최소 너비를 지정하여 자연스럽게 줄바꿈되도록 합니다. */
}
.method-box h3 {
  margin-top: 0;
}
.description {
  min-height: 60px; /* 설명 텍스트 높이를 맞춰줍니다. */
}
.button-group {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: auto; /* 버튼들을 아래쪽에 위치시킵니다. */
  padding-top: 20px;
  flex-wrap: wrap; /* << 이 속성을 추가했습니다 */
}
.file-info {
  margin-top: 16px;
  font-size: 14px;
  color: #666;
  height: 20px; /* 파일 정보가 없을 때도 높이를 차지하도록 설정 */
}
.prompt-btn {
  background-color: var(--secondary-color);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  width: 100%;
}
.prompt-btn:hover {
  background-color: #2c3e50;
}

/* 버튼 스타일 (기존 FileInputContainer에서 가져옴) */
.upload-btn {
  background-color: var(--primary-color);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  width: 100%;
}
.upload-btn input[type="file"] {
  display: none;
}
.template-btn {
  background-color: #6c757d;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s ease;
  width: 100%;
}
.template-btn:hover {
  background-color: #5a6268;
}
</style>
