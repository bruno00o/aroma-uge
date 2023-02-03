<script setup lang="ts">
import LoginHeader from "@/components/header/LoginHeader.vue";
import TheLogin from "@/components/login-register/TheLogin.vue";
import TheRegister from "@/components/login-register/TheRegister.vue";
import TheForgotPass from "@/components/login-register/TheForgotPass.vue";

defineProps<{}>();
</script>

<template>
  <LoginHeader />
  <article id="login-register">
    <div class="links" v-if="$route.path !== '/forgot'">
      <RouterLink to="/login">Connexion</RouterLink>
      <RouterLink to="/register">Inscription</RouterLink>
    </div>
    <TheLogin v-if="$route.path === '/login'" />
    <TheRegister v-else-if="$route.path === '/register'" />
    <TheForgotPass v-else-if="$route.path === '/forgot'" />
  </article>
</template>

<style lang="scss">
#login-register {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20%;

  .links {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 1.1rem;

    a {
      color: var(--main-text-color);
      text-decoration: none;
      opacity: 0.75;

      &.router-link-exact-active {
        font-weight: bold;
        opacity: 1;
      }

      &:hover {
        opacity: 1;
      }

      &:focus {
        opacity: 1;
      }

      &:first-of-type {
        border-right: 1px solid var(--main-text-color);
        padding-right: 15px;
      }

      &:last-of-type {
        padding-left: 15px;
      }
    }
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 320px;
    background-color: var(--primary-color);
    border-radius: 10pt;
    padding: 20px;
    color: white;
    gap: 1em;

    div {
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;

      label {
        font-size: 1rem;
        margin-bottom: 5px;
      }

      input {
        width: 100%;
        padding: 10px;
        border-radius: 5pt;
        border: 1px solid var(--main-text-color);
        font-size: 1rem;
        outline: none;
      }

      small {
        font-size: 0.8rem;
        margin-left: 5px;
      }

      a {
        color: var(--secondary-color);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    /* button {
      width: 100%;
      padding: 10px;
      border-radius: 5pt;
      border: none;
      background-color: var(--secondary-color);
      color: white;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      outline: none;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--secondary-color-hover);
      }

      &:focus {
        background-color: var(--secondary-color-hover);
      }
    } */
  }

  .bottom-links {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    font-size: 1rem;
    gap: 0.25em;
    text-align: center;

    p {
      margin: 0;
    }

    a {
      color: var(--secondary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@media screen and (min-width: 768px) {
  #login-register {
    margin-top: 10em;
  }
}

@media screen and (max-width: 360px) {
  #login-register {
    form {
      width: 95vw;
    }

    .bottom-links {
      font-size: 0.8rem;
    }
  }
}
</style>
