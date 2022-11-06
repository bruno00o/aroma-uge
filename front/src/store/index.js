import { createStore } from 'vuex'

import axios from 'axios'

const serverLocation = "https://api.aroma-uge.tech";

export default createStore({
    state: {
        user: null,
        firstName: null,
        lastName: null,
        apprenticeship: null,
        serverLocation: serverLocation,
        share: false,
        shareUrl: null,
    },
    mutations: {
        SET_USER_DATA(state, userData) {
            state.user = userData
            localStorage.setItem('user', JSON.stringify(userData))
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`
        },
        CLEAR_USER_DATA() {
            localStorage.removeItem('user')
            localStorage.removeItem('firstName')
            localStorage.removeItem('lastName')
            localStorage.removeItem('apprenticeship')
            axios.defaults.headers.common['Authorization'] = null
        },
        SET_FIRST_NAME(state, firstName) {
            firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
            localStorage.setItem('firstName', firstName)
            state.firstName = firstName
        },
        SET_LAST_NAME(state, lastName) {
            lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
            localStorage.setItem('lastName', lastName)
            state.lastName = lastName
        },
        SET_APPRENTICESHIP(state, apprenticeship) {
            localStorage.setItem('apprenticeship', apprenticeship)
            state.apprenticeship = apprenticeship
        },
        SET_USER_SHARING(state, data) {
            state.share = data
        },
        SET_SHARE_URL(state, url) {
            state.shareUrl = url
        }
    },
    actions: {
        register({ commit }, credentials) {
            return axios.post(`${serverLocation}/register`, credentials).then(({ data }) => {
                return data;
            });
        },
        login({ commit }, credentials) {
            return axios.post(`${serverLocation}/login`, credentials).then(({ data }) => {
                commit('SET_USER_DATA', data);
            });
        },
        logout({ commit }) {
            commit('CLEAR_USER_DATA');
        },
        forgot({ commit }, credentials) {
            return axios.get(`${serverLocation}/register/forgot/${credentials.username}`).then(({ data }) => {
                return data;
            });
        },
        loggedIn({ commit }) {
            if (localStorage.getItem('user') == null) {
                return false;
            } else {
                let user = JSON.parse(localStorage.getItem('user'))
                let token = user.accessToken
                return axios.get(`${serverLocation}/students/info`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).then(sucess => {
                    let data = sucess.data
                    commit('SET_FIRST_NAME', data["PRENOM"])
                    commit('SET_LAST_NAME', data["NOM"])
                    commit('SET_APPRENTICESHIP', data["ALTERNANCE"] === "ALTERNANCE")
                    return true;
                }).catch(err => {
                    return false;
                })
            }
        },
        shareSchedule({ commit }, credentials) {
            let user = JSON.parse(localStorage.getItem('user'))
            let token = user.accessToken
            return axios.post(`${serverLocation}/partage-edt/${credentials}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(({ data }) => {
                commit('SET_USER_SHARING', data.shareSchedule);
            }).catch(err => {
                console.log(err);
            });
        },
        getShareSchedule({ commit }) {
            let user = JSON.parse(localStorage.getItem('user'))
            let token = user.accessToken
            return axios.get(`${serverLocation}/partage-edt`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(({ data }) => {
                commit('SET_USER_SHARING', data.sharing);
                if (data.sharing) {
                    commit('SET_SHARE_URL', data.url);
                } else {
                    commit('SET_SHARE_URL', null);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }
})