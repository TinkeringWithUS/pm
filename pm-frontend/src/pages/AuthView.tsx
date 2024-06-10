import { FormEvent, useState } from "react";

import { BACKEND_URL, authResponse, authValues } from "../../../shared/networkInterface";

import "./AuthView.css";

type formErrors = {
  username: boolean,
  password: boolean
};

function AuthView() {

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

    const registerData : authValues = {
      username: username,
      password: password,
    }

    // Note: adding headers to post request 
    // with application/json allows the 
    // server to actually parse the json data, else
    // we get undefines
    if(!error) {
      // POST 
      fetch(BACKEND_URL + "/register", {
        method: "POST",
        body: JSON.stringify(registerData),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      })
        .then(response => response.json())
        .then((data: authResponse) => {
          if(!data.registered) {
            console.log("failed to register");
          } else {
            // setAlreadyRegistered(true);
            console.log("fetched success");
          }
        })
        .catch();
    }
  }

  return (
    <>
      {/* {
        showAlreadyRegistered && 
        <div className="registered-modal">

        </div>  
      } */}
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
    
    </>
    
  );
}

export default AuthView;

