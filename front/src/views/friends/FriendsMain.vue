<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import { getFriends } from "@/services/services";
import { useRouter } from "vue-router";
import RequestsBanner from "@/components/icons/RequestsBanner.vue";

const dataFetched = ref(false);
const friends = ref({} as any);

const loaderStore = useLoaderStore();
const userStore = useUserStore();
const router = useRouter();

onBeforeMount(async () => {
  loaderStore.startLoading();
  const res = await getFriends(userStore.getAccessToken);
  friends.value = res;
  dataFetched.value = true;
  loaderStore.stopLoading();
});
</script>

<template>
  <main>
    <section v-if="dataFetched">
      <h2>
        Amis
        <button
          class="main-button"
          @click="() => router.push({ name: 'friends-requests' })"
        >
          <RequestsBanner />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
            <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
            <path
              d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
            />
          </svg>
        </button>
      </h2>
      <div class="friends">
        <div
          class="friend"
          v-for="friend in friends"
          :key="friend.EMAIL"
          @click="
            () =>
              router.push({
                name: 'friends-profile',
                params: { id: friend.EMAIL.split('@')[0] },
              })
          "
        >
          <p>
            {{
              friend.PRENOM.charAt(0).toUpperCase() +
              friend.PRENOM.slice(1).toLowerCase()
            }}
            {{
              friend.NOM.charAt(0).toUpperCase() +
              friend.NOM.slice(1).toLowerCase()
            }}
          </p>
          <button
            class="main-button"
            @click.stop="
              router.push({
                name: 'friends-profile-timetable',
                params: { id: friend.EMAIL.split('@')[0] },
              })
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
              <path
                d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
h2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-button {
  width: 2em;
  height: 2em;
  border-radius: 0.5em;
  padding: 0.3em;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  svg {
    width: 100%;
    height: 100%;
    fill: white;
  }
}

.friends {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin: 1em 0;

  .friend {
    display: flex;
    padding: 0.65em 1em;
    border-radius: 0.5em;
    background-color: var(--primary-color);
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;

    &:hover {
      background-color: var(--primary-color-hover);
    }
  }
}
</style>
