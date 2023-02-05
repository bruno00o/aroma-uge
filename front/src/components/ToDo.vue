<script setup lang="ts">
import { useLoaderStore } from "@/stores/loader";
import { useUserStore } from "@/stores/user";
import { ref, onBeforeMount } from "vue";
import {
  getTodoList,
  addTodo,
  deleteTodo,
  toggleTodo,
} from "@/services/services";

const loaderStore = useLoaderStore();
const userStore = useUserStore();

const dataFetched = ref(false);
const addTodoModal = ref(false);
const addTodoText = ref("");

const props = defineProps({
  todoType: String,
  h2: String,
});

const todos = ref([] as any);

const loadTodos = async () => {
  loaderStore.startLoading();
  todos.value = [];
  const res = await getTodoList(
    userStore.getAccessToken,
    props.todoType as string
  );

  for (const todo in res.active) {
    todos.value.push({
      id: todo,
      text: res.active[todo],
      done: false,
    });
  }
  for (const todo in res.done) {
    todos.value.push({
      id: todo,
      text: res.done[todo],
      done: true,
    });
  }

  loaderStore.stopLoading();
  dataFetched.value = true;
};

onBeforeMount(async () => {
  await loadTodos();
});

const addTodoToList = async () => {
  loaderStore.startLoading();
  if (addTodoText.value === "") {
    loaderStore.stopLoading();
    return;
  }
  await addTodo(userStore.getAccessToken, props.todoType as string, [
    addTodoText.value,
  ]);
  await loadTodos();
  addTodoModal.value = false;
  addTodoText.value = "";
  loaderStore.stopLoading();
};
</script>
<template>
  <h2>
    {{ h2 }}
    <button class="main-button" @click="addTodoModal = true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path
          d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
        />
      </svg>
    </button>
  </h2>
  <div class="todo-list" v-if="todos.length > 0">
    <div class="todo" v-for="todo in todos" :key="todo.id">
      <input
        type="checkbox"
        name="todo"
        :id="todo.id"
        v-model="todo.done"
        @change="
          toggleTodo(
            userStore.getAccessToken,
            props.todoType as string,
            todo.id,
            todo.done
          )
        "
      />
      <label :for="todo.id">
        <p>{{ todo.text }}</p>
        <button
          @click.stop="
            deleteTodo(
              userStore.getAccessToken,
              props.todoType as string,
              todo.id
            ),
              todos.splice(todos.indexOf(todo), 1)
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
            <path
              d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
            />
          </svg>
        </button>
      </label>
    </div>
  </div>
  <div class="todo-list" v-else>
    <p>Aucun rappel</p>
  </div>

  <div class="modal" v-if="addTodoModal">
    <div class="modal-content">
      <h2>Ajouter un rappel</h2>
      <form @submit.prevent="addTodoToList">
        <input
          type="text"
          name="todo"
          id="todo"
          placeholder="Rappel"
          v-model="addTodoText"
          autocomplete="off"
        />
        <div class="modal-buttons">
          <button type="submit">Ajouter</button>
          <button @click="addTodoModal = false">Annuler</button>
        </div>
      </form>
    </div>
    <div class="modal-background" @click="addTodoModal = false"></div>
  </div>
</template>

<style scoped lang="scss">
h2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-button {
  width: 2em;
  height: 2em;
  border-radius: 0.5em;
  padding: 0.3em;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  svg {
    width: 100%;
    height: 100%;
    fill: white;
  }
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 1em;

  .todo {
    display: flex;
    align-items: center;
    background-color: var(--primary-color);
    padding: 0.5em;
    border-radius: 0.5em;

    &:hover {
      background-color: var(--primary-color-hover);
    }

    input {
      position: relative;
      appearance: none;
      height: 20px;
      width: 22px;
      margin-right: 1em;
      margin-left: 0.5em;

      &::before {
        content: "";
        display: block;
        width: 20px;
        height: 20px;
        border-radius: 0.5em;
        background-color: white;
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
      }

      &:checked {
        &::after {
          content: "";
          display: block;
          width: 15px;
          height: 15px;
          border-radius: 5px;
          background-color: var(--secondary-color);
          cursor: pointer;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        & + label {
          p {
            text-decoration: line-through;
          }
        }
      }
    }

    label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      border-radius: 0.5em;
      cursor: pointer;
      color: white;

      p {
        margin: 0;
        word-break: break-word;
        width: 100%;
        margin-right: 1em;
        font-size: 1.1rem;
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
      }

      button {
        background-color: white;
        border: 2px solid var(--error-color);
        cursor: pointer;
        outline: none;
        width: 2.5em;
        height: 2.5em;
        border-radius: 0.5em;
        padding: 0.3em;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        svg {
          width: 100%;
          height: 100%;
          fill: var(--error-color);
        }

        &:hover {
          background-color: var(--error-color);
          svg {
            fill: white;
          }
        }
      }
    }
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .modal-content {
    background-color: var(--primary-color);
    border-radius: 0.5em;
    padding: 1em;
    width: 100%;
    max-width: 95%;
    display: flex;
    flex-direction: column;
    gap: 1em;

    h2 {
      font-size: 1.2rem;
      color: white;
    }

    p {
      font-size: 1rem;
      color: white;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1em;

      input {
        flex: 1;
        padding: 0.5em;
        border: none;
        outline: none;
        border-radius: 0.5em;
        background-color: white;
        font-size: 1rem;
      }

      .modal-buttons {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 1em;

        button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: white;
          padding: 0.5em 1em;
          border-radius: 0.5em;
          transition: background-color 0.2s ease-in-out;

          &:hover {
            background-color: var(--primary-color-hover);
          }

          &:first-of-type {
            background-color: var(--success-color);
          }

          &:last-of-type {
            background-color: var(--error-color);
          }
        }
      }
    }
  }

  .modal-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
}
</style>
