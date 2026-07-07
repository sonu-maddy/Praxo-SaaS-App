import { createSlice } from "@reduxjs/toolkit";

const workspaceSlice = createSlice({
  name: "workspace",
  initialState: {
    workspaces: [],
    currentWorkspace: null,
  },

  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;

      const savedId = localStorage.getItem("currentWorkspaceId");

      if (savedId) {
        const found = state.workspaces.find(
          (w) => String(w._id) === String(savedId),
        );

        state.currentWorkspace = found || null;
      } else if (state.workspaces.length > 0) {
        // Auto select first workspace
        state.currentWorkspace = state.workspaces[0];
        localStorage.setItem("currentWorkspaceId", state.workspaces[0]._id);
      } else {
        state.currentWorkspace = null;
      }
    },

    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload || null;

      if (action.payload?._id) {
        localStorage.setItem("currentWorkspaceId", action.payload._id);
      }
    },

    addWorkspace: (state, action) => {
      state.workspaces.push(action.payload);

      // Auto select new workspace
      state.currentWorkspace = action.payload;

      localStorage.setItem("currentWorkspaceId", action.payload._id);
    },


    setWorkspaceProjects: (state, action) => {
      if (state.currentWorkspace) {
        state.currentWorkspace.projects = action.payload;
      }
    },
  },
});

export const { setWorkspaces, setCurrentWorkspace, addWorkspace,setWorkspaceProjects  } =
  workspaceSlice.actions;

export default workspaceSlice.reducer;
