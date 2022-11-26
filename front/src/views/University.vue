<template>
    <Nav />
    <router-view />
</template>

<script>
import Nav from "../components/Nav.vue";

export default {
    name: "University",
    components: {
        Nav,
    },
};
</script>

<style lang="scss" scoped>

</style>