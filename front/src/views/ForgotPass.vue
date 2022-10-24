<template>
    <form @submit.prevent="forgot">
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

</style>