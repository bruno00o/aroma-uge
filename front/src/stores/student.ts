import { defineStore, acceptHMRUpdate } from "pinia";
import { getStudentInfo } from "@/services/services";
import { useUserStore } from "./user";

export const useStudentStore = defineStore("student", {
  state: () => ({
    student: Array as any,
  }),
  getters: {
    getStudent: (state) => state.student,
    getStudentFirstName: (state) =>
      state.student.PRENOM.charAt(0).toUpperCase() +
      state.student.PRENOM.slice(1).toLowerCase(),
    getStudentLastName: (state) =>
      state.student.NOM.charAt(0).toUpperCase() +
      state.student.NOM.slice(1).toLowerCase(),
    getStudentApprenticeship: (state) =>
      state.student.ALTERNANCE === "ALTERNANCE",
  },
  actions: {
    async loadStudent() {
      const student = await getStudentInfo(useUserStore().getAccessToken);
      this.student = student;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStudentStore, import.meta.hot));
}
