<script setup lang="ts">
import { useRequestsStore } from "@/stores/requests";

const requestsStore = useRequestsStore();
</script>

<template>
  <div v-if="requestsStore.getRequestsCount > 0">
    {{ requestsStore.getRequestsCount }}
  </div>
</template>

<style scoped lang="scss">
div {
  background-color: red;
  position: absolute;
  top: -25%;
  right: -25%;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
