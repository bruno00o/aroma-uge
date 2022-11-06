<template>
    <Nav />
    <main id="content">
        <form id="share-schedule">
            <h3>Partager mon emploi du temps</h3>
            <input type="checkbox" name="share" id="share" v-model="share" @change="shareSchedule" checked="checked">
            <label for="share" id="share-label">
                <div id="share-toggle"></div>
            </label>
        </form>
        <p class="info">Vous pouvez partager votre emploi du temps avec vos proches en activant l'option ci-dessous. Celui-ci sera visible par quiconque disposant du lien.</p>
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
            this.$store.dispatch("shareSchedule", this.share).then(() => {
                this.shareUrl = this.$store.state.shareUrl;
            });
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
    font-size: 1rem !important;
    margin-bottom: .5em;
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
    gap: 2em;

    h3 {
        margin-bottom: .2em;
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
        background: var(--error);
        border-radius: 100px;
        position: relative;
        transition: background-color .4s;
        &:after {
            content: '';
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
        background: var(--secondary);
        &:after {
            left: calc(100% - 3px);
            transform: translateX(-100%);
        }
    }

}

@media screen and (max-width: 600px) {
    #share-url {
        button {
            font-size: 0.9rem;
            width: 100%;
        }
    }
    #share-schedule {
        gap: 1em;
        justify-content: space-between;

        h3 {
            margin-bottom: 0;
            font-size: 1.1rem;
        }
    }

    h3 {
        font-size: 1.25rem !important;
    }
}
</style>