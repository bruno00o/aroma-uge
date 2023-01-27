<template>
    <div class="course" v-if="Object.keys(course).length > 0">
        <p>{{ new Date(course.start).toLocaleTimeString(
                'fr-FR',
                {
                    timeZone: 'CET',
                    hour: '2-digit', minute: '2-digit'
                })
        }} -
            {{ new Date(course.end).toLocaleTimeString(
                    'fr-FR',
                    {
                        timeZone: 'CET',
                        hour: '2-digit', minute: '2-digit'
                    })
            }}
        </p>
        <p><strong>{{ course.summary }}</strong></p>
        <p>{{ course.location }}</p>
        <p>{{ course.description }}</p>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "NextClass",
    props: {
        type: {
            type: String,
            required: true
        },
        friendId: {
            type: String,
            required: false
        }
    },
    data() {
        return {
            course: {}
        }
    },
    methods: {
        getNextClass() {
            let url = '';
            if (this.type === 'friends') {
                url = `${this.$store.state.serverLocation}/friends/nextclass/${this.friendId}`;
            } else {
                url = `${this.$store.state.serverLocation}/students/getnextclass`;
            }
            axios.get(url,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.course = response.data;
                })
                .catch(error => {
                    console.log(error);
                })
        }
    },
    mounted() {
        this.getNextClass();
    }
}
</script>

<style lang="scss" scoped>
.course {
    background-color: var(--header);
    border-radius: 5px;
    padding: 10px;
    margin: 10px 0;
    width: 100%;

    p {
        color: white !important;
        font-size: 1.1rem !important;
    }

    p:first-child {
        opacity: .7 !important;
        font-size: .9rem !important;
        margin-bottom: .5em !important;
    }

    p:not(:last-child) {
        margin-bottom: .5em !important;
    }
}
</style>