<template>
    <LoginRegister />
    <form @submit.prevent="login">
        <div>
            <label for="username">
                Nom d'utilisateur <small>(prenom.nom ou email)</small>
            </label>
            <input v-model="username" type="text" name="username" id="username" value required spellcheck="false">
        </div>

        <div>
            <label for="password">
                Mot de passe
            </label>
            <input v-model="password" type="password" name="password" id="password" value required>
        </div>

        <div v-if="error">
            <p class="error-text">{{ error }}</p>
            <p class="error-text">Veuillez réessayer</p>
        </div>

        <button type="submit" name="button">
            Se connecter
        </button>

        <div>
            <p>
                Vous n'avez pas de compte ?
                <router-link to="/register">
                    S'inscrire
                </router-link>
            </p>
            <p>
                Vous avez oublié votre mot de passe ?
                <router-link to="/forgot">
                    Réinitialiser
                </router-link>
            </p>
        </div>
    </form>
</template>

<script>
import LoginRegister from "../components/LoginRegister.vue";
export default {
    data() {
        return {
            username: "",
            password: "",
            error: ""
        };
    },
    methods: {
        login() {
            this.$store.dispatch("login", {
                username: this.username,
                password: this.password,
            }).then(() => {
                this.$router.push({ name: "home" })
            }).catch((error) => {
                this.error = error.response.data.error;
            });
        },
    },
    components: { LoginRegister }
}
</script>

<style lang="scss" scoped>

</style>