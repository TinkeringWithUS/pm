import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomeView from "./pages/Home";
import Layout from "./layouts/Layout";
import RegisterView from "./pages/Auth/RegisterView";
import { SignInView } from "./pages/Auth/SignInView";

import "./App.css";

function App() {

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/register" element={<RegisterView/>} />
          <Route path="/signin" element={<SignInView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
