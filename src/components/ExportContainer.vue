<template>
  <section class="dashboard-container export-container">
    <h3>데이터 내보내기</h3>
    <p class="subtitle">현재 대시보드 화면을 PDF로 저장하세요.</p>
    <button @click="exportToPdf" class="export-btn">PDF 리포트 저장</button>
  </section>
</template>

<script setup>
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// PDF 내보내기 함수
async function exportToPdf() {
  // 1. PDF로 변환할 DOM 요소를 선택합니다.
  const reportContent = document.getElementById("dashboard-content");
  if (!reportContent) {
    alert("내보낼 데이터가 없습니다.");
    return;
  }

  try {
    // 2. html2canvas를 사용해 선택한 요소를 canvas로 변환합니다.
    const canvas = await html2canvas(reportContent, {
      scale: 2, // 해상도를 2배로 높여 더 선명한 이미지를 얻습니다.
      useCORS: true, // CORS 이슈가 발생할 수 있는 이미지가 있다면 필요합니다.
    });

    // 3. 캔버스에서 이미지 데이터 URL을 얻습니다. (PNG 형식)
    const imgData = canvas.toDataURL("image/png");

    // 4. jsPDF를 사용해 새 PDF 문서를 생성합니다.
    // A4 용지 크기 (210mm x 297mm)로 설정합니다.
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // 5. PDF에 생성 일자를 추가합니다.
    const creationDate = `Date: ${new Date().toLocaleString("ko-KR")}`;
    pdf.setFontSize(10);
    pdf.text(creationDate, 10, 10); // x: 10mm, y: 10mm 위치에 텍스트 추가

    // 6. PDF에 캡쳐한 이미지를 추가합니다.
    // 생성일자 텍스트 아래에 이미지를 위치시킵니다. (y: 15mm)
    pdf.addImage(imgData, "PNG", 0, 15, pdfWidth, pdfHeight);

    // 7. PDF 파일을 저장합니다.
    pdf.save("사용자_분석_리포트.pdf");
  } catch (error) {
    console.error("PDF 생성 중 오류가 발생했습니다:", error);
    alert("리포트 생성에 실패했습니다.");
  }
}
</script>

<style scoped>
/* 스타일은 기존과 동일합니다. */
.export-container {
  max-height: none;
  text-align: center;
  .subtitle {
    text-align: center;
    color: var(--color-gray);
    margin-block-start: 0;
    margin-block-end: 0;
    text-align: left;
  }
}
</style>
