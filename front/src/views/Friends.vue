<template>
    <Nav />
    <main id="content">
        <div id="friends-header">
            <h3>Mes Amis</h3>
            <button id="requests" @click="goToRequests">
                <span v-if="requests.length > 0">{{ requests.length }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path
                        d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                </svg>
            </button>
        </div>
        <div id="friends">
            <div v-if="friends.length > 0" id="friends-container">
                <div v-for="friend in friends" class="friend">
                    <p>{{ friend }}</p>
                    <div>
                        <button @click="getTimetable(friend)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path
                                    d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>
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
            requests: []
        }
    },
    methods: {
        getFriends() {
            axios.get(`${this.$store.state.serverLocation}/friends`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    for (let i = 0; i < response.data.length; i++) {
                        this.friends.push(response.data[i].split(".")[0].charAt(0).toUpperCase() + response.data[i].split(".")[0].slice(1) + " " + response.data[i].split(".")[1].charAt(0).toUpperCase() + response.data[i].split(".")[1].slice(1));
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
        }
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

    #requests {
        position: relative;
        padding: 0;
        margin: 0;
        margin-top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        border: none;
        cursor: pointer;

        svg {
            width: 25px;
            height: 25px;
            fill: white
        }

        span {
            position: absolute;
            top: -8px;
            right: -8px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: var(--error);
            color: white;
            font-size: .9rem;
            font-family: 'Tahoma UGE Bold', sans-serif;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            vertical-align: middle;
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
        margin-bottom: 10px;

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
</style>