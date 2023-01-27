<template>
    <form @submit.prevent="forgot">
        <div>
            Entrez votre nom d'utilisateur, un lien de réinitialisation vous sera envoyé par mail.
        </div>
        <div>
            <label for="username">
                Nom d'utilisateur
            </label>
            <input v-model="username" type="text" name="username" id="username" value required>
        </div>

        <div v-if="success">
            <p class="success-text">{{ success }}</p>
            <p class="success-text">Vous allez être redirigé vers la page de connexion</p>
        </div>

        <div v-if="error">
            <p class="error-text">{{ error }}</p>
            <p class="error-text">Veuillez réessayer</p>
        </div>

        <button type="submit" name="button">
            Envoyer
        </button>
        <div>
            <p>
                Vous n'avez pas de compte ?
                <router-link to="/register">
                    S'inscrire
                </router-link>
            </p>
            <p>
                Vous vous souvenez de votre mot de passe ?
                <router-link to="/login">
                    Se connecter
                </router-link>
            </p>
        </div>
    </form>
</template>

<script>
export default {
    data() {
        return {
            username: "",
            error: "",
            success: ""
        };
    },
    methods: {
        forgot() {
            this.$store.dispatch("forgot", {
                username: this.username,
            })
                .then((success) => {
                    this.error = "";
                    this.success = success.success;
                    setTimeout(() => {
                        this.$router.push("/login");
                    }, 6000);
                })
                .catch((error) => {
                    this.error = error.response.data.error;
                });
        }
    }
};
</script>

<style lang="scss" scoped>
form {
    div:first-of-type {
        margin-bottom: 1rem;
    }
}
</style>