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
        component: LoginUser
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterUser
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
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (localStorage.getItem('user') == null) {
            next({
                name: 'login',
            })
        } else {
            let user = JSON.parse(localStorage.getItem('user'))
            let token = user.accessToken
            axios.get(`${serverLocation}/students/info`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(sucess => {
                next()
            }).catch(err => {
                if (err.response.status == 401) {
                    let refreshToken = user.refreshToken
                    console.log(refreshToken)
                    axios.post(`${serverLocation}/login/refresh`, {}, {
                        headers: {
                            'Authorization': `Bearer ${refreshToken}`
                        }
                    }).then(sucess => {
                        let data = sucess.data
                        user.accessToken = data.accessToken
                        localStorage.setItem('user', JSON.stringify(user))
                        next()
                    }).catch(err => {
                        console.log(err)
                        next({
                            name: 'login',
                        })
                    })
                }
            })
        }
    } else {
        next()
    }
})

export default router