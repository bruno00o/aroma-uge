<script setup lang="ts">
import MainHeader from "@/components/header/MainHeader.vue";
import MobileNav from "@/components/nav/TheNav.vue";
import { useLoaderStore } from "@/stores/loader";
import { useStudentStore } from "@/stores/student";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import { getNextDayUniversity } from "@/services/services";
import { frDateToDate, daysFromNowString } from "@/utils/utils";

const studentStore = useStudentStore();
const userStore = useUserStore();

const dataFetched = ref(false);

const nextDay = ref("");

onBeforeMount(() => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  if (studentStore.getStudentApprenticeship) {
    getNextDayUniversity(userStore.getAccessToken).then((res) => {
      nextDay.value = daysFromNowString(frDateToDate(res.date));
    });
  }

  loaderStore.stopLoading();
  dataFetched.value = true;
});
</script>

<template>
  <MainHeader h1="Université" />
  <main v-if="studentStore.getStudentApprenticeship">
    <section v-if="dataFetched">
      <h2>Prochain jour à l'université</h2>
      <h3>{{ nextDay }}</h3>
    </section>
  </main>
  <MobileNav />
</template>
