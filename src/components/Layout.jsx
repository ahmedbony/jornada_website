import { Outlet } from "react-router-dom";
import Nav from "./Nav.jsx";

export default function Layout() {
  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        Western Agricultural Water Adaptation Menu — prototype
      </footer>
    </>
  );
}
