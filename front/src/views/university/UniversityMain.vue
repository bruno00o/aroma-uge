<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useStudentStore } from "@/stores/student";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import { getNextDayUniversity } from "@/services/services";
import { frDateToDate, daysFromNowString } from "@/utils/utils";
import NextClass from "@/components/university/NextClass.vue";
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
    const res = await getNextDayUniversity(userStore.getAccessToken);
    nextDay.value = daysFromNowString(frDateToDate(res.date));
  }

  loaderStore.stopLoading();
  dataFetched.value = true;
});
</script>
<template>
  <main v-if="studentStore.getStudentApprenticeship">
    <section v-if="dataFetched">
      <h2>Prochain jour à l'université</h2>
      <h3>{{ nextDay }}</h3>
    </section>
    <NextClass />
    <section v-if="dataFetched">
      <button
        class="main-button"
        @click="router.push({ name: 'university-timetable' })"
      >
        Consulter l'emploi du temps complet
      </button>
    </section>
    <section>
      <ToDo h2="Rappels université" todoType="university" />
    </section>
  </main>
  <main v-else>
    <NextClass />
    <section v-if="dataFetched">
      <button
        class="main-button"
        @click="router.push({ name: 'university-timetable' })"
      >
        Consulter l'emploi du temps complet
      </button>
    </section>
    <section>
      <ToDo h2="Rappels" todoType="university" />
    </section>
  </main>
</template>

<style scoped lang="scss">
.next-class {
  margin-bottom: 1em !important;
}
</style>
