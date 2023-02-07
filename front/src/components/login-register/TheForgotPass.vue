<script setup lang="ts">
import LoadingIcon from "@/components/icons/LoadingIcon.vue";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { forgot } from "@/services/services";

const username = ref("");
const error = ref("");
const success = ref("");
const loading = ref(false);

const router = useRouter();

const forgotWithLoading = async () => {
  loading.value = true;
  try {
    const data = await forgot(username.value);
    success.value = data.success;
    error.value = "";
    setTimeout(() => {
      router.push("/login");
    }, 5000);
  } catch (err: any) {
    console.log(err);
    error.value = err.response.data.error;
    console.log(error.value);
    success.value = "";
  } finally {
    loading.value = false;
  }
};

const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
};
</script>

<template>
  <form @submit.prevent="forgotWithLoading">
    <div>
      Entrez votre nom d'utilisateur, un lien de réinitialisation vous sera
      envoyé par mail.
    </div>
    <div>
      <label for="username"> Nom d'utilisateur </label>
      <input
        v-model="username"
        type="text"
        name="username"
        id="username"
        required
        v-focus
      />
    </div>

    <div v-if="success">
      <p class="success-text">{{ success }}</p>
      <p class="success-text">
        Vous allez être redirigé vers la page de connexion
      </p>
    </div>

    <div v-if="error">
      <p class="error-text">{{ error }}</p>
      <p class="error-text">Veuillez réessayer</p>
    </div>

    <div v-if="loading">
      <LoadingIcon />
    </div>

    <button type="submit" name="button" class="main-button">Envoyer</button>
  </form>
  <div class="bottom-links">
    <p>
      Vous n'avez pas de compte ?
      <RouterLink to="/register"> S'inscrire </RouterLink>
    </p>
    <p>
      Vous vous souvenez de votre mot de passe ?
      <RouterLink to="/login"> Se connecter </RouterLink>
    </p>
  </div>
</template>
