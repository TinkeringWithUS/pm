

class TextNode {
  private domNode: HTMLElement; 
  private childrenNodes: HTMLElement[];

  constructor(domNode: HTMLElement) {
    this.domNode = domNode;
    this.childrenNodes = [];
  }

  addChildren(child: HTMLElement) {
    this.childrenNodes.push(child);
  }

}


export { TextNode };