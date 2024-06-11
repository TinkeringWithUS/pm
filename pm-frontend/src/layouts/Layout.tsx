import { ReactNode } from "react";

import Header from "../components/Header";

import "./Layout.css";

type LayoutProps = {
  children: ReactNode
};

function Layout({ children }: LayoutProps) {

  return (
    <div id="layout-container">
      <Header></Header>
      {children}
    </div>
  );
}



export default Layout;