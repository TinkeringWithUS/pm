const BACKEND_URL = "http://localhost:3000";

type mouseMove = {
  posX: number,  
  posY: number, 
};

type userInfo = {
  userId: number, 
  mouseInfo: mouseMove
};

type authValues = {
  username: string,
  password: string
};

type authResponse = {
  registered: boolean
};

type signInResponse = {
  sessionToken: string
};


export {
  type mouseMove, type userInfo, type authValues,
  type authResponse, type signInResponse, BACKEND_URL
};
