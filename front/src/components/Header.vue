<template>
    <header>
        <div v-if="firstname && name" class="displayName">
            <h2>Bienvenue <br><strong>{{ firstname + " " + name }}</strong></h2>
        </div>
        <a href="https://aroma-uge.tech">
            <img src="../assets/images/logo.svg" alt="Logo Université Gustave Eiffel">
            <h1>Aroma UGE</h1>
        </a>
    </header>
</template>

<script>

export default {

    name: 'header',
    data() {
        return {
            name: '',
            firstname: ''
        }
    },
    methods: {
        loggedIn() {
            this.$store.dispatch('loggedIn').then((res) => {
                if (res && this.$store.state.lastName && this.$store.state.firstName) {
                    this.name = this.$store.state.lastName;
                    this.firstname = this.$store.state.firstName;
                    this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1).toLowerCase();
                    this.firstname = this.firstname.charAt(0).toUpperCase() + this.firstname.slice(1).toLowerCase();
                }
            });
        },
    },
    beforeMount() {
        this.loggedIn();
    },
}
</script>

<style lang="scss" scoped>
header {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: row;
    height: var(--header-height);
    background-color: var(--header);
    width: 100%;
    max-width: 1200px;
    align-self: center;
    border-radius: 0 0 20pt 20pt;

    .displayName {
        color: white;

        strong {
            font-family: 'Tahoma UGE Bold';
        }

        &+a {
            flex-direction: row-reverse;
        }
    }

    a {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        text-decoration: none;
    }

    img {
        width: 100px;
    }

    h1 {
        font-family: 'Tahoma UGE Bold';
        font-size: 2rem;
        color: white
    }
}

@media screen and (max-width: 600px) {
    header {
        div {
            position: absolute;
            left: 20px;
        }

        img {
            width: 80px;
        }

        h1 {
            font-size: 1.5rem;
        }

        .displayName+a {
            display: none;
        }
    }

}
</style>