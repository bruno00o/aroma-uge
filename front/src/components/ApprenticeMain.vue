<template>
    <main id="content">
        <section v-if="apprenticeship">
            <h3>En entreprise</h3>
            <p>{{ date }}</p>
            <button @click="$router.push('/apprenticeship/calendar')">Consulter le calendrier d'alternance</button>
            <hr>
            <ToDo location="apprenticeship" name="apprentissage" />
        </section>
        <section v-else>
            <h3>En formation</h3>
        </section>
    </main>
</template>

<script>
import axios from "axios";
import ToDo from "./ToDo.vue";

export default {
    name: "ApprenticeMain",
    components: {
        ToDo
    },
    data() {
        return {
            apprenticeship: (localStorage.getItem('apprenticeship') === 'true'),
            date: ''
        }
    },
    methods: {
        nextApp() {
            axios.get(`${this.$store.state.serverLocation}/calendar/apprenticeship/next/Entreprise`,
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
        this.nextApp();
    }

}
</script>

<style lang="scss" scoped>

</style>