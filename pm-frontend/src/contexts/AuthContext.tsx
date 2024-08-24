import { createContext, useState, ReactNode, useEffect } from "react";
import { BACKEND_URL, loginInfo, loginResponse } from "../../../shared/networkInterface";

type authContextProps = {
  children: ReactNode
};

type setLoggedIn = (loginStatus: boolean) => void;
type setUsername = (username: string) => void;
type setSessionToken = (token: string) => void;
type setProfilePicture = (profilePicture: string) => void;

type authContext = {
  isLoggedIn: boolean,
  username: string,
  sessionToken: string,
  profilePictureUrl: string | null,
  setLoggedIn: setLoggedIn,
  setUsername: setUsername,
  setSessionToken: setSessionToken 
  setProfilePictureUrl: setProfilePicture
};

const AuthContextValues = createContext<authContext>({
  isLoggedIn: false,
  username: "",
  sessionToken: "",
  profilePictureUrl: null,
  setLoggedIn: () => {},
  setUsername: () => {},
  setSessionToken: () => {},
  setProfilePictureUrl: () => {}
});

// Creates a function that stores the key value pair in local storage
function cacheSetter(setter: (value: string) => void, key: string) {
  return function(value: string) {
    setter(value);

    localStorage.setItem(key, value);

    console.log("cacheSetter, local storage set item at key: " + key + ". at localStorage[key]: " + localStorage.getItem(key));
  }
}

function AuthContext({ children }: authContextProps) {

  // const AuthContext = createContext<authContext>({
  //   isLoggedIn: false,
  //   username: "anon",
  // });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [sessionToken, setSessionToken] = useState("");

  // browser automatically caches the profile picture, no need 
  // to save to local storage then
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    const cachedUsername = localStorage.getItem("username");
    const cachedSessionToken = localStorage.getItem("sessionToken");

    if(cachedSessionToken && cachedUsername) {
      const siginInfo : loginInfo = {
        username: cachedUsername, 
        sessionToken: cachedSessionToken, 
      };

      console.log("before send. cached username: " + cachedUsername);
      console.log("before send. cached session token: " + cachedSessionToken);

      console.log(JSON.stringify(siginInfo));
      console.log("sigin info: " + siginInfo.username);

      fetch(BACKEND_URL + "/login", {
        method: "POST",
        body: JSON.stringify(siginInfo),
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      })
      .then((response) => response.json()) 
      .then((loginResponse : loginResponse) => {
        console.log("cached username: " + cachedUsername);
        console.log("auth context, sending creds. is logged in: " + loginResponse.loggedIn);
        if(loginResponse.loggedIn) {
          setSessionToken(cachedSessionToken);
          setUsername(cachedUsername);

          if(loginResponse.profilePicture) {
            setProfilePictureUrl(URL.createObjectURL(loginResponse.profilePicture));
            console.log(profilePictureUrl);
          }
        }
      })
      .catch(() => {
        // don't do anything
      });
    }
  }, []);

  const cachedSetUsername = cacheSetter(setUsername, "username");
  const cachedSetSessionToken = cacheSetter(setSessionToken, "sessionToken");

  const providedValue : authContext = {
    isLoggedIn: isLoggedIn, 
    username: username, 
    sessionToken: sessionToken,
    profilePictureUrl: profilePictureUrl,
    setLoggedIn: setIsLoggedIn,
    setUsername: cachedSetUsername, 
    setSessionToken: cachedSetSessionToken,
    setProfilePictureUrl: setProfilePictureUrl,
  };

  return (
    <AuthContextValues.Provider value={providedValue}>
      {children}
    </AuthContextValues.Provider>
  );
}

export { AuthContext, AuthContextValues };