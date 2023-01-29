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

export const saveTheme = (theme: string, color: string) => {
  localStorage.setItem("theme", theme);
  localStorage.setItem("color", color);
};

export const getActualTheme = () => {
  return document.body.classList[0];
};

export const getSavedTheme = () => {
  return {
    theme: localStorage.getItem("theme"),
    color: localStorage.getItem("color"),
  };
};

export const changeTheme = (theme: string, color: string) => {
  const body = document.querySelector("body");
  const classNames = theme.replace("--", "");
  if (body?.classList.length) {
    body.classList.forEach((className) => {
      body?.classList.remove(className);
    });
  }
  body?.classList.add(classNames);
  const metaThemeColor = document.querySelector("meta[name=theme-color]");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", color);
  }
  saveTheme(theme, color);
  return theme;
};

export const getWindowWidth = () => {
  return window.innerWidth;
};
