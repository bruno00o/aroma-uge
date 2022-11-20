<template>
    <div class="todo-wrapper">
        <div class="todo-header">
            <h3>Rappels {{ name }}</h3>
            <button @click="open = true" class="add-todo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                    <path
                        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                </svg>
            </button>
        </div>
        <div class="todo-body">
            <div class="todo-list">
                <div v-for="todo in todoList" :key="todos[todo].id" class="todo-item">
                    <input type="checkbox" :id="todos[todo].id" :checked="!todos[todo].active"
                        @change="toggleDone(todo)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <path
                            d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                    </svg>
                    <label :for="todos[todo].id">
                        <div class="todo-item-text">
                            {{ todo }}
                        </div>
                    </label>
                    <button @click="deleteTodoItem(todo)" class="delete-todo">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path
                                d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div v-if="todoList.length === 0" class="no-todo">
                <p>
                    Vous n'avez pas de rappels
                </p>
            </div>
        </div>
    </div>
    <Teleport to="#app">
        <div v-if="open" class="modal">
            <p>Ajouter un rappel</p>
            <form @submit="addTodo">
                <input type="text" v-model="todoText" placeholder="Nouveau rappel">
                <div>
                    <button type="button" @click="open = false"><svg xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512">
                            <path
                                d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z" />
                        </svg></button>
                    <button type="button" @click="open = false">Fermer</button>
                    <button type="submit">Ajouter</button>
                </div>
            </form>
        </div>
        <div v-if="open" class="modal-bg" @click="open = false"></div>
    </Teleport>

</template>

<script>
import axios from 'axios';

export default {
    name: "ToDo",
    props: {
        location: String, /* university or apprenticeship */
        name: String,
    },
    data() {
        return {
            todos: {},
            todoList: [],
            open: false,
            todoText: ''
        }
    },
    methods: {
        getTodo() {
            axios.get(`${this.$store.state.serverLocation}/todo/${this.location}`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    let todoBuilder = {};
                    let todoRes = response.data;
                    let objects = Object.keys(todoRes);
                    objects.forEach(object => {
                        Object.keys(todoRes[object]).forEach(todo => {
                            todoBuilder[todoRes[object][todo]] = {
                                active: object === "active" ? true : false,
                                id: todo
                            }
                        })
                    })
                    this.todos = todoBuilder;
                    this.todoList = Object.keys(todoBuilder);
                })
                .catch(error => {
                    console.log(error);
                })
        },
        postTodo(tosend) {
            axios.post(`${this.$store.state.serverLocation}/todo/${this.location}/add`,
                tosend,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.getTodo();
                })
                .catch(error => {
                    console.log(error);
                })
        },
        toDone(id) {
            axios.post(`${this.$store.state.serverLocation}/todo/${this.location}/todone/${id}`, {},
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                })
                .catch(error => {
                    console.log(error);
                })
        },
        toActive(id) {
            axios.post(`${this.$store.state.serverLocation}/todo/${this.location}/toactive/${id}`, {},
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                })
                .catch(error => {
                    console.log(error);
                })
        },
        deleteTodo(id) {
            axios.delete(`${this.$store.state.serverLocation}/todo/${this.location}/delete/${id}`,
                { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).accessToken}` } })
                .then(response => {
                    this.getTodo();
                })
                .catch(error => {
                    console.log(error);
                })
        },
        addTodo() {
            if (this.todoText != '') {
                this.postTodo([this.todoText]);
                this.todoText = ''
                this.open = false
            }
        },
        toggleDone(todo) {
            if (this.todos[todo].active) {
                this.toDone(this.todos[todo].id);
            } else {
                this.toActive(this.todos[todo].id);
            }
            this.todos[todo].active = !this.todos[todo].active;
        },
        deleteTodoItem(todo) {
            this.deleteTodo(this.todos[todo].id);
        }
    },
    created() {
        this.getTodo();
    }

}
</script>

<style lang="scss" scoped>
.todo-wrapper {
    position: relative;
    width: 100%;

    .todo-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 40px;
        width: 100%;

        h3 {
            margin: 0 !important;
        }

        .add-todo {
            position: absolute;
            top: 0;
            right: 0;
            width: 40px !important;
            height: 40px !important;
            border: none;
            padding: 0 !important;
            margin: 0 !important;
            display: flex;
            justify-content: center;
            align-items: center;

            svg {
                width: 80%;
                height: 80%;
                fill: #fff;
            }
        }
    }

    .todo-body {
        .todo-list {
            display: flex;
            flex-direction: column;
            margin-top: 1em;
            gap: .75em;

            .todo-item {
                display: flex;
                align-items: center;
                align-items: center;
                background-color: var(--header);
                border-radius: 10px;
                padding: 1em;

                input[type="checkbox"] {
                    visibility: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 20px;
                    margin-right: 1em;

                    &::after {
                        content: "";
                        width: 15px;
                        height: 15px;
                        visibility: visible;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: 3px;
                        border: 2px solid white;
                        background-color: transparent;
                        cursor: pointer;
                    }

                    &+svg {
                        visibility: hidden;
                        width: 14px;
                        height: 14px;
                        fill: white;
                        position: absolute;
                        left: 19.5px;
                        pointer-events: none;
                    }

                    &:checked {
                        /*  &::after {
                            background-color: white;
                        } */

                        &+svg {
                            visibility: visible;

                            &+label {
                                text-decoration: line-through;
                            }
                        }
                    }

                    &:hover {
                        &::after {
                            background-color: rgba(255, 255, 255, .2);
                        }
                    }

                }

                label {
                    user-select: none;
                    -ms-user-select: none;
                    -moz-user-select: none;
                    -webkit-user-select: none;
                    cursor: pointer;
                }

                .delete-todo {
                    position: absolute;
                    right: .5em;
                    width: 35px !important;
                    height: 35px !important;
                    border: none;
                    padding: .25em !important;
                    margin: 0 !important;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    svg {
                        width: 80%;
                        height: 80%;
                        fill: #fff;
                    }
                }
            }
        }
    }
}

.modal {
    position: absolute;
    z-index: 100;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--header);
    border-radius: 10px;
    padding: 2.5em 1em 1em 1em;
    width: 90%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1em;

    form {
        height: unset;
        width: unset;
        min-height: unset;

        div {
            display: unset;
        }

        input {
            width: 100%;
            height: 30px;
            border: none;
            border-radius: 10px;
            padding: 0 1em;
            outline: none;
        }
    }

    button {
        background-color: white;
        border: none;
        cursor: pointer;
        padding: .2em .5em;
        width: 100px;
        border-radius: 10px;

        &:nth-of-type(2) {
            margin-right: 2em;
            color: var(--error);
            font-family: 'Tahoma UGE Bold', sans-serif;
            font-weight: bold;
            border: 2px solid var(--error);

            &:hover {
                background-color: var(--error) !important;
                color: white;
            }
        }

        &:nth-of-type(3) {
            color: var(--secondary);
            font-family: 'Tahoma UGE Bold', sans-serif;
            font-weight: bold;
            border: 2px solid var(--secondary);

            &:hover {
                background-color: var(--secondary) !important;
                color: white;
            }
        }

        &:first-of-type {
            position: absolute;
            top: .5em;
            right: .5em;
            border: none;
            background-color: transparent;
            outline: none;
            cursor: pointer;
            width: unset;

            svg {
                width: 25px;
                height: 25px;
                fill: white
            }

            &:hover {
                background-color: transparent !important;

                svg {
                    fill: var(--error) !important;
                }
            }
        }
    }

    p,
    small {
        font-family: 'Tahoma UGE Bold', sans-serif;
        font-weight: bold;
        color: white;
        text-align: center;
    }
}

.modal-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 2;
}
</style>