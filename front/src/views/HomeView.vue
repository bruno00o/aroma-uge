<script setup lang="ts">
import MainHeader from "@/components/header/MainHeader.vue";
import MobileNav from "@/components/nav/TheNav.vue";
import { useLoaderStore } from "@/stores/loader";
import { useStudentStore } from "@/stores/student";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import { getNextEventApprentice } from "@/services/services";
import {
  frDateToDate,
  daysFromNowString,
  eventToNiceString,
} from "@/utils/utils";
import NextClass from "@/components/university/NextClass.vue";

const studentStore = useStudentStore();
const userStore = useUserStore();

const dataFetched = ref(false);

const nextDay = ref("");
const nextEvent = ref("");

onBeforeMount(async () => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();
  if (studentStore.getStudentApprenticeship) {
    const res = await getNextEventApprentice(userStore.getAccessToken);
    nextDay.value = daysFromNowString(frDateToDate(res.date));
    nextEvent.value = eventToNiceString(res.event);
  }
  loaderStore.stopLoading();
  dataFetched.value = true;
});

const firstName = studentStore.getStudentFirstName;
const lastName = studentStore.getStudentLastName;
</script>

<template>
  <MainHeader small="Bienvenue" v-bind:h1="`${firstName} ${lastName}`" />
  <main v-if="studentStore.getStudentApprenticeship">
    <section v-if="dataFetched">
      <h2>{{ nextDay }}</h2>
      <h3>{{ nextEvent }}</h3>
    </section>
    <section v-if="dataFetched && nextEvent === 'À l\'université'">
      <NextClass />
    </section>
  </main>
  <MobileNav />
</template>
