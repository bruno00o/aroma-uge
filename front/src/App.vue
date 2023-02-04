<script setup lang="ts">
import LoadingIcon from "./components/icons/LoadingIcon.vue";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { useStudentStore } from "./stores/student";
import { useRequestsStore } from "./stores/requests";
import { ref, onBeforeMount } from "vue";

const loaderStore = useLoaderStore();
const userStore = useUserStore();
const studentStore = useStudentStore();
const requestsStore = useRequestsStore();
const router = useRouter();

const dataFetched = ref(true);

const logoutUser = () => {
  userStore.$reset();
  studentStore.$reset();
  router.push("/login");
};

onBeforeMount(async () => {
  loaderStore.startLoading();
  if (!userStore.checkAccessToken()) {
    userStore.user.accessToken = "";
    console.log("Access token expired");
    userStore.updateAccessToken().catch((err) => {
      console.log(err);
      logoutUser();
    });
  }
  await requestsStore.loadFriendsRequests(userStore.getAccessToken);
  loaderStore.stopLoading();
  dataFetched.value = true;
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
