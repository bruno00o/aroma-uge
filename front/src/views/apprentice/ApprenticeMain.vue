<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useStudentStore } from "@/stores/student";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import { getNextDayApprentice } from "@/services/services";
import { frDateToDate, daysFromNowString } from "@/utils/utils";
import { useRouter } from "vue-router";

const studentStore = useStudentStore();
const userStore = useUserStore();
const router = useRouter();

const dataFetched = ref(false);

const nextDay = ref("");

onBeforeMount(() => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  if (studentStore.getStudentApprenticeship) {
    getNextDayApprentice(userStore.getAccessToken).then((res) => {
      nextDay.value = daysFromNowString(frDateToDate(res.date));
    });
  }

  loaderStore.stopLoading();
  dataFetched.value = true;
});
</script>
<template>
  <main>
    <section v-if="dataFetched">
      <h2>Prochain jour en entreprise</h2>
      <h3>{{ nextDay }}</h3>
    </section>
    <section>
      <button
        class="main-button"
        @click="router.push({ name: 'apprenticeship-calendar' })"
      >
        Consulter le calendrier d'alternance
      </button>
    </section>
  </main>
</template>
