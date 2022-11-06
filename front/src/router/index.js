import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios'
import Home from '../views/Home.vue'
import RegisterUser from '../views/RegisterUser.vue'
import LoginUser from '../views/LoginUser.vue'
import ForgotPass from '../views/ForgotPass.vue'
import Apprenticeship from '../views/Apprenticeship.vue'
import University from '../views/University.vue'
import Friends from '../views/Friends.vue'
import Settings from '../views/Settings.vue'
import FriendsRequests from '../views/FriendsRequests.vue'
import ApprenticeCalendar from '../views/ApprenticeCalendar.vue'

const serverLocation = "https://api.aroma-uge.tech";

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: {
            requiresAuth: true,
        }
    },
    {
        path: '/login',
        name: 'login',
        component: LoginUser,
        meta: {
            redirectIfAuth: true,
        }
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterUser,
        meta: {
            redirectIfAuth: true,
        }
    },
    {
        path: '/forgot',
        name: 'forgot',
        component: ForgotPass
    },
    {
        path: '/apprenticeship',
        name: 'apprenticeship',
        component: Apprenticeship,
        meta: {
            requiresAuth: true,
        }
    },
    {
        path: '/university',
        name: 'university',
        component: University,
        meta: {
            requiresAuth: true,
        }
    },
    {
        path: '/friends',
        name: 'friends',
        component: Friends,
        meta: {
            requiresAuth: true,
        }
    },
    {
        path: '/settings',
        name: 'settings',
        component: Settings,
        meta: {
            requiresAuth: true,
        }
    },
    {
        path: '/friends/requests',
        name: 'friendsRequests',
        component: FriendsRequests,
        meta: {
            requiresAuth: true,
        }
    },
    {
        path: '/apprenticeship/calendar',
        name: 'apprenticeCalendar',
        component: ApprenticeCalendar,
        meta: {
            requiresAuth: true,
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

async function checkAuth() {
    return new Promise((resolve, reject) => {
        let user = JSON.parse(localStorage.getItem('user'));
        let token = user.accessToken;
        let config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        axios.get(`${serverLocation}/students/info`, config)
            .then(response => {
                resolve(true);
            })
            .catch(error => {
                resolve(false);
            });
    });
}

async function refreshAccessToken() {
    return new Promise((resolve, reject) => {
        let user = JSON.parse(localStorage.getItem('user'));
        let token = user.refreshToken;
        let config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        axios.post(`${serverLocation}/login/refresh`, {}, config)
            .then(response => {
                let data = response.data;
                user.accessToken = data.accessToken;
                localStorage.setItem('user', JSON.stringify(user));
                resolve(true);
            })
            .catch(error => {
                resolve(false);
            });
    });
}

async function login() {
    return new Promise((resolve, reject) => {
        let user = JSON.parse(localStorage.getItem('user'));
        let token = user.accessToken;
        let config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        axios.get(`${serverLocation}/students/info`, config)
            .then(response => {
                let data = response.data;
                let firstName = data["PRENOM"];
                let lastName = data["NOM"];
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
                localStorage.setItem('firstName', firstName)
                lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
                localStorage.setItem('lastName', lastName)
                localStorage.setItem('apprenticeship', data["ALTERNANCE"] === "ALTERNANCE")
                resolve(true);
            })
            .catch(error => {
                resolve(false);
            });
    });
}

router.beforeEach((to, from, next) => {
    if (from.name == 'login' && to.name == 'home') {
        login().then(() => {
            next();
        });
    } else if (to.matched.some(record => record.meta.requiresAuth)) {
        if (localStorage.getItem('user') == null) {
            next({
                name: 'login',
            })
        } else {
            checkAuth().then((res) => {
                if (res) {
                    next()
                } else {
                    refreshAccessToken().then((res) => {
                        if (res) {
                            next()
                        } else {
                            localStorage.removeItem('user');
                            localStorage.removeItem('firstName');
                            localStorage.removeItem('lastName');
                            localStorage.removeItem('apprenticeship');
                            next({
                                name: 'login',
                            })
                            /* window.location.reload(); */
                        }
                    })
                }
            })
        }
    } else if (to.matched.some(record => record.meta.redirectIfAuth)) {
        if (localStorage.getItem('user') == null) {
            next()
        } else {
            next({
                name: 'home',
            })
        }
    } else {
        next()
    }
})

export default router