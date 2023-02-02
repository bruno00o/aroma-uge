import { defineStore } from "pinia";
import { getStudentInfo } from "@/services/services";
import { useUserStore } from "./user";
import { ref, computed } from "vue";

export const useStudentStore = defineStore(
  "student",
  () => {
    const student = ref({
      NOM: "",
      PRENOM: "",
      ALTERNANCE: "",
      EMAIL: "",
      GROUPE: "",
      OPTION: "",
    });

    const getStudent = computed(() => {
      return student.value;
    });

    const getStudentFirstName = computed(() => {
      return (
        student.value.PRENOM.charAt(0).toUpperCase() +
        student.value.PRENOM.slice(1).toLowerCase()
      );
    });

    const getStudentLastName = computed(() => {
      return (
        student.value.NOM.charAt(0).toUpperCase() +
        student.value.NOM.slice(1).toLowerCase()
      );
    });

    const getStudentApprenticeship = computed(() => {
      return student.value.ALTERNANCE === "ALTERNANCE";
    });

    const loadStudent = async () => {
      const studentInfo = await getStudentInfo(useUserStore().getAccessToken);
      student.value = studentInfo;
    };

    return {
      student,
      getStudent,
      getStudentFirstName,
      getStudentLastName,
      getStudentApprenticeship,
      loadStudent,
    };
  },
  {
    persist: true,
  }
);
