<script setup lang="ts">
import LoadingIcon from "@/components/icons/LoadingIcon.vue";
import { register } from "@/services/services";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { RouterLink } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const success = ref("");
const loading = ref(false);

const registerWithLoading = async () => {
  loading.value = true;

  if (password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas";
    success.value = "";
    loading.value = false;
    return;
  }

  try {
    const data = await register(email.value, password.value);
    success.value = data.success;
    setTimeout(() => {
      router.push("/login");
    }, 5000);
  } catch (err: any) {
    error.value = err.response.data.error;
    success.value = "";
  } finally {
    loading.value = false;
  }
};

const validatePassword = (e: KeyboardEvent) => {
  const password = (e.target as HTMLInputElement).value;
  const checkPass = document.getElementById("checkPass");

  checkPass?.classList.add("show");

  if (checkPass) {
    const checkPassList = checkPass.getElementsByTagName("li");
    const checkPassListArray = Array.from(checkPassList);

    checkPassListArray.forEach((li) => {
      if (li.innerText === "au moins une minuscule") {
        if (/[a-z]/.test(password)) {
          li.classList.add("valid");
        } else {
          li.classList.remove("valid");
        }
      } else if (li.innerText === "au moins une majuscule") {
        if (/[A-Z]/.test(password)) {
          li.classList.add("valid");
        } else {
          li.classList.remove("valid");
        }
      } else if (li.innerText === "au moins un chiffre") {
        if (/[0-9]/.test(password)) {
          li.classList.add("valid");
        } else {
          li.classList.remove("valid");
        }
      } else if (li.innerText === "au moins 8 caractères") {
        if (password.length >= 8) {
          li.classList.add("valid");
        } else {
          li.classList.remove("valid");
        }
      }
    });
  }
};

const validatePasswordConfirm = (e: KeyboardEvent) => {
  const passwordConfirm = (e.target as HTMLInputElement).value;
  const checkPassConfirm = document.getElementById("checkPassConfirm");

  if (checkPassConfirm) {
    const checkPassConfirmList = checkPassConfirm.getElementsByTagName("li");
    const checkPassConfirmListArray = Array.from(checkPassConfirmList);

    checkPassConfirmListArray.forEach((li) => {
      if (li.innerText === "Les mots de passe ne correspondent pas") {
        if (passwordConfirm === password.value) {
          checkPassConfirm?.classList.remove("show");
        } else {
          checkPassConfirm?.classList.add("show");
        }
      }
    });
  }
};

const vFocus = {
  mounted: (el: HTMLElement) => el.focus(),
};
</script>

<template>
  <form @submit.prevent="registerWithLoading">
    <div>
      <label for="email"> Adresse email universitaire </label>
      <input
        v-model="email"
        type="text"
        name="email"
        id="email"
        required
        spellcheck="false"
        v-focus
      />
    </div>

    <div>
      <label for="password"> Mot de passe </label>
      <ul id="checkPass">
        <li>au moins une minuscule</li>
        <li>au moins une majuscule</li>
        <li>au moins un chiffre</li>
        <li>au moins 8 caractères</li>
      </ul>
      <input
        v-model="password"
        type="password"
        name="password"
        id="password"
        required
        @keyup="validatePassword($event)"
      />
    </div>

    <div>
      <label for="passwordConfirm"> Confirmer le mot de passe </label>
      <ul id="checkPassConfirm">
        <li>Les mots de passe ne correspondent pas</li>
      </ul>
      <input
        v-model="confirmPassword"
        type="password"
        name="passwordConfirm"
        id="passwordConfirm"
        required
        @keyup="validatePasswordConfirm($event)"
      />
    </div>
    <div v-if="error && !success">
      <p class="error-text">{{ error }}</p>
      <p class="error-text">Veuillez réessayer</p>
    </div>

    <div v-if="success">
      <p class="success-text">{{ success }}</p>
      <p class="success-text">
        Vous allez être redirigé vers la page de connexion
      </p>
    </div>

    <div v-if="loading">
      <LoadingIcon />
    </div>

    <button type="submit" name="button" class="main-button">S'inscrire</button>
  </form>
  <div class="bottom-links">
    <div>
      <p>
        Vous avez déjà un compte ?
        <RouterLink to="/login"> Se connecter </RouterLink>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
form {
  div {
    ul {
      display: none;
      list-style: none;
      padding: 0;
      margin-bottom: 0.5em;
      opacity: 0.75;
      font-weight: 500;

      &.show {
        display: block;
      }

      li {
        &.valid {
          color: var(--success-color);
        }
      }
    }

    #checkPassConfirm {
      color: var(--error-color);
    }
  }
}
</style>
