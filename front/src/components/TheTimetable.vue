<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import "v-calendar/dist/style.css";
import BackButton from "@/components/icons/BackButton.vue";
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
import { getFriends } from "@/services/services";

const props = defineProps<{
  weekTimetable: (
    accessToken: string,
    date: string,
    friendId?: string
  ) => Promise<any>;
}>();

const userStore = useUserStore();
const router = useRouter();

const dataFetched = ref(false);
const timetable = ref({} as any);

const monday = ref(bestMonday(new Date()));
const previousWeek = ref(true);

const friendId: string = router.currentRoute.value.params.id as string;
const friend = ref({} as any);

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
    const timetable = await props.weekTimetable(
      userStore.getAccessToken,
      urlFrDate(prevMonday),
      friendId
    );
    previousWeek.value = !isEmptyTimetable(timetable);
  } else {
    previousWeek.value = true;
  }
};

const loadTimeTable = async () => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  const res = await props.weekTimetable(
    userStore.getAccessToken,
    urlFrDate(monday.value),
    friendId
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

  if (friendId) {
    const res = await getFriends(userStore.getAccessToken);
    friend.value = res[friendId];
  }
});
</script>

<template>
  <main>
    <section v-if="dataFetched" class="timetable-selector">
      <h2 v-if="!friendId">
        <BackButton />
        Emploi du temps
      </h2>
      <h2 v-else-if="friend.PRENOM && friend.NOM">
        <BackButton />
        Emploi du temps de
        {{
          friend.PRENOM.charAt(0).toUpperCase() +
          friend.PRENOM.slice(1).toLowerCase()
        }}
      </h2>
      <!-- <h3>Semaine du {{ dateToShortFrDate(monday) }}</h3> -->
      <div class="buttons">
        <h3>Semaine du {{ dateToShortFrDate(monday) }}</h3>
        <div>
          <button
            class="main-button"
            @click="
              (monday = previousMonday(monday)),
                (dataFetched = false),
                loadTimeTable()
            "
            :disabled="!previousWeek"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
              <path
                d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
              />
            </svg>
          </button>
          <button
            class="main-button"
            @click="
              (monday = nextMonday(monday)),
                (dataFetched = false),
                loadTimeTable()
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
              <path
                d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
              />
            </svg>
          </button>
        </div>
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
    justify-content: space-between;
    align-items: center;

    h3 {
      margin-bottom: 0;
    }

    div {
      display: flex;
      gap: 1em;
    }

    button {
      width: 100%;
      max-width: 45px;
      height: 45px;

      &[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      svg {
        width: 100%;
        height: 100%;
        fill: white;
      }
    }
  }
}

#app main section.timetable-selector {
  margin-bottom: 1em;
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
