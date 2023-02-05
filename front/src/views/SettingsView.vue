<script setup lang="ts">
import MainHeader from "@/components/header/MainHeader.vue";
import MobileNav from "@/components/nav/TheNav.vue";
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { useStudentStore } from "@/stores/student";
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { getActualTheme, changeTheme, isInstalled, isIOS } from "@/utils/utils";

const userStore = useUserStore();
const studentStore = useStudentStore();
const router = useRouter();

const dataFetched = ref(false);

const shared = ref(false);
const shareUrl = ref("");
const actualTheme = ref("");

onBeforeMount(() => {
  const loaderStore = useLoaderStore();
  loaderStore.startLoading();

  shared.value = userStore.isSharingSchedule;
  if (shared.value) {
    shareUrl.value = userStore.getShareScheduleUrl;
  }

  loaderStore.stopLoading();
  dataFetched.value = true;
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
  /* serviceLogout(); */
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
        <a href="mailto:support@aroma-uge.tech">support@aroma-uge.tech</a>
      </p>
      <p class="info">
        Vous pouvez utilisez l'API de l'application pour développer votre propre
        application. Pour plus d'informations, rendez-vous sur
        <a href="https://api.aroma-uge.tech" target="_blank"
          >api.aroma-uge.tech</a
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
</style>
