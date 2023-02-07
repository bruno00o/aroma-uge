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

export const dateToShortFrDate = (date: Date) => {
  if (date === null) {
    return "";
  }
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const dateTimeToFrDate = (date: Date) => {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    minute: "2-digit",
    hour: "2-digit",
  });
};

export const timeToFrTime = (date: Date) => {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const urlFrDate = (date: Date) => {
  return dateToShortFrDate(date).split("/").join("-");
};

export const bestMonday = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  /* TODO: make this function in API to get best monday based on the timetable */
  if (date.getDay() === 6) {
    date.setDate(date.getDate() + 2);
  } else if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1);
  } else {
    date.setDate(date.getDate() - date.getDay() + 1);
  }
  return date;
};

export const nextMonday = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  if (date.getDay() === 1) {
    date.setDate(date.getDate() + 7);
  } else {
    date.setDate(date.getDate() - date.getDay() + 8);
  }
  return date;
};

export const previousMonday = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  if (date.getDay() === 1) {
    date.setDate(date.getDate() - 7);
  } else {
    date.setDate(date.getDate() - date.getDay() + 1);
  }
  return date;
};

export const getMondayByDate = (date: Date) => {
  date.setHours(0, 0, 0, 0);
  if (date.getDay() === 1) {
    return date;
  } else {
    return previousMonday(date);
  }
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
    case "F":
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

export const isInstalled = () => {
  return window.matchMedia("(display-mode: standalone)").matches;
};

export const isIOS = () => {
  return (
    (
      [
        "iPad Simulator",
        "iPhone Simulator",
        "iPod Simulator",
        "iPad",
        "iPhone",
        "iPod",
      ] as string[]
    ).includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  );
};
