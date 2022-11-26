<template>
    <nav>
        <ul>
            <li>
                <router-link :to="{ name: 'home' }" aria-label="Accueil">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path
                            d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
                    </svg>
                    <p>Accueil</p>
                </router-link>
            </li>
            <li v-if="apprenticeship">
                <router-link to="/apprenticeship" aria-label="Apprentissage">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path
                            d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 320 512V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM512 288H320v32c0 17.7-14.3 32-32 32H224c-17.7 0-32-14.3-32-32V288H0V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V288z" />
                    </svg>
                    <p>Entreprise</p>
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'university' }" aria-label="Université">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path
                            d="M243.4 2.6l-224 96c-14 6-21.8 21-18.7 35.8S16.8 160 32 160v8c0 13.3 10.7 24 24 24H456c13.3 0 24-10.7 24-24v-8c15.2 0 28.3-10.7 31.3-25.6s-4.8-29.9-18.7-35.8l-224-96c-8.1-3.4-17.2-3.4-25.2 0zM128 224H64V420.3c-.6 .3-1.2 .7-1.8 1.1l-48 32c-11.7 7.8-17 22.4-12.9 35.9S17.9 512 32 512H480c14.1 0 26.5-9.2 30.6-22.7s-1.1-28.1-12.9-35.9l-48-32c-.6-.4-1.2-.7-1.8-1.1V224H384V416H344V224H280V416H232V224H168V416H128V224zm128-96c-17.7 0-32-14.3-32-32s14.3-32 32-32s32 14.3 32 32s-14.3 32-32 32z" />
                    </svg>
                    <p>Université</p>
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'friends' }" aria-label="Amis">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                            <path
                                d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z" />
                        </svg>
                        <span v-if="requests.length > 0 && show" class="requests-banner">{{ requests.length }}</span>
                    </div>
                    <p>Mes Amis</p>
                </router-link>
            </li>
            <li>
                <router-link :to="{ name: 'settings' }" aria-label="Paramètres">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path
                            d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z" />
                    </svg>
                    <p>Règlages</p>
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<script>
import axios from 'axios';
export default {
    name: 'Navbar',
    data() {
        return {
            apprenticeship: (localStorage.getItem('apprenticeship') === 'true'),
            requests: []
        }
    },
    props: {
        show: {
            type: Boolean,
            default: true
        }
    },
    methods: {
        getRequests(serverLocation) {
            axios.get(`${serverLocation}/friends/requests`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.requests = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        },
    },
    created() {
        this.getRequests(this.$store.state.serverLocation);
    }
}
</script>

<style lang="scss" scoped>
nav {
    position: sticky;
    top: var(--header-height);
    color: white;
    background-color: var(--header);
    width: 90%;
    max-width: 1100px;
    border-radius: 0 0 20pt 20pt;
    border-top: 4px solid var(--background);
    border-bottom: 8px solid var(--background);
    padding: 1em 0;
    z-index: 1;

    ul {
        display: flex;
        justify-content: space-around;
        align-items: center;
        list-style: none;
        padding: 0;
        margin: 0;
        height: 100%;

        li {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;

            svg {
                width: 1.5em;
                height: 1.5em;
                margin-bottom: 0.5em;
                fill: white;
            }

            a {
                position: relative;
                text-decoration: none;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                width: 100%;

                div {
                    position: relative;
                    width: 40px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                svg,
                p {
                    opacity: .5;
                    transition: opacity 0.15s ease-in-out;
                }

                &.router-link-active svg,
                &.router-link-active p {
                    opacity: 1;
                }
            }
        }
    }
}

@media screen and (max-width: 600px) {
    nav {
        position: absolute;
        top: unset;
        bottom: 0;
        border-radius: 0;
        border-top: 0;
        max-width: unset;
        width: 100%;
        border-bottom: unset;
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.2);

        ul {
            li {
                svg {
                    margin-bottom: unset;
                }

                p {
                    display: none;
                }
            }
        }
    }
}

@media all and not (pointer: coarse) {
    nav {
        ul {
            li {
                a {
                    &:hover {
                        opacity: .9;
                    }
                }
            }
        }
    }
}

@media all and (display-mode: standalone) {
    #content {
        max-height: calc(100vh - var(--header-height) - var(--nav-height) - 2.5em) !important;

    }

    nav {
        padding-bottom: 2.5em !important;
    }
}
</style>