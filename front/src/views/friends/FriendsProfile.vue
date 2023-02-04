<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  getFriendNextClass,
  getFriends,
  deleteFriend,
} from "@/services/services";
import { useUserStore } from "@/stores/user";
import { useLoaderStore } from "@/stores/loader";
import { ref, onBeforeMount } from "vue";
import TheClass from "@/components/university/TheClass.vue";
import BackButton from "@/components/icons/BackButton.vue";

const router = useRouter();
const userStore = useUserStore();
const loaderStore = useLoaderStore();

const { id } = router.currentRoute.value.params;

const dataFetched = ref(false);
const nextClass = ref({} as any);
const friend = ref({} as any);
const deleteFriendModal = ref(false);

onBeforeMount(async () => {
  loaderStore.startLoading();
  const res = await getFriendNextClass(userStore.getAccessToken, id as string);
  nextClass.value = res;
  const res2 = await getFriends(userStore.getAccessToken);
  friend.value = res2[id as string];
  dataFetched.value = true;
  loaderStore.stopLoading();
});

const toggleDropdown = () => {
  const dropdown = document.querySelector(".delete-friend");
  dropdown?.classList.toggle("show");
};

const deletedFriend = async () => {
  await deleteFriend(userStore.getAccessToken, id as string);
  router.push("/friends");
};
</script>
<template>
  <main>
    <section v-if="dataFetched" class="header-profile">
      <h2>
        <BackButton />
        {{
          friend.PRENOM.charAt(0).toUpperCase() +
          friend.PRENOM.slice(1).toLowerCase()
        }}
        {{
          friend.NOM.charAt(0).toUpperCase() + friend.NOM.slice(1).toLowerCase()
        }}
      </h2>
      <button @click="toggleDropdown">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512">
          <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
          <path
            d="M64 360c30.9 0 56 25.1 56 56s-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56zm0-160c30.9 0 56 25.1 56 56s-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56zM120 96c0 30.9-25.1 56-56 56S8 126.9 8 96S33.1 40 64 40s56 25.1 56 56z"
          />
        </svg>
      </button>
      <div class="delete-friend" @click="deleteFriendModal = true">
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
            <path
              d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
            />
          </svg>
          <p>
            Supprimer
            {{
              friend.PRENOM.charAt(0).toUpperCase() +
              friend.PRENOM.slice(1).toLowerCase()
            }}
            de mes amis
          </p>
        </button>
      </div>
    </section>
    <section v-if="dataFetched">
      <h2>Son prochain cours</h2>
      <TheClass
        :start="nextClass.start"
        :end="nextClass.end"
        :summary="nextClass.summary"
        :location="nextClass.location"
        :description="nextClass.description"
        :date="true"
      />
    </section>
    <section v-if="dataFetched">
      <RouterLink
        :to="{ name: 'friends-profile-timetable', params: { id } }"
        class="main-button"
      >
        <p>Consulter son emploi du temps</p>
      </RouterLink>
    </section>
  </main>
  <div class="modal" v-if="deleteFriendModal">
    <div class="modal-content">
      <h2>Supprimer un ami</h2>
      <p>
        Voulez-vous vraiment supprimer
        {{
          friend.PRENOM.charAt(0).toUpperCase() +
          friend.PRENOM.slice(1).toLowerCase()
        }}
        de vos amis ?
      </p>
      <div class="modal-buttons">
        <button @click="(deleteFriendModal = false), toggleDropdown()">
          Annuler
        </button>
        <button @click="deletedFriend()">Supprimer</button>
      </div>
    </div>
    <div
      class="modal-background"
      @click="(deleteFriendModal = false), toggleDropdown()"
    ></div>
  </div>
</template>

<style scoped lang="scss">
#app main section:first-of-type {
  h2:first-of-type {
    display: flex;
    align-items: center;
    gap: 0.5em;

    button {
      background-color: var(--primary-color);
    }
  }
}

.header-profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row !important;
  gap: 0.5em;
  margin-bottom: 1em;
  position: relative;

  button {
    background: none;
    border: none;
    cursor: pointer;
    svg {
      width: 1.5em;
      height: 1.5em;
      fill: var(--main-text-color);
    }
  }

  .delete-friend {
    background-color: var(--primary-color);
    border-radius: 0.5em;
    padding: 0.5em;
    position: absolute;
    right: 0;
    top: 100%;
    overflow: hidden;
    pointer-events: none;
    transform: scale(0);
    transition: transform 0.2s ease-in-out;
    transform-origin: top right;

    button {
      display: flex;
      align-items: center;
      gap: 0.5em;
      background: none;
      border: none;
      cursor: pointer;
      svg {
        width: 1em;
        height: 1em;
        fill: var(--main-text-color);
      }
    }

    p {
      font-size: 1em;
      color: var(--main-text-color);
    }

    &.show {
      transform: scale(1);
      visibility: visible;
      pointer-events: all;
      cursor: pointer;

      &:hover {
        background-color: var(--primary-color-hover);
      }
    }
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .modal-content {
    background-color: var(--primary-color);
    border-radius: 0.5em;
    padding: 1em;
    width: 100%;
    max-width: 95%;
    display: flex;
    flex-direction: column;
    gap: 1em;

    h2 {
      font-size: 1.25em;
      color: var(--main-text-color);
    }

    p {
      font-size: 1em;
      color: var(--main-text-color);
    }

    .modal-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1em;

      button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1em;
        color: white;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        transition: background-color 0.2s ease-in-out;

        &:hover {
          background-color: var(--primary-color-hover);
        }

        &:first-of-type {
          background-color: var(--success-color);
        }

        &:last-of-type {
          background-color: var(--error-color);
        }
      }
    }
  }

  .modal-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
}
</style>
