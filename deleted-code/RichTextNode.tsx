import React from "react";

// later on, add stuff like lists, headings, etc.
enum TextNodeType {
  // Content Text Nodes
  Bold,
  Underline,
  Plain,

  // Container Nodes
  Div,
  UnorderedList,
  OrderedList,
  ListItem,
}

enum TextOperation {
  Add_Text,
  Delete_Text,
  Modify_Text, // adding and deleting text
  Change_Type, // like turning plain text into bold text
}

// 2 distinct types of nodes 
// 1. leaf nodes (holding actual content)
// 2. container nodes (holding other kinds of nodes)
// we can infer if this node is 1. or 2. by looking at it's children
// Note: Text changes will happen one key press at a time, 
// not possible to edit multiple characters at once 
// TODO: Buffer Writes to Rich Text Editor 
class RichTextNode {

  private type: TextNodeType;
  private text: string;

  private parentNode: RichTextNode | null;
  private startCharCount: number;

  private children: RichTextNode[];

  private renderedContent: React.ReactNode[];

  public static isLeafNode(node: RichTextNode): boolean {
    switch (node.type) {
      case TextNodeType.Bold:
      case TextNodeType.Plain:
      case TextNodeType.Underline:
        return true;
      default:
        return false;
    }
  }

  constructor(parentNode: RichTextNode | null, nodeType: TextNodeType,
    startCharCount: number, nodeText?: string,) {
    this.type = nodeType;
    this.parentNode = parentNode;

    this.startCharCount = startCharCount;

    // null coalescing operator
    this.text = nodeText ?? "";
    this.children = [];

    this.renderedContent = [];
  }

  // given a curosr position (# of characters before the cursor)
  // return the childNode corresponding to 
  // Betting on low number of nesting
  // Precondition: cursorStartPos to cursorEndPos will refer to only 
  // one rich text node
  private findNode(cursorStartPos: number): RichTextNode | null {
    if (this.startCharCount <= cursorStartPos && RichTextNode.isLeafNode(this)) {
      return this;
    }

    for (const child of this.children) {
      // find the child where child.startPos <= cursorStartPos <= 
      // found the node for the text to change change
      const foundNode = child.findNode(cursorStartPos);
      if (foundNode) {
        return foundNode;
      }
    }
    return null;
  }

  private findNodeIndex(node: RichTextNode): number {
    return this.children.findIndex((child) => {
      return child == node;
    });
  }

  // find the child node to change the text
  changeText(textOperation: TextOperation, startPos: number, changedCharacter?: string,
    changedTextType?: TextNodeType): void {
    const nodeToChange = this.findNode(startPos);

    // couldn't find the node to change
    if (!nodeToChange) {
      return;
    }

    // deleting node is easy, nodeTochange.parent.find(nodeToChange) 
    // and remove it, adding node should be roughly the same 
    // modifying text (not deleting or adding nodes) could span multiple 
    // nodes, 
    const textStart = startPos - nodeToChange.startCharCount;
    const textEnd = startPos - nodeToChange.startCharCount;

    const textBeforeChange = nodeToChange.text.substring(0, textStart);
    const textAfterChange = nodeToChange.text.substring(textEnd);

    if (textOperation == TextOperation.Add_Text) {
      nodeToChange.text = textBeforeChange + changedCharacter + textAfterChange;

      // TODO: think of a different data structure to deal 
      // with updating next siblings (buffering writes would help)
      // 
      // TODO: maybe wrap this functionality in a method
      const thisNodeIndex = this.findNodeIndex(this);

      if (this.parentNode) {
        for (let nextSibling = thisNodeIndex + 1; nextSibling < this.parentNode.children.length; nextSibling++) {
          this.parentNode.children[nextSibling].startCharCount += 1;
        }
      }
    } else if (textOperation == TextOperation.Delete_Text) {
      // remove, and jump to sibling to modify sibling's next
      nodeToChange.text = textBeforeChange + textAfterChange;

      // TODO: jump to sibling to adjust start character count
      const thisNodeIndex = this.findNodeIndex(this);

      // TODO: duplicate logic, extract
      if (this.parentNode) {
        for (let nextSibling = thisNodeIndex + 1; nextSibling < this.parentNode.children.length; nextSibling++) {
          this.parentNode.children[nextSibling].startCharCount -= 1;
        }
      }
    } else if (textOperation == TextOperation.Change_Type) {
      // ex: if plain text "abc" becomes "<b>ab</b>c", split the nodes
      // into 2, add new node to parent's children
      // logic for this will be complicated, ex: highlight 10 characters
      // and turn into bold
      // TODO: 

    }
  }

  private renderChildren(childNode?: RichTextNode): React.ReactNode {
    // memoize children jsx
    // render on start
    if (this.renderedContent.length == 0) {
      this.renderedContent = this.children.map((childNode) => {
        return childNode.render();
      });
    }

    if (childNode) {
      const foundIndex = this.findNodeIndex(childNode);

      // found the child to re render
      if (foundIndex >= 0) {
        // signals based, update the exact node
        this.renderedContent[foundIndex] = this.children[foundIndex].render();
      }
    }

    // TODO: might need to join all the rendered jsx into 
    // one giant blob
    return this.renderedContent;
  }

  // TODO: figure out a way to simplify this logic (need dynamic rendering, 
  // e.g. return outer tag which takes in another react element)
  render(): React.ReactNode {
    switch (this.type) {
      case TextNodeType.Bold:
        return (<b> {this.text} </b>);
      case TextNodeType.Underline:
        return (<u> {this.text} </u>);
      case TextNodeType.Plain:
        return (<p> {this.text} </p>);
      case TextNodeType.Div:
        return (<div> {this.renderChildren()} </div>);
      case TextNodeType.UnorderedList:
        return (<ul> {this.renderChildren()} </ul>);
      case TextNodeType.OrderedList:
        return (<ol> {this.renderChildren()} </ol>);
      case TextNodeType.ListItem:
        return (<ul> {this.renderChildren()} </ul>);
      default:
        break;
    }
  }
}

export { RichTextNode, TextNodeType, TextOperation };