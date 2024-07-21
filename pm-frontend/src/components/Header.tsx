import { Link } from "react-router-dom";

import "./Header.css";

type pageMapToRoute = {
  page: string,
  route: string
}

// TODO: move pageNameToRoutes over to App.tsx
const pageNameToRoutes: pageMapToRoute[] = [
  {
    page: "Home",
    route: "/"
  },
  {
    page: "Sign In",
    route: "/signin"
  }, 
  {
    page: "Text Editor", 
    route: "/doc"
  }, 
  {
    page: "Chat", 
    route: "/chat"
  }
];

function Header() {

  return (
    <ul className="header-item-list">
      {pageNameToRoutes.map((pageToRoute, pageIndex) => {
        return (
          <li key={pageToRoute.page + pageIndex} className="header-item">
            <Link to={pageToRoute.route}>{pageToRoute.page}</Link>
          </li>
        );
      })}
      {/* User Profile Picture when signed in */}
      <li>
        Profile Pic
      </li>
    </ul>
  );
}

export default Header;

