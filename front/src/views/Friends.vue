<template>
    <Nav />
    <router-view />
</template>

<script>
import Nav from "../components/Nav.vue";
import FriendsMain from "../components/FriendsMain.vue";
import FriendsRequests from "../components/FriendsRequests.vue";
export default {
    name: "Friends",
    components: {
        Nav,
        FriendsMain,
        FriendsRequests
    },

}
</script>

<style lang="scss" scoped>

</style>