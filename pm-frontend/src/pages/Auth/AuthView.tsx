import { Link } from "react-router-dom";

import "./AuthView.css";

function AuthView() {
  return (
    <div className="auth-options">
      <Link to="/register">
        Register
      </Link>
      <Link to="/signin">
        Sign In
      </Link>
    </div>
  );
}

export {
  AuthView
};