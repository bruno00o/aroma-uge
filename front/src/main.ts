import { createApp } from "vue";
import { createPinia } from "pinia";
import { changeTheme, getSavedTheme } from "./utils/utils";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};
window.addEventListener("resize", appHeight);
appHeight();

changeTheme(getSavedTheme() || "--bleu-theme");

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
