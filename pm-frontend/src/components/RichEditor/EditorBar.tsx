import "./EditorBar.css";

const editorOptions = [
  "bold",
  "underline"
];

// TODO: add icons to editor options
// const editorOptionsToIcons = new Map([
//   "bold": 
// ]);

type setNumberState = (numArg: number) => void;

type editorBarProps = {
  currentOptionIndex: number,
  setCurrentOptionIndex: setNumberState
};

function EditorBar({ currentOptionIndex, setCurrentOptionIndex }: editorBarProps) {
  // keep track of current editor option
  // highlight the current option index
  return (
    <ul className="text-edit-options">
      {editorOptions.map((option, index) => {
        return (
          <li key={option + index} onClick={() => setCurrentOptionIndex(index)}
            className={(currentOptionIndex == index) ? "active-option" : "inactive-option"}>
            {option}
          </li>
        );
      })}
    </ul>
  );
}

export { EditorBar };