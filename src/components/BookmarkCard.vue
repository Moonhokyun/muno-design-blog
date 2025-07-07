<template>
  <div class="notion-bookmark-block">
    <div v-if="loading" class="notion-bookmark-loading">
      메타데이터 불러오는 중...
    </div>
    <div v-else-if="error" class="notion-bookmark-error">
      메타데이터를 불러오지 못했습니다.
    </div>
    <div v-else class="notion-bookmark-content-wrapper">
      <div class="notion-bookmark-content">
        <div class="notion-bookmark-title">
          {{ meta.title || "제목 정보 없음" }}
        </div>
        <div class="notion-bookmark-description">
          {{ meta.description || "설명 정보 없음" }}
        </div>
        <a
          class="notion-bookmark-url"
          :href="meta.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ meta.url }}
        </a>
      </div>
      <div class="notion-bookmark-image">
        <img
          :src="meta.image || defaultImage"
          alt="대표 이미지"
          @error="onImgError"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BookmarkCard",
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      meta: {},
      loading: true,
      error: false,
      defaultImage: "/default-image.png",
      imageError: false,
    };
  },
  watch: {
    url: {
      immediate: true,
      handler(newUrl) {
        this.fetchMeta(newUrl);
      },
    },
  },
  methods: {
    async fetchMeta(url) {
      this.loading = true;
      this.error = false;
      this.meta = {};
      this.imageError = false;
      try {
        const response = await fetch("/api/fetch-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (!response.ok) throw new Error("API 실패");
        const data = await response.json();
        this.meta = data;
      } catch (e) {
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    onImgError(e) {
      if (!this.imageError) {
        this.imageError = true;
        e.target.src = this.defaultImage;
      }
    },
  },
};
</script>

<style scoped>
.notion-bookmark-block {
  display: flex;
  align-items: stretch;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  max-width: 500px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin: 16px 0;
}
.notion-bookmark-content-wrapper {
  display: flex;
  width: 100%;
}
.notion-bookmark-content {
  flex: 1 1 0;
  padding: 16px;
  min-width: 0;
}
.notion-bookmark-title {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 8px;
  color: #222;
}
.notion-bookmark-description {
  font-size: 0.95em;
  color: #555;
  margin-bottom: 12px;
  min-height: 36px;
}
.notion-bookmark-url {
  font-size: 0.9em;
  color: #1976d2;
  word-break: break-all;
}
.notion-bookmark-image {
  width: 120px;
  min-width: 120px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notion-bookmark-image img {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
  border-radius: 0 8px 8px 0;
}
.notion-bookmark-loading,
.notion-bookmark-error {
  padding: 24px;
  color: #888;
  text-align: center;
  width: 100%;
}
</style>
