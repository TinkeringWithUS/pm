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


export {
  type mouseMove, type userInfo, type authValues, 
  type authResponse, BACKEND_URL
};
