<script setup lang="ts">
import MainHeader from "@/components/header/MainHeader.vue";
import MobileNav from "@/components/nav/TheNav.vue";
defineProps<{
  title: string;
}>();
</script>

<template>
  <MainHeader :h1="title" />
  <RouterView />
  <MobileNav />
</template>
