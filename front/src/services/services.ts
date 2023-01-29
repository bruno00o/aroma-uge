import axios from "axios";

const API_URL = "https://api.aroma-uge.tech";
/* const API_URL = "http://localhost:8080"; */

export const login = async (username: String, password: String) => {
  const response = await axios.post(`${API_URL}/login`, {
    username,
    password,
  });

  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

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
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        if (response.data.accessToken && user) {
          user.accessToken = response.data.accessToken;
          user.accessTokenExpirationDate =
            response.data.accessTokenExpirationDate;
          localStorage.setItem("user", JSON.stringify(user));
          resolve(true);
        }
      })
      .catch(() => {
        reject(false);
      });
  });
};

export const updateUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem("user");
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
