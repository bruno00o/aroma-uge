<script setup lang="ts">
import MainHeader from "@/components/header/MainHeader.vue";
import MobileNav from "@/components/nav/TheNav.vue";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useStudentStore } from "@/stores/student";
import { useRequestsStore } from "@/stores/requests";
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import {
  getActualTheme,
  changeTheme,
  isInstalled,
  isIOS,
  setThemeMode,
  getThemeMode,
} from "@/utils/utils";

const userStore = useUserStore();
const studentStore = useStudentStore();
const requestsStore = useRequestsStore();
const router = useRouter();

const dataFetched = ref(false);

const shared = ref(false);
const shareUrl = ref("");
const actualTheme = ref("");

const themeMode = ref("auto");

onBeforeMount(() => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  shared.value = userStore.isSharingSchedule;
  if (shared.value) {
    shareUrl.value = userStore.getShareScheduleUrl;
  }

  loaderStore.stopLoading();
  dataFetched.value = true;

  themeMode.value = getThemeMode();
});

async function shareSchedule() {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  shared.value = !shared.value;

  if (shared.value) {
    await userStore.shareSchedule(true);
    shareUrl.value = userStore.getShareScheduleUrl;
  } else {
    await userStore.shareSchedule(false);
    shareUrl.value = userStore.getShareScheduleUrl;
  }

  loaderStore.stopLoading();
  shared.value = userStore.isSharingSchedule;
}

function logout() {
  userStore.$reset();
  studentStore.$reset();
  requestsStore.$reset();
  router.push("/login");
}

const isSameDomain = (styleSheet: any): boolean => {
  if (!styleSheet.href) {
    return true;
  }

  return styleSheet.href.indexOf(window.location.origin) === 0;
};

const isStyleRule = (rule: any): rule is any => rule.type === 1;

const getCSSCustomPropIndex = (): Array<[any, any]> =>
  Array.from(document.styleSheets)
    .filter(isSameDomain)
    .reduce(
      (finalArr, sheet) =>
        finalArr.concat(
          Array.from(sheet.cssRules)
            .filter(isStyleRule)
            .reduce((propValArr, rule) => {
              const props = Array.from(rule.style)
                .map((propName: any) => [
                  propName.trim(),
                  (rule.style as CSSStyleDeclaration)
                    .getPropertyValue(propName)
                    .trim(),
                ])
                .filter(([propName]) => propName.indexOf("--") === 0);

              return [...propValArr, ...props];
            }, [] as Array<[any, any]>)
        ),
      []
    );

const getCSSThemes = (): Array<{
  name: string;
  value: string;
  theme: string;
}> =>
  getCSSCustomPropIndex()
    .filter(([propName]) => propName.indexOf("-theme") > 0)
    .map(([propName, propValue]) => ({
      name: propName,
      value: propValue,
      theme:
        propName
          .replace("--", "")
          .replace("-theme", "")
          .charAt(0)
          .toUpperCase() +
        propName.replace("--", "").replace("-theme", "").slice(1).toLowerCase(),
    }));

const isActualTheme = () => {
  const theme = getActualTheme();
  if (theme === null || theme === undefined) {
    return "--bleu-theme";
  }
  return "--" + theme;
};

actualTheme.value = isActualTheme();

const themes = getCSSThemes();

const deferedPrompt: any = ref(null);

window.addEventListener("beforeinstallprompt", (e: any) => {
  e.preventDefault();
  deferedPrompt.value = e;
});

const install = () => {
  if (deferedPrompt.value) {
    deferedPrompt.value.prompt();
    deferedPrompt.value.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      } else {
        console.log("User dismissed the A2HS prompt");
      }
      deferedPrompt.value = null;
    });
  }
};

const share = () => {
  if (navigator.share) {
    navigator.share({
      title: "Emploi du temps",
      text: "Voici mon emploi du temps",
      url: shareUrl.value,
    });
  } else {
    const el = document.createElement("textarea");
    el.value = shareUrl.value;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    alert("Lien copié dans le presse papier");
  }
};

const changeThemeMode = (mode: string) => {
  themeMode.value = mode;
  setThemeMode(mode);
  localStorage.setItem("themeMode", mode);
};
</script>

<template>
  <MainHeader h1="Paramètres" />
  <main>
    <section v-if="dataFetched">
      <form id="share-schedule">
        <h2>Partager mon emploi du temps</h2>
        <input
          type="checkbox"
          name="share"
          id="share"
          @change="shareSchedule"
          :checked="shared"
        />
        <label for="share" id="share-label">
          <div id="share-toggle"></div>
        </label>
      </form>
      <p class="info">
        Vous pouvez partager votre emploi du temps avec vos proches en activant
        l'option ci-dessous. Celui-ci sera visible par quiconque disposant du
        lien (même s'il n'a pas d'accès à Aroma UGE).
      </p>
      <div v-if="shared" id="share-url" class="main-button" @click="share">
        Partager mon emploi du temps
      </div>
    </section>
    <section>
      <h2>Thèmes</h2>
      <ul id="theme-mode">
        <li
          :class="themeMode == 'auto' ? 'active' : ''"
          @click="changeThemeMode('auto')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 576 512"
          >
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H240l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H346.7L336 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM512 64V352H64V64H512z"
            />
          </svg>
        </li>
        <li
          :class="themeMode == 'light' ? 'active' : ''"
          @click="changeThemeMode('light')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 512 512"
          >
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M375.7 19.7c-1.5-8-6.9-14.7-14.4-17.8s-16.1-2.2-22.8 2.4L256 61.1 173.5 4.2c-6.7-4.6-15.3-5.5-22.8-2.4s-12.9 9.8-14.4 17.8l-18.1 98.5L19.7 136.3c-8 1.5-14.7 6.9-17.8 14.4s-2.2 16.1 2.4 22.8L61.1 256 4.2 338.5c-4.6 6.7-5.5 15.3-2.4 22.8s9.8 13 17.8 14.4l98.5 18.1 18.1 98.5c1.5 8 6.9 14.7 14.4 17.8s16.1 2.2 22.8-2.4L256 450.9l82.5 56.9c6.7 4.6 15.3 5.5 22.8 2.4s12.9-9.8 14.4-17.8l18.1-98.5 98.5-18.1c8-1.5 14.7-6.9 17.8-14.4s2.2-16.1-2.4-22.8L450.9 256l56.9-82.5c4.6-6.7 5.5-15.3 2.4-22.8s-9.8-12.9-17.8-14.4l-98.5-18.1L375.7 19.7zM269.6 110l65.6-45.2 14.4 78.3c1.8 9.8 9.5 17.5 19.3 19.3l78.3 14.4L402 242.4c-5.7 8.2-5.7 19 0 27.2l45.2 65.6-78.3 14.4c-9.8 1.8-17.5 9.5-19.3 19.3l-14.4 78.3L269.6 402c-8.2-5.7-19-5.7-27.2 0l-65.6 45.2-14.4-78.3c-1.8-9.8-9.5-17.5-19.3-19.3L64.8 335.2 110 269.6c5.7-8.2 5.7-19 0-27.2L64.8 176.8l78.3-14.4c9.8-1.8 17.5-9.5 19.3-19.3l14.4-78.3L242.4 110c8.2 5.7 19 5.7 27.2 0zM256 368a112 112 0 1 0 0-224 112 112 0 1 0 0 224zM192 256a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z"
            />
          </svg>
        </li>
        <li
          :class="themeMode == 'dark' ? 'active' : ''"
          @click="changeThemeMode('dark')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 384 512"
          >
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M144.7 98.7c-21 34.1-33.1 74.3-33.1 117.3c0 98 62.8 181.4 150.4 211.7c-12.4 2.8-25.3 4.3-38.6 4.3C126.6 432 48 353.3 48 256c0-68.9 39.4-128.4 96.8-157.3zm62.1-66C91.1 41.2 0 137.9 0 256C0 379.7 100 480 223.5 480c47.8 0 92-15 128.4-40.6c1.9-1.3 3.7-2.7 5.5-4c4.8-3.6 9.4-7.4 13.9-11.4c2.7-2.4 5.3-4.8 7.9-7.3c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-3.7 .6-7.4 1.2-11.1 1.6c-5 .5-10.1 .9-15.3 1c-1.2 0-2.5 0-3.7 0c-.1 0-.2 0-.3 0c-96.8-.2-175.2-78.9-175.2-176c0-54.8 24.9-103.7 64.1-136c1-.9 2.1-1.7 3.2-2.6c4-3.2 8.2-6.2 12.5-9c3.1-2 6.3-4 9.6-5.8c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-3.6-.3-7.1-.5-10.7-.6c-2.7-.1-5.5-.1-8.2-.1c-3.3 0-6.5 .1-9.8 .2c-2.3 .1-4.6 .2-6.9 .4z"
            />
          </svg>
        </li>
      </ul>
      <ul>
        <li
          v-for="theme in themes"
          :key="theme.name"
          :style="{
            '--theme-color': theme.value,
          }"
          @click="actualTheme = changeTheme(theme.name, theme.value)"
          :class="{
            'actual-theme': actualTheme === theme.name,
          }"
        >
          <span>{{ theme.theme }}</span>
        </li>
      </ul>
    </section>
    <section v-if="!isInstalled()">
      <h2>Installer Aroma UGE</h2>
      <p class="info">
        Cette application est une PWA (Progressive Web App). Vous pouvez donc
        l'installer sur votre appareil en l'ajoutant à l'écran d'accueil.
      </p>
      <button class="main-button" @click="install" v-if="!isIOS()">
        Installer Aroma UGE
      </button>
    </section>
    <section>
      <h2>Informations</h2>
      <p class="info">
        Cette application est en cours de développement. Si vous rencontrez des
        problèmes, n'hésitez pas à nous contacter :
        <a href="mailto:support@aroma-uge.ninja">support@aroma-uge.ninja</a>
      </p>
      <p class="info">
        Vous pouvez utilisez l'API de l'application pour développer votre propre
        application. Pour plus d'informations, rendez-vous sur
        <a href="https://api.aroma-uge.ninja" target="_blank"
          >api.aroma-uge.ninja</a
        >
      </p>
    </section>
    <section>
      <h2>Déconnexion</h2>
      <button @click="logout" id="logout" class="main-button">
        Se déconnecter
      </button>
    </section>
  </main>
  <MobileNav />
</template>

<style scoped lang="scss">
.main-button {
  margin: 0.5em 0;
}

#share-schedule {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 2em;
  margin-bottom: 0.5em;

  h2 {
    margin-bottom: 0;
  }

  label {
    font-size: 1rem;
  }

  input[type="checkbox"] {
    height: 0;
    width: 0;
    visibility: hidden;
  }

  #share-toggle {
    margin-bottom: 0;
    cursor: pointer;
    width: 50px;
    height: 25px;
    background: var(--error-color);
    border-radius: 100px;
    position: relative;
    transition: background-color 0.4s;

    &::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 19px;
      height: 19px;
      background: #fff;
      border-radius: 90px;
      transition: 0.3s;
    }
  }

  input:checked + #share-label #share-toggle {
    background: var(--secondary-color);

    &::after {
      left: calc(100% - 3px);
      transform: translateX(-100%);
    }
  }
}

p.info {
  margin-bottom: 0.5em;
}

ul {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 1em;
  align-self: center;
  width: 100%;
  max-width: 300px;
  margin: 1em 0;

  li {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.5em 0 0.5em 0.75em;
    cursor: pointer;

    &::before {
      content: "";
      display: inline-block;
      width: 1em;
      height: 1em;
      border-radius: 50%;
      margin-right: 0.5em;
      background-color: var(--theme-color);
    }

    &.actual-theme {
      font-weight: bold;
      background-color: var(--secondary-color);
      border-radius: 0.25em;
      color: white;
    }
  }
}

#theme-mode {
  place-items: center;

  li {
    height: 2.5em;
    width: 2.5em;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      width: unset;
      height: unset;
      margin-right: unset;
    }

    svg {
      fill: var(--main-text-color);
      height: 50%;
      width: 50%;
    }

    &.active {
      border-radius: 50%;
      background-color: var(--secondary-color);

      svg {
        fill: white;
      }
    }
  }
}

@media (prefers-color-scheme: dark) {
  body:not(.light) {
    #theme-mode {
      li {
        svg {
          fill: white;
        }
      }
    }
  }
}
</style>
