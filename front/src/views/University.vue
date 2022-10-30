<template>
    <Nav />
    <main id="content">
        <section v-if="apprenticeship">
            <h3>À l'Université</h3>
            <p>{{ date }}</p>
            <button>Consulter mon emploi du temps</button>
        </section>
    </main>
</template>

<script>
import axios from "axios";
import Nav from "../components/Nav.vue";
export default {
    name: "University",
    components: {
        Nav
    },
    data() {
        return {
            apprenticeship: this.$store.state.apprenticeship,
            date: ''
        }
    },
    methods: {
        nextSchool() {
            axios.get(`${this.$store.state.serverLocation}/calendar/apprenticeship/next/Cours`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    let date = new Date(response.data.date.split("/").reverse().join("-"));
                    if (date.getDate() == new Date().getDate() + 1) {
                        this.date = "Demain";
                    } else {
                        this.date = "Le " + response.data.date;
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        }
    },
    created() {
        this.nextSchool();
    }
}
</script>

<style lang="scss" scoped>

</style>