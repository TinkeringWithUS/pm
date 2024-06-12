import { Link } from "react-router-dom";

import "./Header.css";

type pageMapToRoute = {
  page: string,
  route: string
}

const pageNameToRoutes: pageMapToRoute[] = [
  {
    page: "Home",
    route: "/"
  },
  {
    page: "Sign In",
    route: "/signin"
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

      </li>
    </ul>
  );
}

export default Header;

