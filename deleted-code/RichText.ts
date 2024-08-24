import { RichTextNode, TextNodeType, TextOperation } from "./RichTextNode";


class RichText {
  private root: RichTextNode; 

  constructor() {
    this.root = new RichTextNode(null, TextNodeType.Div, 0);
  }

  addText(startPos: number, newCharacter: string, textType?: TextNodeType): void {
    // adding rich text requires the creation of a new node
    if(textType) {
      this.root.changeText(TextOperation.Add_Text, startPos, newCharacter, textType);
    } else {
      this.root.changeText(TextOperation.Add_Text, startPos, newCharacter)
    }
  }

  deleteText(startPos: number) {
    this.root.changeText(TextOperation.Delete_Text, startPos);
  }

  render(): React.ReactNode {
    return this.root.render();
  }
}

export { RichText };
