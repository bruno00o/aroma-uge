import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { friendsRequests } from "@/services/services";

export const useRequestsStore = defineStore("requests", () => {
  const requests = ref([]);

  const getRequestsCount = computed(() => {
    return requests.value.length;
  });

  const loadFriendsRequests = async (accessToken: string) => {
    requests.value = await friendsRequests(accessToken);
  };
  return {
    requests,
    getRequestsCount,
    loadFriendsRequests,
  };
});
