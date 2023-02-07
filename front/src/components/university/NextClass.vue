<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { useLoaderStore } from "@/stores/loader";
import { ref, onBeforeMount } from "vue";
import { getNextClass } from "@/services/services";
import TheClass from "./TheClass.vue";

const userStore = useUserStore();

const dataFetched = ref(false);

const nextClass = ref({
  start: "",
  end: "",
  summary: "",
  location: "",
  description: "",
});

onBeforeMount(async () => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  const res = await getNextClass(userStore.getAccessToken);
  nextClass.value = res;

  loaderStore.stopLoading();
  dataFetched.value = true;
});
</script>

<template>
  <section v-if="dataFetched">
    <h2>Prochain cours</h2>
    <TheClass
      :start="nextClass.start"
      :end="nextClass.end"
      :summary="nextClass.summary"
      :location="nextClass.location"
      :description="nextClass.description"
      :date="true"
      :push="true"
    />
  </section>
</template>
