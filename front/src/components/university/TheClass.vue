<script setup lang="ts">
import {
  timeToFrTime,
  dateToFrDate,
  frDateToDate,
  urlFrDate,
} from "@/utils/utils";
import { useRouter } from "vue-router";

let props = defineProps<{
  start: string;
  end: string;
  summary: string;
  location: string;
  description: string;
  date?: boolean;
  push?: boolean;
}>();

const router = useRouter();

const getColor = () => {
  if (props.summary.includes("CM")) {
    return "var(--timetable-cours)";
  } else if (props.summary.includes("TD")) {
    return "var(--timetable-td)";
  } else if (props.summary.includes("TP")) {
    return "var(--timetable-tp)";
  } else if (props.summary.includes("Exam")) {
    return "var(--timetable-exam)";
  } else {
    return "var(--timetable-autre)";
  }
};
</script>

<template>
  <div
    @click="
      push
        ? router.push({
            name: 'university-timetable-date',
            params: { date: urlFrDate(frDateToDate(props.start)) },
          })
        : null
    "
    :style="`background-color: ${getColor()}`"
    :class="push ? 'next-class' : ''"
  >
    <p v-if="date" class="date">
      {{ dateToFrDate(frDateToDate(props.start)) }}
    </p>
    <p class="date">
      {{ timeToFrTime(frDateToDate(props.start)) }} -
      {{ timeToFrTime(frDateToDate(props.end)) }}
    </p>
    <p class="main">{{ props.summary }}</p>
    <p>{{ props.location }}</p>
    <p>{{ props.description }}</p>
  </div>
</template>

<style scoped lang="scss">
div {
  background-color: var(--timetable-autre);
  padding: 0.8em 1em;
  border-radius: 0.5em;
  display: flex;
  flex-direction: column;
  gap: 0.1em;

  p {
    font-weight: 600;
    color: white;
  }

  .main {
    font-size: 1.2rem;
    margin: 0.1em 0;
  }

  .date {
    font-size: 0.9rem;
    opacity: 0.7;
  }

  &.next-class {
    cursor: pointer;
    margin: 0.25em 0;
  }
}
</style>
