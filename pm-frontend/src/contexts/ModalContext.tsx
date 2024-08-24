import { ReactNode, useState } from "react";

import { createContext } from "react";

type modalContextTypes = {
  anyModalOpen: boolean,
  setAnyModalOpen: (isOpen: boolean) => void
};

const modalContextValues = createContext<modalContextTypes>({
  anyModalOpen: false,
  setAnyModalOpen: () => { }
});

type modalContextProps = {
  children: ReactNode
};

function ModalContext({ children }: modalContextProps) {

  const [anyModalOpen, setAnyModalOpen] = useState(false);

  const providedValues: modalContextTypes = {
    anyModalOpen: anyModalOpen,
    setAnyModalOpen: setAnyModalOpen
  };

  return (
    <modalContextValues.Provider value={providedValues}>
      {children}
    </modalContextValues.Provider>
  );
}

export { ModalContext, modalContextValues };
