<template>
    <Nav />
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
import Nav from "../components/Nav.vue";
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
            apprenticeship: this.$store.state.apprenticeship,
            attributes: [],
            events: {},
            event: '',
            date: '',
            selectedAttributes: {
                dot: true
            }
        }
    },
    methods: {
        getEvents() {
            const colors = { "Cours": "blue", "Entreprise": "green", "Férié": "red" };
            axios.get(`${this.$store.state.serverLocation}/calendar/apprenticeship`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    for (let key in response.data) {
                        let date = new Date(key.split("/").reverse().join("-"));
                        let event = response.data[key];
                        if (event === 'F') {
                            event = 'Férié';
                        }
                        this.attributes.push({
                            key: event,
                            highlight: colors[event],
                            dates: date,
                        });
                        this.events[key] = event;
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        }
    },
    created() {
        this.getEvents();
    },
    updated() {
        if (this.date && this.date instanceof Date) {
            this.date = this.date.toLocaleDateString('fr-FR');
            if (this.events[this.date]) {
                this.event = this.events[this.date];
            } else {
                this.event = "Aucun événement";
            }
        }
    }
}
</script>

<style lang="scss" scoped>

</style>