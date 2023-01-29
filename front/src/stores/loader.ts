import { defineStore } from "pinia";

export const useLoaderStore = defineStore("loader", {
  state: () => ({
    loading: false,
  }),
  getters: {
    isLoading: (state) => state.loading,
  },
  actions: {
    startLoading() {
      this.loading = true;
    },
    stopLoading() {
      this.loading = false;
    },
  },
});
