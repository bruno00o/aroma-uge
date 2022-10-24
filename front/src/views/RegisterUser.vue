<template>
    <LoginRegister />
    <form @submit.prevent="register">
        <div>
            <label for="email">
                Adresse email universitaire
            </label>
            <input v-model="email" type="text" name="email" id="email" value required>
        </div>

        <div>
            <label for="password">
                Mot de passe
            </label>
            <ul id="checkPass">
                <li>au moins une minuscule</li>
                <li>au moins une majuscule</li>
                <li>au moins un chiffre</li>
                <li>au moins 8 caractères</li>
            </ul>
            <input v-model="password" type="password" name="password" id="password" value required
                @keyup="validatePassword()">
        </div>

        <div>
            <label for="passwordConfirm">
                Confirmer le mot de passe
            </label>
            <ul id="checkPassConfirm">
                <li>Les mots de passe ne correspondent pas</li>
            </ul>
            <input v-model="passwordConfirm" type="password" name="passwordConfirm" id="passwordConfirm" value required
                @keyup="checkSamePass()">
        </div>
        <div v-if="error">
            <p class="error-text">{{ error }}</p>
            <p class="error-text">Veuillez réessayer</p>
        </div>

        <div v-if="success">
            <p class="success-text">{{ success }}</p>
            <p class="success-text">Vous allez être redirigé vers la page de connexion</p>
        </div>

        <button type="submit" name="button">
            S'inscrire
        </button>

        <div>
            <p>
                Vous avez déjà un compte ?
                <router-link to="/login">
                    Se connecter
                </router-link>
            </p>
        </div>
    </form>
</template>

<script>
import LoginRegister from '../components/LoginRegister.vue';
export default {
    data() {
        return {
            email: "",
            password: "",
            passwordConfirm: "",
            error: "",
            success: ""
        };
    },
    methods: {
        register() {
            let password = this.password;
            let passChek = this.passwordConfirm;
            let paternMin = /[a-z]/;
            let paternMaj = /[A-Z]/;
            let paternNum = /[0-9]/;
            let paternLength = /.{8,}/;

            let labels = document.querySelectorAll("label");
            let inputs = document.querySelectorAll("input");
            if (!paternMin.test(password) || !paternMaj.test(password) || !paternNum.test(password) || !paternLength.test(
                password)) {
                let secondLabel = labels[1];
                let secondInput = inputs[1];
                secondLabel.classList.add("error-label");
                secondLabel.innerText = 'Mot de passe (plus sécurisé)';
                secondInput.classList.add("error-input");
                return;
            } else {
                let secondLabel = labels[1];
                let secondInput = inputs[1];
                secondLabel.classList.remove("error-label");
                secondLabel.innerText = 'Mot de passe';
                secondInput.classList.remove("error-input");
            }
            if (password !== passChek) {
                labels[2].classList.add("error-label");
                labels[2].innerText = 'Confirmer le mot de passe (ne correspond pas)';
                inputs[2].classList.add("error-input");
                return;
            } else {
                labels[2].classList.remove("error-label");
                labels[2].innerText = 'Confirmer le mot de passe';
                inputs[2].classList.remove("error-input");
            };

            this.$store.dispatch("register", {
                email: this.email,
                password: this.password
            })
                .then((data) => {
                    this.success = data.success;
                    setTimeout(() => {
                        this.$router.push("/");
                    }, 7000);
                })
                .catch((error) => {
                    this.error = error.response.data.error;
                });
        },
        validatePassword() {
            let labels = document.querySelectorAll("label");
            let inputs = document.querySelectorAll("input");
            if (labels[1].classList.contains("error-label")) {
                labels[1].classList.remove("error-label");
            }
            if (labels[1].innerText !== 'Mot de passe') {
                labels[1].innerText = "Mot de passe";
            }
            if (inputs[1].classList.contains("error-input")) {
                inputs[1].classList.remove("error-input");
            }
            let ul = document.querySelector("#checkPass");
            ul.style.display = "block";
            let paternMin = /[a-z]/;
            let paternMaj = /[A-Z]/;
            let paternNum = /[0-9]/;
            let paternLength = /.{8,}/;
            let li = ul.children;
            if (paternMin.test(this.password)) {
                li[0].classList.add("valid");
            } else {
                li[0].classList.remove("valid");
            }
            if (paternMaj.test(this.password)) {
                li[1].classList.add("valid");
            } else {
                li[1].classList.remove("valid");
            }
            if (paternNum.test(this.password)) {
                li[2].classList.add("valid");
            } else {
                li[2].classList.remove("valid");
            }
            if (paternLength.test(this.password)) {
                li[3].classList.add("valid");
            } else {
                li[3].classList.remove("valid");
            }
        },
        checkSamePass() {
            let labels = document.querySelectorAll("label");
            let inputs = document.querySelectorAll("input");
            if (labels[2].classList.contains("error-label")) {
                labels[2].classList.remove("error-label");
            }
            if (inputs[2].classList.contains("error-input")) {
                inputs[2].classList.remove("error-input");
            }
            let ul = document.querySelector("#checkPassConfirm");
            if (this.password !== this.passwordConfirm) {
                ul.style.display = "block";
                if (!ul.children[0].classList.contains('error')) {
                    ul.children[0].classList.add("error");
                }
            } else {
                ul.style.display = "none";
                ul.children[0].classList.remove("error");
            }
        }
    },
    components: { LoginRegister }
}
</script>

<style lang="scss" scoped>
.error-input {
    border: 3px solid #C73E1D;
}

.error-label {
    color: #C73E1D;
    align-self: flex-start;
}
</style>