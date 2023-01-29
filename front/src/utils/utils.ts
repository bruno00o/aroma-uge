export const frDateToDate = (date: string) => {
  return new Date(date.split("/").reverse().join("-"));
};

export const dateToFrDate = (date: Date) => {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const daysFromNow = (date: Date) => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

export const daysFromNowString = (date: Date) => {
  const days = daysFromNow(date);
  if (days === 0) {
    return "Aujourd'hui";
  } else if (days === 1) {
    return "Demain";
  } else {
    return `Le ${dateToFrDate(date)}`;
  }
};

export const eventToNiceString = (event: string) => {
  switch (event) {
    case "Cours":
      return "À l'université";
    case "Entreprise":
      return "En entreprise";
    case "Férié":
      return "Férié";
  }
  return event;
};

export const saveTheme = (theme: string) => {
  localStorage.setItem("theme", theme);
};

export const getActualTheme = () => {
  return document.body.classList[0];
};

export const getSavedTheme = () => {
  return localStorage.getItem("theme");
};

export const changeTheme = (theme: string) => {
  const body = document.querySelector("body");
  const classNames = theme.replace("--", "");
  if (body?.classList.length) {
    body.classList.forEach((className) => {
      body?.classList.remove(className);
    });
  }
  body?.classList.add(classNames);
  saveTheme(theme);
  return theme;
};

export const getWindowWidth = () => {
  return window.innerWidth;
}