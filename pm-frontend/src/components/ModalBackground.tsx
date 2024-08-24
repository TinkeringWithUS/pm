import { CSSProperties, useState, useContext, useRef } from "react";

import "./ModalBackground.css";
import { modalContextValues } from "../contexts/ModalContext";

type ModalBackgroundProps = {
  isVisible: boolean,
  setVisibility: (isVisible: boolean) => void,
};


// TODO: FIND A USE FOR THIS
function ModalBackground({ isVisible, setVisibility }: ModalBackgroundProps) {

  const [styling, setStyling] = useState<CSSProperties>({});

  const { setAnyModalOpen } = useContext(modalContextValues);

  const modalBackgroundRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {

    // check is click is on background or on foreground elements
    // if(event.currentTarget !== modalBackgroundRef.current) {
    //   return;
    // }

    console.log("modal background is clicked");

    const newVisibility = !isVisible;

    setVisibility(newVisibility);
    setAnyModalOpen(newVisibility);

    if (newVisibility) {
      setStyling({
        display: "inline"
      });
    } else {
      setStyling({
        display: "none"
      });
    }
  }

  return (
    <div className="modal-background" onClick={handleClick}
      style={styling} ref={modalBackgroundRef}>
    </div>
  );
}



export { ModalBackground };