<template>
    <Nav :show="false" />
    <main id="content">
        <router-link to="/friends">
            <button id="backButton">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                        d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                </svg>
            </button>
        </router-link>
        <h3 v-if="requests.length <= 0">Vous n'avez aucune demande d'amis en attente 😔</h3>
        <h3 v-else>Demandes d'amis</h3>
        <div v-if="requests.length > 0" id="friends-container">
            <div v-for="request in requests" class="friends-requests">
                <div class="friend">
                    <p>{{ request }}</p>
                    <div>
                        <button @click="accept(request)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path
                                    d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                            </svg>
                        </button>
                        <button @click="refuse(request)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                                <path
                                    d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <h3>
            Demander quelqu'un en ami !
        </h3>
        <form @submit.prevent="addFriend">
            <div>
                <input type="text" placeholder="Nom d'utilisateur" v-model="username" required>
                <div v-if="error">
                    <p class="error-text">{{ error }}</p>
                    <p class="error-text">Veuillez réessayer</p>
                </div>

                <div v-if="success">
                    <p class="success-text">{{ success }}</p>
                </div>

                <button type="submit">Envoyer</button>
            </div>
        </form>
    </main>
</template>

<script>
import axios from "axios";
import Nav from "../components/Nav.vue";
export default {
    name: "FriendsRequests",
    components: {
        Nav
    },
    data() {
        return {
            requests: [],
            username: "",
            error: "",
            success: ""
        }
    },
    methods: {
        getRequests() {
            axios.get(`${this.$store.state.serverLocation}/friends/requests`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.requests = response.data;
                })
                .catch(error => {
                })
        },
        addFriend() {
            axios.post(`${this.$store.state.serverLocation}/friends/request/${this.username}`,
                {},
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.success = response.data.message
                    this.error = "";
                })
                .catch(error => {
                    console.log(error);
                    this.error = error.response.data.error;
                })
        },
        accept(username) {
            axios.post(`${this.$store.state.serverLocation}/friends/accept/${username}`,
                {},
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.getRequests();
                })
                .catch(error => {
                    console.log(error);
                })
        },
        refuse(username) {
            axios.post(`${this.$store.state.serverLocation}/friends/decline/${username}`,
                {},
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.getRequests();
                })
                .catch(error => {
                    console.log(error);
                })
        }
    },
    created() {
        this.getRequests();
    }
}
</script>

<style lang="scss" scoped>
h3 {
    font-size: 1.25rem !important;
}

form {
    align-self: center;
    margin-top: 0;

    button {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    input+div {
        margin: 0;
    }

    div {
        p {
            margin-top: .5em !important;
            font-size: 1rem !important;
        }
    }
}

#friends-container {
    width: 100%;
}

.friends-requests {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

    .friend {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        background-color: var(--header);
        border-radius: 10px;
        padding: 1em;

        p {
            margin: 0;
            font-family: 'Tahoma UGE Bold', sans-serif;
            font-weight: bold;
            color: white !important;
        }

        div {
            display: flex;
            flex-direction: row;
            align-items: center;

            button {
                margin-left: 10px;
                margin-top: 0 !important;
                padding: 0 !important;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;

                &:hover {
                    outline: none !important;
                }

                &:last-of-type {
                    background-color: var(--error) !important;

                    @media not (pointer: coarse) {
                        &:hover {
                            background-color: white !important;
                        }

                        &:hover svg {
                            fill: var(--error) !important;
                        }
                    }
                }

                svg {
                    width: 80%;
                    height: 80%;
                    fill: #fff;
                }
            }
        }

    }
}
</style>