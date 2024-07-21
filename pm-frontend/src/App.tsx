import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomeView from "./pages/Home";
import HeaderLayout from "./layouts/HeaderLayout";
import RegisterView from "./pages/Auth/RegisterView";
import { SignInView } from "./pages/Auth/SignInView";

import "./App.css";
import { DocumentView } from "./pages/Documents/DocumentView";
import { AuthContext } from "./contexts/AuthContext";
import { ChatroomView } from "./pages/Chatroom/ChatroomView";



function App() {

  return (
    <BrowserRouter>
      <HeaderLayout>
        <Routes>
          <Route path="/" element={<HomeView />} />
        </Routes>

        <AuthContext>
          <Routes>
            <Route path="/register" element={<RegisterView />} />
            <Route path="/signin" element={<SignInView />} />
            <Route path="/chat" element={<ChatroomView />} />
          </Routes>
        </AuthContext>

        <Routes>
          {/* temporary path */}
          <Route path="/doc" element={<DocumentView />} />
        </Routes>
      </HeaderLayout>
    </BrowserRouter>
  );
}

export default App;
