<script setup lang="ts">
import LoadingIcon from "./components/icons/LoadingIcon.vue";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useRequestsStore } from "./stores/requests";
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useStudentStore } from "./stores/student";

const loaderStore = useLoaderStore();
const userStore = useUserStore();
const requestsStore = useRequestsStore();
const studentStore = useStudentStore();
const router = useRouter();

const dataFetched = ref(true);

onBeforeMount(async () => {
  loaderStore.startLoading();
  if (userStore.isAuthenticated) {
    await requestsStore.loadFriendsRequests(userStore.getAccessToken);
  }
  loaderStore.stopLoading();
  dataFetched.value = true;
});

router.beforeEach(async (to, from, next) => {
  if (to.name === "login" || to.name === "register" || to.name === "forgot") {
    next();
  } else {
    if (!userStore.checkAccessToken()) {
      try {
        await userStore.updateAccessToken();
        next();
      } catch (error) {
        userStore.$reset();
        studentStore.$reset();
        requestsStore.$reset();
        next({ name: "login" });
      }
    } else {
      next();
    }
  }
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
