<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useStudentStore } from "@/stores/student";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import { getNextDayApprentice } from "@/services/services";
import { frDateToDate, daysFromNowString } from "@/utils/utils";
import { useRouter } from "vue-router";
import ToDo from "@/components/ToDo.vue";

const studentStore = useStudentStore();
const userStore = useUserStore();
const router = useRouter();

const dataFetched = ref(false);

const nextDay = ref("");

onBeforeMount(async () => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();
  if (studentStore.getStudentApprenticeship) {
    const res = await getNextDayApprentice(userStore.getAccessToken);
    nextDay.value = daysFromNowString(frDateToDate(res.date));
  }
  loaderStore.stopLoading();
  dataFetched.value = true;
});
</script>
<template>
  <main v-if="studentStore.getStudentApprenticeship">
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
    <section>
      <ToDo h2="Rappels d'apprentissage" todoType="apprenticeship" />
    </section>
  </main>
  <main v-else>
    <section>
      <h2>Vous n'êtes pas inscrit en alternance</h2>
      <button @click="router.push({ name: 'home' })" class="main-button">
        Retour à l'accueil
      </button>
    </section>
  </main>
</template>
