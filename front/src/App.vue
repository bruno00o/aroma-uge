<script setup lang="ts">
import LoadingIcon from "./components/icons/LoadingIcon.vue";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { useStudentStore } from "./stores/student";
import { logout } from "./services/services";
import { ref, onBeforeMount } from "vue";

const loaderStore = useLoaderStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
const router = useRouter();

const dataFetched = ref(false);

userStore.loadUser();

async function loadStudent() {
  await studentStore.loadStudent();
}

const logoutUser = () => {
  userStore.$reset();
  studentStore.$reset();
  logout();
  router.push("/login");
};

router.beforeResolve(async (to, from, next) => {
  console.log("Page change");
  if (
    to.path === "/login" ||
    to.path === "/register" ||
    to.path === "/forgot"
  ) {
    dataFetched.value = true;
    next();
    return;
  }
  loaderStore.startLoading();
  if (!userStore.checkAccessToken()) {
    userStore.updateAccessToken().catch(() => {
      logoutUser();
    });
  }
  await loadStudent();
  loaderStore.stopLoading();
  dataFetched.value = true;
  next();
});

onBeforeMount(() => {
  console.log("App.vue");
});
</script>

<template>
  <RouterView v-if="dataFetched" />
  <LoadingIcon class="loading-page" v-if="loaderStore.isLoading" />
</template>

<style lang="scss">
.loader.loading-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;

  svg {
    background-color: rgba($color: #fff, $alpha: 0.75);
    width: 70px;
    height: 70px;
    padding: 10px;
    border-radius: 10pt;
  }
}
</style>
