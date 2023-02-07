<script setup lang="ts">
import LoadingIcon from "./components/icons/LoadingIcon.vue";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useRequestsStore } from "./stores/requests";
import { ref, onBeforeMount } from "vue";

const loaderStore = useLoaderStore();
const userStore = useUserStore();
const requestsStore = useRequestsStore();

const dataFetched = ref(true);

onBeforeMount(async () => {
  loaderStore.startLoading();
  if (userStore.isAuthenticated) {
    await requestsStore.loadFriendsRequests(userStore.getAccessToken);
  }
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
