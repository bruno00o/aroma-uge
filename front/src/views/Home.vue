<template>
    <Nav />
    <main id="content">
        <section v-if="apprenticeship">
            <h3>{{ nextDay }}</h3>
            <p>{{ event }}</p>
            <h3 v-if="event === 'Cours'" class="next-course">Prochain cours</h3>
            <div class="course" v-if="event === 'Cours'">
                <p>{{ new Date(course.start).toLocaleTimeString(
                        'fr-FR', {
                        timeZone: 'CET',
                        hour: '2-digit', minute: '2-digit'
                    })
                }} -
                    {{ new Date(course.end).toLocaleTimeString('fr-FR', {
                            timeZone: 'CET',
                            hour: '2-digit', minute: '2-digit'
                        })
                    }}
                </p>
                <p><strong>{{ course.summary }}</strong></p>
                <p>{{ course.location }}</p>
                <p>{{ course.description }}</p>
            </div>
        </section>
        <section v-else>
            <h3>Prochain cours</h3>
            <p>{{ nexCourseDay }}</p>
            <div class="course">
                <p>{{ new Date(course.start).toLocaleTimeString(
                        'fr-FR', {
                        timeZone: 'CET',
                        hour: '2-digit', minute: '2-digit'
                    })
                }} -
                    {{ new Date(course.end).toLocaleTimeString('fr-FR', {
                            timeZone: 'CET',
                            hour: '2-digit', minute: '2-digit'
                        })
                    }}
                </p>
                <p><strong>{{ course.summary }}</strong></p>
                <p>{{ course.location }}</p>
                <p>{{ course.description }}</p>
            </div>
        </section>

    </main>
</template>

<script>
import Nav from "../components/Nav.vue";
import axios from "axios";
export default {
    name: "Home",
    components: {
        Nav
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

    .course {
        background-color: var(--header);
        border-radius: 5px;
        padding: 10px;
        margin: 10px 0;

        p {
            color: white;
            font-size: 1.1rem;
        }

        p:first-child {
            opacity: .7;
            font-size: .9rem;
            margin-bottom: .5em;
        }

        p:not(:last-child) {
            margin-bottom: .5em;
        }
    }
}

@media screen and (max-width: 600px) {
    #content {
        width: 100%;
        max-height: calc(100vh - var(--header-height) - var(--nav-height));
        overflow-y: auto;
        padding: 1em 1.5em;
        padding-top: 2em;
    }
}
</style>