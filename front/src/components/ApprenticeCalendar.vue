<template>
    <main id="content" v-if="apprenticeship">
        <router-link to="/apprenticeship">
            <button id="backButton">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                        d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
                </svg>
            </button>
        </router-link>
        <DatePicker color="blue" is-expanded v-model="date" :attributes="attributes"
            :select-attribute="selectedAttributes" />
        <div v-if="date">
            <h3>{{ date }}</h3>
            <p>{{ event }}</p>
        </div>
    </main>
</template>

<script>
import Nav from "./Nav.vue";
import 'v-calendar/dist/style.css';
import { DatePicker } from 'v-calendar';
import axios from "axios";

export default {
    name: "ApprenticeCalendar",
    components: {
        Nav,
        DatePicker
    },
    data() {
        return {
            apprenticeship: (localStorage.getItem('apprenticeship') === 'true'),
            date: new Date(),
            attributes: [
                {
                    key: 'today',
                    highlight: {
                        color: 'orange',
                        fillMode: 'solid',
                    },
                    dates: new Date(),
                }
            ],
            events: {},
            event: '',
            colors: { "Cours": "blue", "Entreprise": "green", "Férié": "red" },
            selectedAttributes: {
                highlight: {
                    fillMode: 'outline',
                }
            },
        }
    },
    methods: {
        getEvents() {
            let today = new Date();
            axios.get(`${this.$store.state.serverLocation}/calendar/apprenticeship`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    for (let key in response.data) {
                        let date = new Date(key.split("/").reverse().join("-"));
                        let event = response.data[key];
                        if (event === 'F') {
                            event = 'Férié';
                        }
                        if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
                            let todayAttribute = this.attributes.find(attribute => attribute.key === "today");
                            if (todayAttribute) {
                                todayAttribute.highlight.color = this.colors[event];
                                todayAttribute.key = event;
                            }
                        } else {
                            this.attributes.push({
                                key: event,
                                highlight: {
                                    color: this.colors[event],
                                    fillMode: 'light'
                                },
                                dates: date,
                            });
                        }
                        this.events[key] = event;
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        },
        displayEvent() {
            if (this.date && this.date instanceof Date) {
                this.date = this.date.toLocaleDateString('fr-FR');
                if (this.events[this.date]) {
                    this.event = this.events[this.date];
                    let color = this.colors[this.event];
                    this.selectedAttributes.highlight.color = color;
                    /* fake click outside of window */
                    setTimeout(() => {
                        document.getElementById("content").click();
                    }, 100);
                } else {
                    this.event = "Aucun événement";
                }
            }
        }
    },
    created() {
        this.getEvents();
        this.displayEvent();
    },
    updated() {
        this.displayEvent();
    }
}
</script>

<style lang="scss" scoped>

</style>