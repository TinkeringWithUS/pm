import { BrowserRouter, Route, Routes } from "react-router-dom";

import HomeView from "./pages/Home";
import AuthView from "./pages/AuthView.1";
import Layout from "./layouts/Layout";

import "./App.css";

function App() {

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/auth" element={<AuthView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
