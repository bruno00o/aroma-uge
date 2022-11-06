<template>
    <Nav />
    <main id="content">
        <h3>Partage d'emploi du temps à l'extérieur de l'application</h3>
        <p class="info">Vous pouvez partager votre emploi du temps avec vos proches en activant l'option ci-dessous.</p>
        <form id="share-schedule">
            <label for="share">
                Partager mon emploi du temps
            </label>
            <input type="checkbox" name="share" id="share" v-model="share" @change="shareSchedule" checked="checked">
        </form>
        <a :href="shareUrl" v-if="share" target="_blank" id="share-url">
            <button>
                Lien de partage de l'emploi du temps
            </button>
        </a>
        <h3>Déconnexion</h3>
        <button @click="logout" id="logout">
            Se déconnecter
        </button>
    </main>
</template>

<script>
import Nav from "../components/Nav.vue";
export default {
    name: "Settings",
    components: {
        Nav
    },
    data() {
        return {
            share: this.$store.state.share,
            checked: this.$store.state.share ? "checked" : "",
            shareUrl: this.$store.state.shareUrl
        }
    },
    methods: {
        shareSchedule() {
            this.$store.dispatch("shareSchedule", this.share);
        },
        logout() {
            this.$store.dispatch("logout");
            this.$router.push({ name: "login" });
        }
    },
    created() {
        this.$store.dispatch("getShareSchedule").then(() => {
            this.share = this.$store.state.share;
            this.shareUrl = this.$store.state.shareUrl;
        });
    }
}
</script>

<style lang="scss" scoped>
.info {
    color: var(--primary) !important;
    font-size: 1rem;
}

#share-url {
    width: 100%;
    display: flex;
    justify-content: center;
    text-decoration: none;
    button {
        font-size: 1rem;
        margin-top: 0;
    }
}

button#logout {
    margin-top: 0;
}

h3:not(:first-child) {
    margin-top: 2rem;
}

#share-schedule {
    margin: 0;
    padding: 0;
    border: 0;
    height: unset;
    width: 100%;
    min-height: unset;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;

    label {
        font-size: 1rem;
    }

    input[type="checkbox"] {
        width: 20px;
        height: 20px;
        border: 2px solid var(--primary);
        border-radius: 5px;
        cursor: pointer;
    }
}

@media screen and (max-width: 600px) {
    #share-url {
        button {
            font-size: 0.9rem;
            width: 100%;
        }
    }
}
</style>