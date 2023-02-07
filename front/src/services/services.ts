import axios from "axios";

const API_URL = "https://api.aroma-uge.tech";
/* const API_URL = "http://localhost:8080"; */

export const login = async (username: String, password: String) => {
  const response = await axios.post(`${API_URL}/login`, {
    username,
    password,
  });

  return response.data;
};

export const refreshToken = async (refreshToken: String) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${API_URL}/login/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      )
      .then((response) => {
        if (
          response.data.accessToken &&
          response.data.accessTokenExpirationDate
        ) {
          resolve({
            accessToken: response.data.accessToken,
            accessTokenExpirationDate: response.data.accessTokenExpirationDate,
          });
        }
      })
      .catch(() => {
        reject(false);
      });
  });
};

export const register = async (email: String, password: String) => {
  const response = await axios.post(`${API_URL}/register`, {
    email,
    password,
  });

  return response.data;
};

export const forgot = async (username: String) => {
  const response = await axios.get(`${API_URL}/register/forgot/${username}`);

  return response.data;
};

export const getStudentInfo = async (accessToken: String) => {
  const response = await axios.get(`${API_URL}/students/info`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getNextEventApprentice = async (accessToken: String) => {
  const response = await axios.get(`${API_URL}/calendar/apprenticeship/next`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getNextDayApprentice = async (accessToken: String) => {
  const response = await axios.get(
    `${API_URL}/calendar/apprenticeship/next/Entreprise`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getNextDayUniversity = async (accessToken: String) => {
  const response = await axios.get(
    `${API_URL}/calendar/apprenticeship/next/Cours`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getCalendarApprentice = async (accessToken: String) => {
  const response = await axios.get(`${API_URL}/calendar/apprenticeship`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const shareSchedule = async (accessToken: String, share: Boolean) => {
  const response = await axios.post(
    `${API_URL}/partage-edt/${share}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getNextClass = async (accessToken: String) => {
  const response = await axios.get(`${API_URL}/students/getnextclass`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getStudentTimetable = async (accessToken: String) => {
  const response = await axios.get(`${API_URL}/students/timetable`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getWeekTimetable = async (accessToken: string, date: string) => {
  const pattern = new RegExp(/^\d{1,2}-\d{1,2}-\d{4}$/);
  if (!pattern.test(date)) {
    return null;
  }
  const response = await axios.get(
    `${API_URL}/students/weektimetable/${date}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getFriends = async (accessToken: String) => {
  const response = await axios.get(`${API_URL}/friends`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getFriendNextClass = async (
  accessToken: String,
  friendId: String
) => {
  const response = await axios.get(`${API_URL}/friends/nextclass/${friendId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const deleteFriend = async (accessToken: String, friendId: String) => {
  const response = await axios.delete(`${API_URL}/friends/delete/${friendId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const friendsRequests = async (accessToken: String) => {
  const response = await axios.get(`${API_URL}/friends/requests`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const acceptFriendRequest = async (
  accessToken: String,
  friendId: String
) => {
  const response = await axios.post(
    `${API_URL}/friends/accept/${friendId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const declineFriendRequest = async (
  accessToken: String,
  friendId: String
) => {
  const response = await axios.post(
    `${API_URL}/friends/decline/${friendId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const requestFriend = async (accessToken: String, friendId: String) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${API_URL}/friends/request/${friendId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        resolve(response.data.message);
      })
      .catch((error) => {
        reject(error.response.data.error);
      });
  });
};

export const getFriendWeekTimetable = async (
  accessToken: string,
  date: string,
  friendId: string
) => {
  const pattern = new RegExp(/^\d{1,2}-\d{1,2}-\d{4}$/);
  if (!pattern.test(date)) {
    return null;
  }
  const response = await axios.get(
    `${API_URL}/friends/weektimetable/${date}/${friendId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const getTodoList = async (accessToken: String, todoType: String) => {
  const response = await axios.get(`${API_URL}/todo/${todoType}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const addTodo = async (
  accessToken: String,
  todoType: String,
  todo: String[]
) => {
  const response = await axios.post(`${API_URL}/todo/${todoType}/add`, todo, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const todoneTodo = async (
  accessToken: String,
  todoType: String,
  todoId: String
) => {
  const response = await axios.post(
    `${API_URL}/todo/${todoType}/todone/${todoId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const toactiveTodo = async (
  accessToken: String,
  todoType: String,
  todoId: String
) => {
  const response = await axios.post(
    `${API_URL}/todo/${todoType}/toactive/${todoId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const toggleTodo = async (
  accessToken: String,
  todoType: String,
  todoId: String,
  done: Boolean
) => {
  const path = done ? "todone" : "toactive";
  const response = await axios.post(
    `${API_URL}/todo/${todoType}/${path}/${todoId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

export const deleteTodo = async (
  accessToken: String,
  todoType: String,
  todoId: String
) => {
  const response = await axios.delete(
    `${API_URL}/todo/${todoType}/delete/${todoId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};
