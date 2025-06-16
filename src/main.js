import { createApp } from "vue";
import "./assets/styles.css"; // '.src'가 아니라 './assets'가 올바른 경로입니다.
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);

app.mount("#app");
