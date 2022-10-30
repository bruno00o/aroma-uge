<template>
    <Nav />
    <main id="content">
        <section v-if="apprenticeship">
            <h3>{{ nextDay }}</h3>
            <p>{{ event }}</p>
        </section>
        <section v-else>


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
            apprenticeship: this.$store.state.apprenticeship,
            nextDay: '',
            event: '',
        }
    },
    methods: {
        nextEvent() {
            axios.get(`${this.$store.state.serverLocation}/calendar/apprenticeship/next`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    let date = new Date(response.data.date.split("/").reverse().join("-"));
                    if (date.getDate() == new Date().getDate()) {
                        this.nextDay = "Aujourd'hui";
                    } else if (date.getDate() == new Date().getDate() + 1) {
                        this.nextDay = "Demain";
                    } else {
                        this.nextDay = "Le " + response.data.date;
                    }
                    this.event = response.data.event;
                })
                .catch(error => {
                    console.log(error);
                })
        }
    },
    created() {
        this.nextEvent();
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
            fill: var(--primary);
            width: 80%;
            height: 80%;
        }
    }
}

@media screen and (max-width: 600px) {
    #content {
        width: 100%;
        max-height: calc(100vh - var(--header-height) - var(--nav-height));
        overflow-y: auto;
    }
}
</style>