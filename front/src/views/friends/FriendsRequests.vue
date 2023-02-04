<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import {
  friendsRequests,
  acceptFriendRequest,
  declineFriendRequest,
  requestFriend,
} from "@/services/services";
import BackButton from "@/components/icons/BackButton.vue";
import { useRequestsStore } from "@/stores/requests";

const dataFetched = ref(false);
const requests = ref([] as any);
const username = ref("");
const requestSuccess = ref("");
const requestError = ref("");

const loaderStore = useLoaderStore();
const userStore = useUserStore();
const requestsStore = useRequestsStore();

const getFriendsRequests = async () => {
  loaderStore.startLoading();

  const res = await friendsRequests(userStore.getAccessToken);
  requests.value = res;

  await requestsStore.loadFriendsRequests(userStore.getAccessToken);

  dataFetched.value = true;
  loaderStore.stopLoading();
};

onBeforeMount(async () => {
  await getFriendsRequests();
});

const requestAFriend = async () => {
  loaderStore.startLoading();

  requestFriend(userStore.getAccessToken, username.value)
    .then((res) => {
      requestSuccess.value = res as string;
    })
    .catch((err) => {
      requestError.value = err as string;
    });

  loaderStore.stopLoading();
};

const acceptAFriendRequest = async (username: string) => {
  loaderStore.startLoading();
  await acceptFriendRequest(userStore.getAccessToken, username);
  loaderStore.stopLoading();
  await getFriendsRequests();
};

const declineAFriendRequest = async (username: string) => {
  loaderStore.startLoading();
  await declineFriendRequest(userStore.getAccessToken, username);
  loaderStore.stopLoading();
  await getFriendsRequests();
};
</script>

<template>
  <main>
    <section v-if="dataFetched">
      <h2>
        <BackButton />
        Demandes d'amis
      </h2>
      <div v-if="requests.length > 0" class="requests">
        <div v-for="request in requests" :key="request" class="request">
          <p>{{ request }}</p>
          <div class="buttons">
            <button @click="acceptAFriendRequest(request)">Accepter</button>
            <button @click="declineAFriendRequest(request)">Refuser</button>
          </div>
        </div>
      </div>
      <div v-else class="requests">
        <p>Aucune demande d'amis</p>
      </div>
    </section>
    <section v-if="dataFetched" class="request-friend">
      <h2>Demandez un utilisateur en ami</h2>
      <form @submit.prevent="requestAFriend">
        <input type="text" placeholder="Nom d'utilisateur" v-model="username" />
        <button type="submit">Envoyer</button>
      </form>
      <p v-if="requestSuccess" class="success">{{ requestSuccess }}</p>
      <p v-if="requestError" class="error">{{ requestError }}</p>
    </section>
  </main>
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

.requests {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 1em;

  .request {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--primary-color);
    padding: 1em;
    border-radius: 0.5em;

    p {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 1em;
    }

    .buttons {
      display: flex;
      gap: 0.5em;

      button {
        border: none;
        cursor: pointer;
        padding: 0.5em 1em;
        border-radius: 0.5em;
        color: white;

        &:hover {
          background-color: var(--secondary-color);
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
}

.request-friend {
  margin-top: 2em;

  h2 {
    margin-bottom: 0.5em !important;
  }

  form {
    display: flex;
    gap: 0.5em;
    margin-bottom: 0.5em;

    input {
      flex: 1;
      padding: 0.5em;
      border: none;
      outline: none;
      border-radius: 0.5em;
      background-color: white;
    }

    button {
      border: none;
      cursor: pointer;
      padding: 0.5em 1em;
      border-radius: 0.5em;
      background-color: var(--success-color);
      color: white;
    }
  }

  .success {
    color: var(--success-color);
  }

  .error {
    color: var(--error-color);
  }
}
</style>
