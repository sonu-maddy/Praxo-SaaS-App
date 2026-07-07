import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadTheme } from "../features/themeSlice";
import Sidebar from "../components/Sidebar";
import TopNav  from "../components/TopNav";

export default function AppLayout() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(loadTheme()); }, []);
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <TopNav />
        <div className="page-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
