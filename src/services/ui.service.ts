import ansiEscapes from 'ansi-escapes';
import { Position, Ui } from '../ui/ui.js';

export class UiService {
  stdin: NodeJS.ReadStream = process.stdin;
  // public stdout: NodeJS.WriteStream = process.stdout;
  uiComponents: Ui[] = [];

  constructor() {}

  prepareUi() {}

  setRawMode(set = true): void {
    this.stdin.setRawMode(set);
    process.stdin.resume();
  }

  setCursorVisible(visible: boolean): void {
    const instruction = visible
      ? ansiEscapes.cursorShow
      : ansiEscapes.cursorHide;
    this.print(instruction);
  }

  add(component: Ui) {
    this.uiComponents.push(component);
  }

  renderAll() {
    this.clear();
    this.uiComponents.forEach((component) => {
      if (component.visible) component.render();
    });
  }

  clear(): void {
    this.print(ansiEscapes.clearTerminal);
  }

  print(text: string): void {
    process.stdout.write.bind(process.stdout)(text);
  }

  printAt(message: string, position: Position): void {
    this.setCursorAt(position);
    this.print(message);
  }

  setCursorAt({ x, y }: Position): void {
    this.print(ansiEscapes.cursorTo(x, y));
  }

  clearLine(row: number): void {
    this.printAt(ansiEscapes.eraseLine, { x: 0, y: row });
  }
}
