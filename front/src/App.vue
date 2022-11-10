<template>
    <Header :firstname="firstname" :name="name" />
    <main>
        <router-view />
    </main>
</template>


<script>
import Header from './components/Header.vue';

export default {
    name: 'app',
    components: {
        Header
    },
    data() {
        return {
            user: this.$store.state.user,
            serverLocation: this.$store.state.serverLocation,
            apprenticeship: this.$store.state.apprenticeship,
            nextDay: '',
            event: '',
            name: localStorage.getItem('lastName') ? localStorage.getItem('lastName') : '',
            firstname: localStorage.getItem('firstName') ? localStorage.getItem('firstName') : '',
        }
    },
    watch: {
        $route(to, from) {
            if (from.name == 'login') {
                this.name = localStorage.getItem('lastName') ? localStorage.getItem('lastName') : '';
                this.firstname = localStorage.getItem('firstName') ? localStorage.getItem('firstName') : '';
            } else if (to.name == 'login' && from.name == 'settings') {
                this.name = localStorage.getItem('lastName') ? localStorage.getItem('lastName') : '';
                this.firstname = localStorage.getItem('firstName') ? localStorage.getItem('firstName') : '';
            }
        }
    },
}
</script>

<style lang="scss">
@font-face {
    font-family: 'Tahoma UGE';
    src: url('./assets/fonts/tahoma.ttf');
}

@font-face {
    font-family: 'Tahoma UGE Bold';
    src: url('./assets/fonts/tahomabd.ttf');
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #171C8F;
    --secondary: #4CB944;
    --error: #C73E1D;
    --header: #171C8F;
    --background: #FFFCFF;
    --highlight: #090A35;
    --header-height: 150px;
    --nav-height: 56px;
}

body {
    font-family: 'Tahoma UGE', sans-serif;
    background-color: var(--background);
    min-height: 100vh;
    font-size: 16px;
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    flex-direction: column;
}

span.requests-banner {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--error);
    color: white;
    font-size: .9rem;
    font-family: 'Tahoma UGE Bold', sans-serif;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: middle;
}

@media screen and (max-width: 600px) {
    :root {
        --header-height: 100px;
    }

    main {
        justify-content: unset;
    }
}

@media (prefers-color-scheme: dark) {
    :root {
        --primary: white;
        --background: #090A35;
        --highlight: #FFFCFF;
    }
}

@supports (-webkit-touch-callout: none) {
    body {
        min-height: -webkit-fill-available;
    }

    #app {
        min-height: -webkit-fill-available;
    }
}
</style>
