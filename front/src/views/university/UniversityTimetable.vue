<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import "v-calendar/dist/style.css";
import BackButton from "@/components/icons/BackButton.vue";
import { getWeekTimetable } from "@/services/services";
import {
  bestMonday,
  urlFrDate,
  dateToShortFrDate,
  previousMonday,
  nextMonday,
  getMondayByDate,
  frDateToDate,
} from "@/utils/utils";
import TheClass from "@/components/university/TheClass.vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const dataFetched = ref(false);
const timetable = ref({} as any);

const monday = ref(bestMonday(new Date()));
const previousWeek = ref(true);

const dayOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const dateByDay = (date: Date, day: string) => {
  const dateCopy = new Date(date);
  const dayIndex = dayOfWeek.indexOf(day);
  dateCopy.setDate(date.getDate() + dayIndex);
  return dateCopy;
};

const isEmptyTimetable = (timetable: any) => {
  for (const day in timetable) {
    if (timetable[day].length > 0) {
      return false;
    }
  }
  return true;
};

const checkPreviousWeek = async () => {
  const bestMondayCopy = new Date(monday.value);
  const prevMonday = previousMonday(bestMondayCopy);
  if (prevMonday < new Date()) {
    const timetable = await getWeekTimetable(
      userStore.getAccessToken,
      urlFrDate(prevMonday)
    );
    previousWeek.value = !isEmptyTimetable(timetable);
  } else {
    previousWeek.value = true;
  }
};

const loadTimeTable = async () => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  const res = await getWeekTimetable(
    userStore.getAccessToken,
    urlFrDate(monday.value)
  );
  timetable.value = res;

  await checkPreviousWeek();

  loaderStore.stopLoading();
  dataFetched.value = true;
};

onBeforeMount(async () => {
  await loadTimeTable();

  let date: any = router.currentRoute.value.params.date;

  if (date) {
    date = date.replace(/-/g, "/");
    monday.value = getMondayByDate(frDateToDate(date));
    dataFetched.value = false;
    await loadTimeTable();
    document.getElementById(date)?.scrollIntoView();
  }
});
</script>

<template>
  <main>
    <section v-if="dataFetched">
      <h2>
        <BackButton />
        Emploi du temps
      </h2>
      <h3>Semaine du {{ dateToShortFrDate(monday) }}</h3>
      <div class="buttons">
        <button
          class="main-button"
          @click="
            (monday = previousMonday(monday)),
              (dataFetched = false),
              loadTimeTable()
          "
          :disabled="!previousWeek"
        >
          <span>Précédente</span>
        </button>
        <button
          class="main-button"
          @click="
            (monday = nextMonday(monday)),
              (dataFetched = false),
              loadTimeTable()
          "
        >
          <span>Suivante</span>
        </button>
      </div>
    </section>
    <section v-if="dataFetched" class="timetable">
      <div v-if="isEmptyTimetable(timetable)">
        <h3>Aucun cours cette semaine</h3>
        <p>C'est peut-être les vacances</p>
      </div>
      <div v-else>
        <div v-for="day in Object.keys(timetable)" :key="day">
          <div v-if="timetable[day].length > 0">
            <h3 :id="dateToShortFrDate(dateByDay(monday, day))">
              {{ day }} - {{ dateToShortFrDate(dateByDay(monday, day)) }}
            </h3>
            <TheClass
              class="class"
              v-for="lesson in timetable[day]"
              :key="lesson.start"
              :start="lesson.start"
              :end="lesson.end"
              :summary="lesson.summary"
              :location="lesson.location"
              :description="lesson.description"
            />
          </div>
        </div>
      </div>
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

  h3 {
    color: var(--main-text-color);
    margin-bottom: 0.5em;
  }

  div.buttons {
    display: flex;
    gap: 1em;

    button {
      width: 100%;

      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}

#app main section.timetable {
  display: flex;
  flex-direction: column;
  gap: 1em;

  h3 {
    margin-bottom: 0.5em;
    color: var(--main-text-color);
  }

  .class {
    margin-bottom: 0.5em;
  }
}
</style>
