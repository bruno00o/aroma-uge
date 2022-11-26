<template>
    <Nav />
    <main id="content">
        <div id="friends-header">
            <h3>Mes Amis</h3>
            <button id="requests" @click="goToRequests" aria-label="Voir les demandes d'amis">
                <span v-if="requests.length > 0" class="requests-banner">{{ requests.length }}</span>
                <p>Requêtes d'amis</p>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path
                        d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                </svg>
            </button>
        </div>
        <div id="friends">
            <div v-if="friends.length > 0" id="friends-container">
                <div v-for="friend in friends" class="friend">
                    <p @click="open = true, friendToDelete = friend">{{ friend }}</p>
                    <div>
                        <button aria-label="Voir le planning de {{ friend }}"
                            @click="this.$router.push(`/friends/timetable/${friendsUsername[friend]}`)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path
                                    d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div v-else id="no-friends">
                <p>Vous n'avez pas encore d'amis</p>
            </div>
        </div>
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
import Nav from "../components/Nav.vue";
export default {
    name: "Friends",
    components: {
        Nav
    },
    data() {
        return {
            friends: [],
            friendsUsername: {},
            requests: [],
            open: false,
            friendToDelete: ""
        }
    },
    methods: {
        getFriends() {
            axios.get(`${this.$store.state.serverLocation}/friends`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    let data = response.data;
                    let friends = Object.keys(data);
                    for (let i = 0; i < friends.length; i++) {
                        let firstName = data[friends[i]]["PRENOM"].charAt(0).toUpperCase() + data[friends[i]]["PRENOM"].slice(1).toLowerCase();
                        let lastName = data[friends[i]]["NOM"].charAt(0).toUpperCase() + data[friends[i]]["NOM"].slice(1).toLowerCase();
                        this.friends.push(`${firstName} ${lastName}`);
                        this.friendsUsername[`${firstName} ${lastName}`] = friends[i];
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        },
        getRequests() {
            axios.get(`${this.$store.state.serverLocation}/friends/requests`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.requests = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },
        goToRequests() {
            this.$router.push("/friends/requests");
        },
        deleteFriend(friend) {
            axios.delete(`${this.$store.state.serverLocation}/friends/delete/${this.friendsUsername[friend]}`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.friends.splice(this.friends.indexOf(friend), 1);
                    this.open = false;
                })
                .catch(error => {
                    console.log(error);
                })
        },
    },
    created() {
        this.getFriends();
        this.getRequests();
    }
}
</script>

<style lang="scss" scoped>
#friends-header {
    display: flex;
    flex-direction: row !important;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;

    h3 {
        margin-bottom: 0;
    }

    #requests {
        position: relative;
        padding: 0;
        margin: 0;
        margin-top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        border: none;
        cursor: pointer;
        padding: .3em .75em;

        p {
            color: white;
            font-size: 1rem;

        }

        &:hover p {
            color: var(--secondary) !important;
        }

        svg {
            width: 25px;
            height: 25px;
            fill: white
        }
    }
}

#friends {
    width: 100%;

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
            color: white;
            cursor: pointer;
        }

        &:not(:last-child) {
            margin-bottom: 1.5em;
        }

        button {
            margin: 0 !important;
            padding: 0 !important;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;

            svg {
                width: 25px;
                height: 25px;
                fill: white
            }

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

    p, small {
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

@media not (pointer: coarse) {
    button:hover {
        background-color: white !important;
    }

    button:hover svg {
        fill: var(--secondary) !important;
    }
}

@media screen and (max-width: 600px) {

    #friends-header {
        #requests {
            width: 40px;
            height: 40px;
            padding: 0;

            p {
                display: none;
            }
        }
    }

    #friends {
        .friend {
            padding: .5em .75em;
            font-size: .9rem;

            &:not(:last-child) {
                margin-bottom: 1em;
            }
        }
    }

}
</style>