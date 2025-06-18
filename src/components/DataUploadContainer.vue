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
          사용자 정보 이미지를 AI에게 전달하여 받은 엑셀 파일을 업로드
        </p>
        <div class="button-group">
          <button class="prompt-btn" @click="showPromptModal">
            프롬프트 보기 및 복사
          </button>
        </div>
      </div>
    </div>

    <div class="dummy-link-wrapper">
      <a href="#" @click.prevent="loadDummy" class="dummy-data-link">
        또는, 예시 데이터로 둘러보기
      </a>
    </div>
  </section>

  <PromptModal ref="promptModal" />
</template>

<script setup>
import { ref, defineEmits } from "vue";
import PromptModal from "./PromptModal.vue";

const fileName = ref("");
const emit = defineEmits(["file-uploaded", "load-dummy-data"]);

const promptModal = ref(null);

function onFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    fileName.value = file.name;
    emit("file-uploaded", file);
  }
}

function showPromptModal() {
  if (promptModal.value) {
    promptModal.value.openModal();
  }
}

function loadDummy() {
  emit("load-dummy-data");
}
</script>

<style scoped>
.subtitle {
  text-align: center;
  color: var(--color-gray);
  margin-block-start: 0;
  margin-block-end: 0;
  text-align: left;
}
.method-container {
  display: flex;
  gap: var(--size-default);
  width: 100%;
  flex-wrap: wrap;
}
.method-box {
  flex: 1;
  border: 1px solid var(--color-gray);
  border-radius: var(--border-radius);
  padding: var(--size-default);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  max-width: 300px; /* 최대 너비 지정 */
}
.method-box h3 {
  margin-top: 0;
}
.description {
  min-height: 60px;
  flex-grow: 1;
}
.button-group {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: var(--size-default);
  margin-top: auto;
  padding-top: 20px;
  flex-wrap: nowrap;
}
.file-info {
  margin-top: 16px;
  color: var(--color-gray);
  height: 20px;
}
.prompt-btn,
.upload-btn,
.template-btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s ease;
  border: none;
  text-decoration: none;
  color: white;
}
.prompt-btn {
  background-color: var(--color-primary);
  width: 100%;
}
.prompt-btn:hover {
  background-color: #2c3e50;
}

.template-btn {
  background-color: #6c757d;
  display: inline-block;
}
.template-btn:hover {
  background-color: #5a6268;
}
.dummy-link-wrapper {
  text-align: center;
}
.dummy-data-link {
  font-size: 14px;
  color: var(--secondary-color);
  text-decoration: underline;
  cursor: pointer;
}
.dummy-data-link:hover {
  color: var(--primary-color);
}
/* 뷰포트 너비가 650px 이하일 때 적용될 스타일 */
@media (max-width: 650px) {
  .method-box {
    max-width: unset;
    flex-basis: 100%;
    padding: var(--size-default);
    .button-group {
      flex-direction: column;
      align-items: center;
      .upload-btn,
      .template-btn {
        width: 100%;
        text-align: center;
        box-sizing: border-box;
      }
    }
  }
}
@media (max-width: 480px) {
  .method-container {
    flex-direction: column;
    align-items: center;
    .method-box {
      min-width: unset;
    }
  }
}
</style>
