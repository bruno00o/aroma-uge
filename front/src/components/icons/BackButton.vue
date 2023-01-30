<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <button @click="router.go(-1)">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
      <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
      <path
        d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 278.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
      />
    </svg>
  </button>
</template>

<style lang="scss" scoped>
button {
  background: var(--primary-color);
  border: none;
  cursor: pointer;
  padding: 0.4em;
  margin: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  svg {
    width: 100%;
    height: 100%;
    fill: white;
  }
}
</style>
