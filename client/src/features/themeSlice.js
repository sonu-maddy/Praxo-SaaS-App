import { createSlice } from "@reduxjs/toolkit";

const applyTheme = (theme) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("theme", theme);
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: localStorage.getItem("theme") || "light" },
  reducers: {
    loadTheme: (state) => {
      const saved = localStorage.getItem("theme") || "light";
      state.mode = saved;
      applyTheme(saved);
    },
    setTheme: (state, { payload }) => {
      state.mode = payload;
      applyTheme(payload);
    },
  },
});

export const { loadTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
