import { FormEvent, useState, useContext } from "react";

import { BACKEND_URL, authResponse, authValues } from "../../../../shared/networkInterface";

import { Link } from "react-router-dom";

import { AuthContextValues } from "../../contexts/AuthContext";

import "./SigninView.css";

type formErrors = {
  username: boolean,
  password: boolean
};

function SignInView() {

  const [error, setError] = useState(false);
  const [formErrors, setFormErrors] = useState<formErrors>({
    username: false,
    password: false
  });

  const [loginAttempt, setLoginAttempt] = useState<boolean | null>(null);

  const [displayUsername, setDisplayUsername] = useState("");
  const [displayPassword, setDisplayPassword] = useState<string>("");
  // const [username, setUsername] = useState<string>("");
  // const [showAlreadyRegistered, setShowAlreadyRegistered] = useState<boolean>(false);

  const { username, isLoggedIn, setLoggedIn, setUsername, setSessionToken } = useContext(AuthContextValues);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    // checks if username or password is empty
    if(!displayUsername) {
      setFormErrors((prevFormErrors) => {
        const newFormErrors = {
          username: true,
          password: prevFormErrors.password,
        }
        return newFormErrors;
      });
    }

    if(!displayPassword) {
      setFormErrors((prevFormErrors) => {
        const newFormErrors = {
          username: prevFormErrors.username,
          password: true,
        }
        return newFormErrors;
      });
    }

    setError(!displayPassword || !username);

    const signInData: authValues = {
      username: displayUsername,
      password: displayPassword,
    }

    console.log("sending username: " + displayUsername + ". when signing in");

    // Note: adding headers to post request 
    // with application/json allows the 
    // server to actually parse the json data, else
    // we get undefines
    if(!error) {
      // POST 
      fetch(BACKEND_URL + "/signin", {
        method: "POST",
        body: JSON.stringify(signInData),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      })
        .then(response => response.json())
        .then((data: authResponse) => {
          // session token is empty string
          if(!data.registered) {
            setLoggedIn(false);
            setDisplayPassword("");

            setLoginAttempt(false);
            console.log("failed to sign in");
          } else {
            // setAlreadyRegistered(true);
            setSessionToken(data.sessionToken);
            setUsername(displayUsername);
            setDisplayPassword("");
            setDisplayUsername("");

            setLoginAttempt(true);
            setLoggedIn(true);

            console.log("successful sign in");
          }
        })
        .catch();
    }
  }

  return (
    <div className="register-container">
      <form onSubmit={(event) => handleSubmit(event)}
        className="auth-form">
        <div className="auth-inputs">
          <label htmlFor="auth-username">Username</label>
          <input type="text" name="username" id="auth-username"
            value={displayUsername} onChange={(e) => setDisplayUsername(e.target.value)} 
            />
          {
            error && formErrors.username &&
            <div className="auth-error">
              Empty username
            </div>
          }
        </div>

        <div className="auth-inputs">
          <label htmlFor="auth-password">Password</label>
          <input type="password" name="password" id="auth-password"
            value={displayPassword}
            onChange={(e) => setDisplayPassword(e.target.value)} />
          {
            error && formErrors.password &&
            <div className="auth-error">
              Empty Password
            </div>
          }
        </div>
        <button type="submit">Submit</button>
      </form>
      <Link to="/register">
        Register
      </Link>
      {
        isLoggedIn && (
          <div id="logged-in-notif">
            Logged In! 
          </div>
        )  
      }
      {
        (!loginAttempt) && (
          <div id="failed-logged-in-notif">
            Failed to login
          </div>
        )
      }
      
    </div>
  );
}

export {
  SignInView
};