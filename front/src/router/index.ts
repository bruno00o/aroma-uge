import { createRouter, createWebHistory } from "vue-router";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useStudentStore } from "@/stores/student";
import HomeView from "../views/HomeView.vue";
import AppreticeMainViewVue from "@/views/apprentice/ApprenticeMain.vue";
import ApprenticeCalendarViewVue from "@/views/apprentice/ApprenticeCalendar.vue";
import UniversityMainViewVue from "@/views/university/UniversityMain.vue";
import FriendsMainViewVue from "@/views/friends/FriendsMain.vue";
import FriendsProfileViewVue from "@/views/friends/FriendsProfile.vue";
import FriendsRequestsViewVue from "@/views/friends/FriendsRequests.vue";
import SettingsViewVue from "@/views/SettingsView.vue";
import NotFoundViewVue from "@/views/NotFoundView.vue";

import PageLayout from "@/views/PageLayout.vue";

import TheTimetable from "@/components/TheTimetable.vue";

import { getWeekTimetable, getFriendWeekTimetable } from "@/services/services";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        requiresAuth: true,
        requiresStudent: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginRegisterView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/LoginRegisterView.vue"),
    },
    {
      path: "/forgot",
      name: "forgot",
      component: () => import("../views/LoginRegisterView.vue"),
    },
    {
      path: "/apprenticeship",
      name: "apprenticeship",
      component: PageLayout,
      props: {
        title: "Entreprise",
      },
      meta: {
        requiresAuth: true,
        requiresStudent: true,
      },
      children: [
        {
          path: "",
          name: "apprenticeship-main",
          component: AppreticeMainViewVue,
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
        },
        {
          path: "calendar",
          name: "apprenticeship-calendar",
          component: ApprenticeCalendarViewVue,
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
        },
      ],
    },
    {
      path: "/university",
      name: "university",
      component: PageLayout,
      props: {
        title: "Université",
      },
      meta: {
        requiresAuth: true,
        requiresStudent: true,
      },
      children: [
        {
          path: "",
          name: "university-main",
          component: UniversityMainViewVue,
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
        },
        {
          path: "timetable",
          name: "university-timetable",
          component: TheTimetable,
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
          props: {
            weekTimetable: getWeekTimetable,
          },
          children: [
            {
              path: ":date",
              name: "university-timetable-date",
              component: TheTimetable,
              meta: {
                requiresAuth: true,
                requiresStudent: true,
              },
              props: {
                weekTimetable: getWeekTimetable,
              },
            },
          ],
        },
      ],
    },
    {
      path: "/friends",
      name: "friends",
      component: PageLayout,
      props: {
        title: "Amis",
      },
      meta: {
        requiresAuth: true,
        requiresStudent: true,
      },
      children: [
        {
          path: "",
          name: "friends-main",
          component: FriendsMainViewVue,
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
        },
        {
          path: "requests",
          name: "friends-requests",
          component: FriendsRequestsViewVue,
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
        },
        {
          path: ":id",
          name: "friends-profile",
          component: FriendsProfileViewVue,
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
        },
        {
          path: ":id/timetable",
          name: "friends-profile-timetable",
          component: TheTimetable,
          props: {
            weekTimetable: getFriendWeekTimetable,
          },
          meta: {
            requiresAuth: true,
            requiresStudent: true,
          },
        },
      ],
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsViewVue,
      meta: {
        requiresAuth: true,
        requiresStudent: true,
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundViewVue,
    },
  ],
});

/* router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    if (!userStore.isAuthenticated) {
      next({ name: "login" });
    }
  }
  next();
}); */

router.beforeResolve(async (to, from, next) => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();
  if (to.meta.requiresStudent) {
    const studentStore = useStudentStore();
    if (!studentStore.getStudent.NOM) {
      await studentStore.loadStudent();
    }
  }
  next();
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.name === "login" || to.name === "register" || to.name === "forgot") {
    if (userStore.isAuthenticated) {
      next({ name: "home" });
    }
  }
  next();
});

router.beforeEach((to, from, next) => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();
  next();
});

router.afterEach(() => {
  const loaderStore = useLoaderStore();
  loaderStore.stopLoading();
});

export default router;
