import { createApp } from "vue";
import { createPinia } from "pinia";
import { changeTheme, getSavedTheme } from "./utils/utils";
import SetupCalendar from "v-calendar";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const appHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--app-height", `${window.innerHeight}px`);
};
window.addEventListener("resize", appHeight);
appHeight();

const { theme, color } = getSavedTheme();

if (theme && color) {
  changeTheme(theme, color);
}

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(SetupCalendar, {});

app.mount("#app");
