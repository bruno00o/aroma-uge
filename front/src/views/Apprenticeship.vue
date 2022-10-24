<template>
    <Nav />
    <main id="content">
        <div v-if="apprenticeship">
            <h3>En entreprise</h3>
            <p>{{ date }}</p>
            <button @click="">Consulter le calendrier d'alternance</button>
        </div>
    </main>

</template>

<script>
import axios from "axios";
import Nav from "../components/Nav.vue";
export default {
    name: "Apprenticeship",
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

<style lang="scss">
#content {
    button {
        margin-top: 20px;
        padding: 10px 20px;
        border: none;
        border-radius: 20pt;
        background-color: var(--secondary);
        color: white;
        font-size: 1.2em;
        font-family: 'Tahoma UGE Bold';
        align-self: center;
        cursor: pointer;
    }
}

</style>