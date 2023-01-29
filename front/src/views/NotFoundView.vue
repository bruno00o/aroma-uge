<script setup lang="ts">
import MainHeader from "@/components/header/MainHeader.vue";
import MobileNav from "@/components/nav/TheNav.vue";
</script>

<template>
  <MainHeader h1="Erreur 404" />
  <main>
    <section>
      <h2>La page que vous recherchez n'existe pas.</h2>
      <p>
        Vous pouvez retourner à l'accueil en cliquant sur le bouton ci-dessous.
      </p>
      <RouterLink :to="{ name: 'home' }" class="main-button"
        >Accueil</RouterLink
      >
    </section>
  </main>
  <MobileNav />
</template>

<style scoped>
p {
  margin-bottom: 1em;
}
</style>
