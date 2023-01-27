<template>
    <main id="content">
        <div id="header-page">
            <router-link to="/friends">
                <button id="backButton">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <path
                            d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                    </svg>
                </button>
            </router-link>
            <h3>{{ headerTitle }}</h3>
        </div>
        <p>{{ date }}</p>
        <NextClassVue type="friends" :friendId="friendId" />
        <button @click="$router.push(`/friends/timetable/${friendId}`)">
            Consulter son emploi du temps
        </button>
        <button class="delete-friend" @click="open = true, friendToDelete = friendId">
            Supprimer {{ friend }} de mes amis
        </button>
    </main>
    <Teleport to="#app">
        <div v-if="open" class="modal">
            <p>Voulez-vous supprimer {{ friendToDelete }} de vos amis ?</p>
            <small>Vous serez également supprimé de ces amis.</small>
            <div>
                <button @click="open = false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <path
                            d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z" />
                    </svg></button>
                <button @click="deleteFriend(friendToDelete)">Supprimer</button>
                <button @click="open = false">Annuler</button>
            </div>
        </div>
        <div v-if="open" class="modal-bg" @click="open = false"></div>
    </Teleport>
</template>

<script>
import axios from "axios";
import NextClassVue from "./NextClass.vue";

export default {
    name: "FriendsDetails",
    components: {
        NextClassVue
    },
    data() {
        return {
            friendId: this.$route.params.id,
            friend: '',
            headerTitle: '',
            date: '',
            open: false,
            friendToDelete: ""
        }
    },
    methods: {
        getNextClass() {
            axios.get(`${this.$store.state.serverLocation}/friends/nextclass/${this.friendId}`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    let date = new Date();
                    let eventStart = new Date(response.data["start"]);
                    let eventEnd = new Date(response.data["end"]);
                    if (date >= eventStart && date <= eventEnd) {
                        this.headerTitle = `${this.friend} est en cours`;
                    } else {
                        this.headerTitle = `Prochain cours de ${this.friend}`;
                    }
                    let tomorrow = new Date(date);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    if (date.getDate() == eventStart.getDate() && date.getMonth() == eventStart.getMonth() && date.getFullYear() == eventStart.getFullYear()) {
                        this.date = "Aujourd'hui";
                    } else if (tomorrow.getDate() == eventStart.getDate() && tomorrow.getMonth() == eventStart.getMonth() && tomorrow.getFullYear() == eventStart.getFullYear()) {
                        this.date = "Demain";
                    } else {
                        this.date = "Le " + date.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        },
        deleteFriend(friend) {
            axios.delete(`${this.$store.state.serverLocation}/friends/delete/${friend}`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.open = false;
                    this.$router.push("/friends");
                })
                .catch(error => {
                    console.log(error);
                })
        },
    },
    created() {
        axios.get(`${this.$store.state.serverLocation}/friends`,
            { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
            .then(response => {
                let data = response.data;
                this.friend = data[this.friendId]["PRENOM"].charAt(0).toUpperCase() + data[this.friendId]["PRENOM"].slice(1).toLowerCase();
            })
            .catch(error => {
                console.log(error);
            });
        this.getNextClass();
    }
}
</script>

<style lang="scss" scoped>
#content {
    position: relative;

    #header-page {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1em;

        h3 {
            margin: 0;
        }
    }

    .delete-friend {
        position: absolute;
        bottom: 3em;
        background-color: var(--error);
        width: 60%;
        max-width: 300px;
        font-size: .8rem;

        &:hover {
            background-color: white;
            outline: 3px solid var(--error);
            color: var(--error);
        }
    }


}

.modal {
    position: absolute;
    z-index: 100;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--header);
    border-radius: 10px;
    padding: 2.5em 1em 1em 1em;
    width: 90%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1em;

    button {
        background-color: white;
        border: none;
        cursor: pointer;
        padding: .2em .5em;
        width: 100px;
        border-radius: 10px;

        &:nth-of-type(2) {
            margin-right: 2em;
            color: var(--error);
            font-family: 'Tahoma UGE Bold', sans-serif;
            font-weight: bold;
            border: 2px solid var(--error);

            &:hover {
                background-color: var(--error) !important;
                color: white;
            }
        }

        &:nth-of-type(3) {
            color: var(--secondary);
            font-family: 'Tahoma UGE Bold', sans-serif;
            font-weight: bold;
            border: 2px solid var(--secondary);

            &:hover {
                background-color: var(--secondary) !important;
                color: white;
            }
        }

        &:first-of-type {
            position: absolute;
            top: .5em;
            right: .5em;
            border: none;
            background-color: transparent;
            outline: none;
            cursor: pointer;
            width: unset;

            svg {
                width: 25px;
                height: 25px;
                fill: white
            }

            &:hover {
                background-color: transparent !important;

                svg {
                    fill: var(--error) !important;
                }
            }
        }
    }

    p,
    small {
        font-family: 'Tahoma UGE Bold', sans-serif;
        font-weight: bold;
        color: white;
        text-align: center;
    }
}

.modal-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 2;
}
</style>