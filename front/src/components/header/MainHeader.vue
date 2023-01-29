<script setup lang="ts">
import MobileNav from "../nav/TheNav.vue";
defineProps<{
  small?: String;
  h1: String;
}>();
</script>

<template>
  <header>
    <h1 v-if="h1">
      <small v-if="small">{{ small }}</small>
      <br v-if="small" />
      {{ h1 }}
    </h1>
    <MobileNav />
  </header>
</template>
