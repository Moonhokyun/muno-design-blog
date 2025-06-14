<template>
  <section class="dashboard-container file-input-container">
    <h2>데이터 업로드</h2>
    <p>분석할 사용자 데이터가 담긴 PDF 파일을 업로드하세요.</p>
    <label class="upload-btn">
      파일 첨부
      <input type="file" @change="onFileChange" accept=".pdf" />
    </label>
    <div class="file-info" v-if="fileName">
      {{ fileName }} 파일이 준비되었습니다.
    </div>
  </section>
</template>

<script setup>
import { defineEmits, defineProps } from "vue";
const props = defineProps({ fileName: String });
const emit = defineEmits(["file-uploaded"]);

function onFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    emit("file-uploaded", file);
  }
}
</script>
