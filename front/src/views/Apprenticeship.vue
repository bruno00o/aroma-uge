<template>
    <Nav />
    <router-view />
</template>

<script>
import Nav from "../components/Nav.vue";
import ApprenticeMain from "../components/ApprenticeMain.vue";

export default {
    name: "Apprenticeship",
    components: {
        Nav,
        ApprenticeMain
    },

}
</script>

<style lang="scss">
#content {
    button {
        margin: 20px 0;
        padding: 10px 20px;
        border: none;
        border-radius: 20pt;
        background-color: var(--secondary);
        color: white;
        font-size: 1.2em;
        font-family: 'Tahoma UGE Bold', sans-serif;
        font-weight: bold;
        align-self: center;
        cursor: pointer;
        transition: all .2s ease-in-out;
    }
}

@media all and not (pointer: coarse) {
    #content {
        button {
            &:hover {
                background-color: white;
                color: var(--secondary);
                outline: 3px solid var(--secondary);

                svg {
                    fill: var(--secondary);
                    stroke: var(--secondary);
                }
            }
        }
    }
}

@media screen and (max-width: 600px) {
    #content {
        button {
            width: 100%;
            font-size: .95em;
            padding: 10px 0;
        }
    }
}
</style>