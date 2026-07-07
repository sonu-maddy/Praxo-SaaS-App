import { configureStore } from "@reduxjs/toolkit";
import userReducer      from "../features/userSlice";
import workspaceReducer from "../features/workspaceSlice";
import projectReducer   from "../features/projectSlice";
import taskReducer      from "../features/taskSlice";
import themeReducer     from "../features/themeSlice";

export const store = configureStore({
  reducer: {
    user:      userReducer,
    workspace: workspaceReducer,
    project:   projectReducer,
    task:      taskReducer,
    theme:     themeReducer,
  },
});
