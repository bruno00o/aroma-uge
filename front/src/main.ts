import { createApp } from "vue";
import { createPinia } from "pinia";
import { changeTheme, getSavedTheme } from "./utils/utils";
import cloneDeep from "lodash.clonedeep";
import SetupCalendar from "v-calendar";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { useUserStore } from "./stores/user";
import { useStudentStore } from "./stores/student";

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

const startApp = async () => {
  const app = createApp(App);

  const pinia = createPinia();
  pinia.use(({ store }) => {
    const initialState = cloneDeep(store.$state);
    store.$reset = (): void => store.$patch(cloneDeep(initialState));
  });
  pinia.use(piniaPluginPersistedState);
  app.use(pinia);
  app.use(router);
  app.use(SetupCalendar, {});

  const userStore = useUserStore();

  if (!userStore.checkAccessToken()) {
    try {
      await userStore.updateAccessToken();
    } catch (error) {
      const studentStore = useStudentStore();
      userStore.$reset();
      studentStore.$reset();
      router.push({ name: "login" });
    }
  }

  app.mount("#app");
};

startApp();
