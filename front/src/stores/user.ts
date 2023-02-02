import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  login as loginService,
  refreshToken as refresh,
  shareSchedule as updateShare,
} from "@/services/services";

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref({
      accessToken: "",
      accessTokenExpirationDate: "",
      refreshToken: "",
      refreshTokenExpirationDate: "",
      shareSchedule: false,
      shareScheduleURL: "",
      user: "",
    });

    const isAuthenticated = computed(() => {
      return (
        user.value.accessToken !== "" && user.value.accessToken !== undefined
      );
    });

    const getAccessToken = computed(() => {
      return user.value.accessToken;
    });

    const isSharingSchedule = computed(() => {
      return user.value.shareSchedule;
    });

    const getShareScheduleUrl = computed(() => {
      return user.value.shareScheduleURL;
    });

    const checkAccessToken = () => {
      if (user.value) {
        const now = new Date();
        const expires = new Date(user.value.accessTokenExpirationDate);
        if (now > expires) {
          return false;
        }
        return true;
      }
      return false;
    };

    const updateAccessToken = async () => {
      return new Promise((resolve, reject) => {
        refresh(user.value.refreshToken)
          .then((response) => {
            if (response) {
              resolve(true);
            }
          })
          .catch(() => {
            reject(false);
          });
      });
    };

    const login = async (email: string, password: string) => {
      const data = await loginService(email, password);
      user.value = data as any;
    };

    const shareSchedule = async (share: boolean) => {
      const data = await updateShare(user.value.accessToken, share);
      user.value.shareSchedule = data.shareSchedule;
      user.value.shareScheduleURL = data.shareScheduleURL;
    };

    return {
      user,
      isAuthenticated,
      getAccessToken,
      isSharingSchedule,
      getShareScheduleUrl,
      checkAccessToken,
      updateAccessToken,
      login,
      shareSchedule,
    };
  },
  {
    persist: true,
  }
);
