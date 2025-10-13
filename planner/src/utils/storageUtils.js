export const getData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};
export const setData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
export const clearData = (key) => localStorage.removeItem(key);
