<script setup lang="ts">
import LoadingIcon from "@/components/icons/LoadingIcon.vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { RouterLink } from "vue-router";

const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const router = useRouter();

const login = async () => {
  return new Promise<String>((resolve, reject) => {
    if (username.value === "" || password.value === "") {
      reject("Veuillez remplir tous les champs");
    }

    const userStore = useUserStore();

    userStore
      .login(username.value, password.value)
      .then(() => {
        router.push("/");
        resolve("Connexion réussie");
      })
      .catch((err) => {
        reject(err.response.data.error);
      });
  });
};

const loginWithLoading = async () => {
  loading.value = true;
  try {
    await login();
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
};

const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
};
</script>

<template>
  <form @submit.prevent="loginWithLoading">
    <div>
      <label for="username">
        Nom d'utilisateur <small>(prenom.nom ou email)</small>
      </label>
      <input
        v-model="username"
        type="text"
        name="username"
        id="username"
        required
        spellcheck="false"
        v-focus
      />
    </div>

    <div>
      <label for="password"> Mot de passe </label>
      <input
        v-model="password"
        type="password"
        name="password"
        id="password"
        required
      />
    </div>

    <div v-if="error">
      <p class="error-text">{{ error }}</p>
      <p class="error-text">Veuillez réessayer</p>
    </div>

    <div v-if="loading">
      <LoadingIcon />
    </div>

    <button type="submit" name="button" class="main-button">
      Se connecter
    </button>
  </form>
  <div class="bottom-links">
    <p>
      Vous n'avez pas de compte ?
      <RouterLink to="/register"> S'inscrire </RouterLink>
    </p>
    <p>
      Vous avez oublié votre mot de passe ?
      <RouterLink to="/forgot"> Réinitialiser </RouterLink>
    </p>
  </div>
</template>
