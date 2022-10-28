<template>
    <Header />
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
    }
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
    --header-height: 150px;
    --nav-height: 56px;
}

body {
    font-family: 'Tahoma UGE';
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

@media screen and (max-width: 600px) {
    :root {
        --header-height: 100px;
    }
}

@media (prefers-color-scheme: dark) {
    :root {
        --primary: white;
        --background: #090A35;
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
