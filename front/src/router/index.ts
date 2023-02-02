import { createRouter, createWebHistory } from "vue-router";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useStudentStore } from "@/stores/student";
import HomeView from "../views/HomeView.vue";
import ApprenticeViewVue from "@/views/apprentice/LayoutView.vue";
import AppreticeMainViewVue from "@/views/apprentice/ApprenticeMain.vue";
import ApprenticeCalendarViewVue from "@/views/apprentice/ApprenticeCalendar.vue";
import SettingsViewVue from "@/views/SettingsView.vue";
import UniversityViewVue from "@/views/UniversityView.vue";
import FriendsViewVue from "@/views/FriendsView.vue";
import NotFoundViewVue from "@/views/NotFoundView.vue";

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
      component: ApprenticeViewVue,
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
      component: UniversityViewVue,
      meta: {
        requiresAuth: true,
        requiresStudent: true,
      },
    },
    {
      path: "/friends",
      name: "friends",
      component: FriendsViewVue,
      meta: {
        requiresAuth: true,
        requiresStudent: true,
      },
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

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const userStore = useUserStore();
    if (!userStore.isAuthenticated) {
      next({ name: "login" });
    }
  }
  next();
});

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
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();
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

router.afterEach(() => {
  const loaderStore = useLoaderStore();
  loaderStore.stopLoading();
});

export default router;
