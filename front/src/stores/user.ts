import { defineStore } from "pinia";
import {
  login,
  refreshToken as refresh,
  shareSchedule as updateShare,
  updateUser,
} from "@/services/services";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: Array as any,
    token: String as any,
  }),
  getters: {
    isAuthenticated: (state) =>
      state.user !== undefined || state.user !== null
        ? state.user.accessToken !== undefined
        : false,
    getAccessToken: (state) => state.user.accessToken,
    isSharingSchedule: (state) => state.user.shareSchedule,
    getShareScheduleUrl: (state) => state.user.shareScheduleURL,
  },
  actions: {
    loadUser() {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user) {
        this.user = user;
        this.token = user.accessToken;
      }
    },
    checkAccessToken() {
      if (this.user) {
        const now = new Date();
        const expires = new Date(this.user.accessTokenExpirationDate);
        if (now > expires) {
          return false;
        }
        return true;
      }
      return false;
    },
    async updateAccessToken() {
      return new Promise((resolve, reject) => {
        refresh(this.user.refreshToken)
          .then((response) => {
            if (response) {
              resolve(true);
            }
          })
          .catch(() => {
            reject(false);
          });
      });
    },
    async login(email: string, password: string) {
      const data = await login(email, password);
      this.user = data;
      this.token = data.accessToken;
    },
    async shareSchedule(share: Boolean) {
      const data = await updateShare(this.user.accessToken, share);
      this.user.shareSchedule = data.shareSchedule;
      this.user.shareScheduleURL = data.shareScheduleURL;
      updateUser(this.user);
    },
  },
});
