import { useEffect, useState } from "react";
// import { RichText } from "./RichText";

import { EditorBar } from "./EditorBar";

import "./RichEditor.css";

enum RichTextTypes {
  Text = "p",
  Bold = "b",
  Underline = "u",
  List = "list", 
  List_Item = "li",
}

const editorOptions : string[] = Object.keys(RichTextTypes).map((key) => {
  console.log("key: " + key);
  // typeof creates an interface and keyof returns a list of keys from 
  // that interface
  return RichTextTypes[key as keyof typeof RichTextTypes];
});
 

function RichEditor() {

  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [newCharacter, setNewCharacter] = useState("");

  // TODO: replace RichTextTypes[] with something else, because 
  // it can't remove or modify nested children (the array has no concept
  // of nested nodes)
  const [richTextChildren, setRichTextChildren] = useState<RichTextTypes[]>([]);

  useEffect(() => {
    console.log("editor options: " + editorOptions);
  }, []);

  const handleInput = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();

    switch (event.key) {
      case "Enter":
        console.log("enter pressed");
        setRichTextChildren(prevChildren => [...prevChildren, RichTextTypes.Text]);
        console.log("prev children: " + richTextChildren);
        break;
      case "Delete":
        // don't register this in the node's text

        break;
      case "Backspace":
        if (event.currentTarget.textContent?.length == 0) {
          setRichTextChildren(prevChildren => { 
            // loop through, find the index, and remove current target from 
            // richTextChildren re renders the children
            const parentNode = event.currentTarget.parentNode;
            let currentNodeIndex: number = -1;

            parentNode?.childNodes.forEach((childNode, index) => {
              if(childNode === event.currentTarget) {
                currentNodeIndex = index;
                return;
              }
            });

            if(prevChildren.length > 2) {
              console.log("running prev children splice");
              return prevChildren.splice(currentNodeIndex, 1).slice();
            }
            return prevChildren;
          });
        } else {
          // just change the text, don't think anything needs to be done
        } 
        break;
      default:
        // check which option is highlighted currently
        // also detect which type of node this is (e.g. if this
        // is bold text, but current option is underline, add nested 
        // underline tag to current bold tag)
        // TODO: use a map to map 
        // editor options (which are strings) 
        // to RichTextTypes
        console.log("set new character, key: " + event.key);
        setNewCharacter(event.key);
        break;
    }
  }

  const renderChildren = (character: string) => {
    return richTextChildren.map((richTextChild, index) => {
      switch (richTextChild) {
        case RichTextTypes.Text:
          return <p key={character + index}>{character}</p> 
        case RichTextTypes.Bold: 
          return <b key={character + index}>{character}</b>
        case RichTextTypes.Underline: 
          return <u key={character + index}>{character}</u>
        default:
          break;
      }
    });
  }

  return (
    <div className="rich-editor-container">
      <EditorBar currentOptionIndex={currentOptionIndex} setCurrentOptionIndex={setCurrentOptionIndex}> 

      </EditorBar>

      <textarea onKeyDownCapture={(event) => handleInput(event)} className="rich-editor">
        {renderChildren(newCharacter)}
      </textarea>
    </div>
  );
}

export { RichEditor };