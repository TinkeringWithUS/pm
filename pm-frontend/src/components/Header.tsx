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
    page: "Log In",
    route: "/auth"
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
    </ul>
  );
}

export default Header;

