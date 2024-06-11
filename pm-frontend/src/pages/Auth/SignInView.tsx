import { FormEvent, useState } from "react";

import { BACKEND_URL, authValues, signInResponse } from "../../../../shared/networkInterface";

import { Link } from "react-router-dom";

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

  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  // const [showAlreadyRegistered, setShowAlreadyRegistered] = useState<boolean>(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {

    event.preventDefault();

    // checks if username or password is empty
    if(!username) {
      setFormErrors((prevFormErrors) => {
        const newFormErrors = {
          username: true,
          password: prevFormErrors.password,
        }
        return newFormErrors;
      });
    }

    if(!password) {
      setFormErrors((prevFormErrors) => {
        const newFormErrors = {
          username: prevFormErrors.username,
          password: true,
        }
        return newFormErrors;
      });
    }

    setError(!password || !username);

    const signInData: authValues = {
      username: username,
      password: password,
    }

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
        .then((data: signInResponse) => {
          // session token is empty string
          if(!data.sessionToken) {
            console.log("failed to sign in");
          } else {
            // setAlreadyRegistered(true);
            console.log("fetched success");
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
            value={username} onChange={(e) => setUsername(e.target.value)} />
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
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
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
    </div>
  );
}

export {
  SignInView
};