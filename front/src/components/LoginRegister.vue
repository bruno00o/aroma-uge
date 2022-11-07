<template>
    <div id="loginRegister">
        <router-link :to="{ name: 'login' }">
            Connexion
        </router-link>
        <svg width="2" height="20" viewBox="0 0 2 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L1 19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <router-link :to="{ name: 'register' }">
            Inscription
        </router-link>
    </div>    
</template>

<script>
export default {
    name: 'loginRegister'
}
</script>

<style lang="scss">
#loginRegister {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    min-width: 300px;

    a {
        font-family: 'Tahoma UGE Bold', sans-serif;
        font-weight: bold;
        font-size: 1.1rem;
        color: var(--primary);
        text-decoration: none;
        opacity: .4;
    }

    a.router-link-exact-active {
        opacity: 1;
    }

    svg {
        fill: var(--primary);
        stroke: var(--primary);
    }
}

form {
    display: flex;
    flex-direction: column;
    width: 300px;
    color: var(--primary);
    gap: 10px;
    margin-top: 1.5em;
    height: 100%;
    min-height: 300px;

    div {
        display: flex;
        flex-direction: column;
        gap: 5px;

        label {
            font-size: 1rem;
        }

        input {
            height: 35px;
            background: #EEEEEE;
            border: 2px solid var(--primary);
            border-radius: 5px;
            padding: 0 10px;
            font-family: 'Tahoma UGE', sans-serif;
            font-size: 1rem;
        }

        &:last-of-type {
            margin-bottom: 1em;
        }

        ul {
            display: none;
            align-self: flex-start;
            text-align: left;
            list-style: none;

            li {
                opacity: .5;

                &.valid {
                    opacity: 1;
                    color: var(--secondary);
                }

                &.error {
                    opacity: 1;
                    color: var(--error);
                }

                &:last-of-type {
                    margin-bottom: .25em;
                }
            }
        }
    }

    button {
        outline: none;
        border: none;
        color: white;
        background: var(--secondary);
        border-radius: 20px;
        cursor: pointer;
        height: 35px;
        width: 75%;
        align-self: center;
        font-family: 'Tahoma UGE Bold', sans-serif;
        font-weight: bold;
        font-size: 16px;
    }
}

button[type="submit"] {
    margin: 1em 0;
}

button[type="submit"]+div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 10px;

    a {
        color: var(--secondary);
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }
}

.success-text {
    color: #1DC73E;
    width: 300px;
}

.error-text {
    color: #C73E1D !important
}

@media screen and (max-width: 600px) {
    #loginRegister {
        margin-top: 40%;
    }  
}

@media screen and (max-width: 300px) {
    #loginRegister {
        min-width: unset;
        width: 100%;
        gap: 5%;
    }

    form {
        min-width: unset;
        width: 95%;

        input {
            width: 100%;
        }
    }
}
</style>