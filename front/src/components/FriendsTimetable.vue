<template>
    <main id="content">
        <router-link to="/friends">
            <button id="backButton">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                        d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                </svg>
            </button>
        </router-link>
        <h3>Emploi du temps de {{ friend }}</h3>
        <TimetableVue type="friends" :friendId="friendId" />
    </main>
</template>

<script>
import axios from "axios";
import TimetableVue from './Timetable.vue';
export default {
    name: "UniversityTimetable",
    components: {
        TimetableVue
    },
    data() {
        return {
            friendId: this.$route.params.id,
            friend: ''
        }
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
    }
}
</script>

<style lang="scss" scoped>
#content {
    position: relative;
}
</style>