<template>
    <Nav />
    <main id="content">
        <router-link to="/university">
            <button id="backButton">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                        d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                </svg>
            </button>
        </router-link>
        <h3>Mon emploi du temps</h3>
        <h4>Semaine du {{ weekStart }}</h4>
        <div id="week-selector">
            <button id="previous-week" @click="previousWeek">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                    <path
                        d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z" />
                </svg>
                <p>Semaine précédente</p>
            </button>
            <button id="next-week" @click="nextWeek">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                    <path
                        d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z" />
                </svg>
                <p>Semaine suivante</p>
            </button>
        </div>
        <div id="timetable">
            <div v-for="day in Object.keys(timetable)" :key="day" class="day">
                <div v-if="timetable[day].length > 0">
                    <h4>{{ day }}</h4>
                    <div class="courses-container">
                        <div v-for="course in timetable[day]" :key="course.id" class="course">
                            <p>{{ new Date(course.start).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit', minute:
                                        '2-digit'
                                })
                            }} -
                                {{ new Date(course.end).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit', minute: '2-digit'
                                    })
                                }}
                            </p>
                            <p><strong>{{ course.summary }}</strong></p>
                            <p>{{ course.location }}</p>
                            <p>{{ course.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </main>
</template>

<script>
import Nav from "../components/Nav.vue";
import axios from "axios";
export default {
    name: "UniversityTimetable",
    components: {
        Nav
    },
    data() {
        return {
            timetable: {},
            weekStart: '',
            weekStartDate: new Date()
        }
    },
    methods: {
        getTimetable(dateReq) {
            axios.get(`${this.$store.state.serverLocation}/students/weektimetable/${dateReq}`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.timetable = response.data;
                })
                .catch(error => {
                    console.log(error);
                });
        },
        nextWeek() {
            let date = new Date(this.weekStartDate);
            date.setDate(date.getDate() + 7);
            this.weekStartDate = date;
            this.weekStart = date.toLocaleDateString('fr-FR');
            let dateReq = date.toLocaleDateString('fr-FR').split("/").join("-");
            this.getTimetable(dateReq);
        },
        previousWeek() {
            let date = new Date(this.weekStartDate);
            date.setDate(date.getDate() - 7);
            this.weekStartDate = date;
            this.weekStart = date.toLocaleDateString('fr-FR');
            let dateReq = date.toLocaleDateString('fr-FR').split("/").join("-");
            this.getTimetable(dateReq);
        }
    },
    created() {
        let date = new Date();
        let day = date.getDay();
        let diff = date.getDate() - day + (day == 0 ? -6 : 1);
        let monday = new Date(date.setDate(diff));
        let dateReq = monday.toLocaleDateString('fr-FR').split("/").join("-");
        this.weekStart = monday.toLocaleDateString('fr-FR');
        this.weekStartDate = monday;
        this.getTimetable(dateReq);
    }
}
</script>

<style lang="scss" scoped>
#content {
    position: relative;
}

#week-selector {
    display: flex;
    width: 100%;
    justify-content: space-between;
    gap: 1em;


    #previous-week,
    #next-week {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--secondary);
        border-radius: 10px;
        cursor: pointer;
        gap: 10px;
        width: 100%;
        margin: 0;
        transition: all 0.2s ease-in-out;

        /* &:hover {
            background-color: white;

            svg {
                fill: var(--secondary);
            }

            p {
                color: var(--secondary);
            }
        } */

        svg {
            width: 20px;
            height: 20px;
            fill: white;
        }

        p {
            font-size: .8rem;
            margin: 0;
            color: white;
        }
    }

    #next-week {
        flex-direction: row-reverse;
    }
}

#timetable {
    width: 100%;

    .day {

        &:not(:first-child) {
            margin-top: 2rem;
        }

        h4 {
            font-size: 1.1rem;
            margin-bottom: .5rem;
        }

        .courses-container {
            display: flex;
            flex-direction: column;

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
    }

}
</style>