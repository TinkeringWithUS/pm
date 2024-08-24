import { Link } from "react-router-dom";

import { AuthContextValues } from "../contexts/AuthContext";

import { useContext } from "react";

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

  const { isLoggedIn, profilePictureUrl } = useContext(AuthContextValues);

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
      {isLoggedIn && (
        <li>
          <Link to="/profile">
            {profilePictureUrl ? (
              <img src={profilePictureUrl} className="profile-picture-user"/>
            ) : (
              "Profile"
            )}
          </Link>
        </li>)}
      { 

      }
    </ul>
  );
}

export default Header;

