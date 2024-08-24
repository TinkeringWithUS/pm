import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomeView from "./pages/Home";
import HeaderLayout from "./layouts/HeaderLayout";

import "./App.css";
import { DocumentView } from "./pages/Documents/DocumentView";
import { AuthContext } from "./contexts/AuthContext";
import { ModalContext } from "./contexts/ModalContext";

import { ChatroomView } from "./pages/Chatroom/ChatroomView";
import { ProfileView } from "./pages/Profile/ProfileView";
import { RegisterView } from "./pages/Auth/RegisterView";
import { SignInView } from "./pages/Auth/SignInView";


function App() {

  return (
    <BrowserRouter>
      <ModalContext>
        <AuthContext>
          <HeaderLayout>
            <Routes>
              <Route path="/" element={<HomeView />} />

              <Route path="/register" element={<RegisterView />} />
              <Route path="/signin" element={<SignInView />} />
              <Route path="/chat" element={<ChatroomView />} />
              <Route path="/profile" element={<ProfileView />} />

            </Routes>

            <Routes>
              {/* temporary path */}
              <Route path="/doc" element={<DocumentView />} />
            </Routes>
          </HeaderLayout>
        </AuthContext>

      </ModalContext>

    </BrowserRouter>
  );
}

export default App;
