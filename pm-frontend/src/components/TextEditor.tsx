import { useEffect } from "react";
import "./TextEditor.css";
// import { RichEditor } from "./RichEditor/RichEditor";

function TextEditor() {

  const saveText = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    
  }

  // TODO: replace textarea with custom rich text editor
  // trigger save event every x seconds
  useEffect(() => {


  }, []);

  return (
    <>
      <p>Text Editor</p>
      {/* <textarea className="text-editor"> </textarea> */}
      {/* <RichEditor>

      </RichEditor> */}
      <textarea name="text-editor" id="text-editor"> </textarea>
      <button onClick={(event) => saveText(event)}>Save</button>
    </>
  );
}

export { TextEditor };