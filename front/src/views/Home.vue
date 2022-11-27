<template>
    <Nav />
    <main id="content">
        <section v-if="apprenticeship">
            <h3>{{ nextDay }}</h3>
            <p>{{ event }}</p>
            <hr v-if="event === 'Cours'">
            <h3 v-if="event === 'Cours'" class="next-course">Prochain cours</h3>
            <NextClassVue v-if="event === 'Cours'" type="student" />
            <hr>
            <ToDo location="apprenticeship" name="apprentissage" v-if="event === 'Entreprise'" />
            <ToDo location="university" name="université" v-if="event === 'Cours'" />
        </section>
        <section v-else>
            <h3>Prochain cours</h3>
            <p>{{ nexCourseDay }}</p>
            <NextClassVue type="student" />
        </section>

    </main>
</template>

<script>
import Nav from "../components/Nav.vue";
import ToDo from "../components/ToDo.vue";
import NextClassVue from "../components/NextClass.vue";

import axios from "axios";
export default {
    name: "Home",
    components: {
        Nav,
        ToDo,
        NextClassVue
    },
    data() {
        return {
            apprenticeship: localStorage.getItem("apprenticeship") === "true" ? true : false,
            nextDay: '',
            event: '',
            course: {},
            nexCourseDay: ''
        }
    },
    methods: {
        nextEvent() {
            axios.get(`${this.$store.state.serverLocation}/calendar/apprenticeship/next`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    let date = new Date(response.data.date.split("/").reverse().join("-"));
                    let today = new Date();
                    let tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()) {
                        this.nextDay = "Aujourd'hui";
                    } else if (date.getDate() == tomorrow.getDate() && date.getMonth() == tomorrow.getMonth() && date.getFullYear() == tomorrow.getFullYear()) {
                        this.nextDay = "Demain";
                    } else {
                        this.nextDay = "Le " + response.data.date;
                    }
                    this.event = response.data.event;
                })
                .catch(error => {
                    console.log(error);
                })
        },
        getNextClass() {
            axios.get(`${this.$store.state.serverLocation}/students/getnextclass`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.course = response.data;
                    let date = new Date(response.data.start);
                    let today = new Date();
                    let tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    if (date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()) {
                        this.nexCourseDay = "Aujourd'hui";
                    } else if (date.getDate() == tomorrow.getDate() && date.getMonth() == tomorrow.getMonth() && date.getFullYear() == tomorrow.getFullYear()) {
                        this.nexCourseDay = "Demain";
                    } else {
                        this.nexCourseDay = "Le " + date.toLocaleDateString('fr-FR', {
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
        }
    },
    created() {
        this.nextEvent();
        this.getNextClass();
    }
}

</script>

<style lang="scss">
#content {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    width: 90%;
    max-width: 1100px;
    align-items: flex-start;
    padding: 1em 2em;
    color: var(--primary);

    h3 {
        font-size: 1.5em;
        margin-bottom: 0.5em;
    }

    p {
        font-size: 1.2em;
        color: var(--secondary);

        &+.next-course {
            margin-top: 2em;
        }
    }

    section {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    #backButton {
        margin: 0;
        width: 40px;
        height: 40px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: unset;
        border: 3px solid var(--primary);

        svg {
            fill: var(--primary) !important;
            width: 80%;
            height: 80%;
        }
    }

    hr {
        width: 100%;
        border: 1px solid var(--primary);
        margin: 1.5em 0;
        background-color: var(--primary);
        /* max-width: 600px;
        align-self: center; */
    }
}

@media screen and (max-width: 600px) {
    #content {
        width: 100%;
        max-height: calc(100vh - var(--header-height) - var(--nav-height));
        overflow-y: auto;
        padding: 1em 1.5em;
        padding-top: 1em;
    }
}
</style>