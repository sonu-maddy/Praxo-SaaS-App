import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projects: [],
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },

    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },

    removeProject: (state, action) => {
      state.projects = state.projects.filter(
        (p) => p._id !== action.payload
      );
    },

    updateProject: (state, action) => {
      const index = state.projects.findIndex(
        (p) => p._id === action.payload._id
      );
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setProjects,
  addProject,
  removeProject,
  updateProject,
  setLoading,
  setError,
} = projectSlice.actions;

export default projectSlice.reducer;