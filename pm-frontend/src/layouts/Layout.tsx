import { ReactNode } from "react";

import Header from "../components/Header";

type LayoutProps = {
  children: ReactNode
};

function Layout({ children }: LayoutProps) {

  return (
    <div>
      <Header></Header>
      {children}
    </div>
  );
}



export default Layout;