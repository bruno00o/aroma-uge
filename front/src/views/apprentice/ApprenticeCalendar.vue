<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useStudentStore } from "@/stores/student";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import { getCalendarApprentice } from "@/services/services";
import {
  frDateToDate,
  eventToNiceString,
  dateToShortFrDate,
} from "@/utils/utils";
import { useRouter } from "vue-router";
import { DatePicker } from "v-calendar";
import "v-calendar/dist/style.css";
import BackButton from "@/components/icons/BackButton.vue";

const studentStore = useStudentStore();
const userStore = useUserStore();
const router = useRouter();

const dataFetched = ref(false);
const calendar: any = ref([]);
const date = ref(new Date());

const selectedAttributes = ref({
  highlight: {
    fillMode: "outline",
  },
});

const getColorEvent = (event: string) => {
  switch (event) {
    case "Cours":
      return "blue";
    case "Entreprise":
      return "green";
    case "F":
      return "red";
  }
};

const getEvent = (date: Date) => {
  const dateString = dateToShortFrDate(date);
  for (let key in calendar.value) {
    if (dateString === dateToShortFrDate(calendar.value[key].dates)) {
      return calendar.value[key].key;
    }
  }
  return "Aucun événement";
};

onBeforeMount(async () => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  if (studentStore.getStudentApprenticeship) {
    const res = await getCalendarApprentice(userStore.getAccessToken);
    for (let key in res) {
      let date = frDateToDate(key);
      let color = getColorEvent(res[key]);
      let event = eventToNiceString(res[key]);
      calendar.value.push({
        key: event,
        highlight: {
          color: color,
          fillMode: "light",
        },
        dates: date,
      });
    }
  }

  loaderStore.stopLoading();
  dataFetched.value = true;
});
</script>

<template>
  <main v-if="studentStore.getStudentApprenticeship">
    <section v-if="dataFetched">
      <h2>
        <BackButton />
        Calendrier d'alternance
      </h2>
      <DatePicker
        :selected-attributes="selectedAttributes"
        :attributes="calendar"
        v-model="date"
        :is-expanded="true"
        :locale="{
          firstDayOfWeek: 2,
          weekdays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        }"
      />
      <h2>{{ dateToShortFrDate(date) }}</h2>
      <h3>{{ getEvent(date) }}</h3>
    </section>
    <section v-if="dataFetched">
      <h2>Légende</h2>
      <div class="caption university">
        <p>Université</p>
      </div>
      <div class="caption apprenticeship">
        <p>Entreprise</p>
      </div>
      <div class="caption holiday">
        <p>Férié</p>
      </div>
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

<style scoped lang="scss">
#app main section {
  h2:first-of-type {
    margin-bottom: 1em;
    display: flex;
    align-items: center;
    gap: 0.5em;
  }

  .vc-container {
    margin-bottom: 1em;
  }
}

.caption {
  display: flex;
  align-items: center;

  &::before {
    content: "";
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: 0.5em;
    border-radius: 50%;
  }

  &:not(:last-of-type) {
    margin-bottom: 0.5em;
  }
}

.caption.university {
  &::before {
    background-color: #4a90e2;
  }
}

.caption.apprenticeship {
  &::before {
    background-color: #7ed321;
  }
}

.caption.holiday {
  &::before {
    background-color: #d0021b;
  }
}
</style>
