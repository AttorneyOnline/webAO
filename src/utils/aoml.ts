
interface Aoml {
  [key: string]: string | number;
  name: string;
  start: string;
  end: string;
  remove: number;
  talking: number;
  color: string;
}
const aomlParser = (text: string) => {
  const parsed: { [key: string]: Aoml } = {};
  let currentHeader = "";
  for (const line of text.split(/\r?\n/)) {
    if (line === "") {
      currentHeader = "";
      continue;
    }
    const content = line.split(" = ");
    const contentName = content[0];
    const contentValue = content[1];
    if (currentHeader === "") {
      currentHeader = contentName;
      parsed[currentHeader] = {
        color: contentValue,
      } as Aoml;
    } else {
      const contentKey = contentName.split("_")[1];
      parsed[currentHeader][contentKey] = contentValue;
    }
  }
  return parsed;
};

const mlConfig = (iniContent: string) => {
  const aomlParsed: { [key: string]: Aoml } = aomlParser(iniContent);

  const createIdentifiers = () => {
    const identifiers = new Map<string, Aoml>();
    for (const [ruleName, value] of Object.entries(aomlParsed)) {
      if (value.start && value.end) {
        identifiers.set(value.start, value);
        identifiers.set(value.end, value);
      }
    }
    return identifiers;
  };
  const createStartIdentifiers = () => {
    const startingIdentifiers = new Set<string>();
    for (const [ruleName, value] of Object.entries(aomlParsed)) {
      if (value?.start && value?.end) {
        startingIdentifiers.add(value.start);
      }
    }
    return startingIdentifiers;
  };
  const applyMarkdown = (text: string, defaultColor: string) => {
    const identifiers = createIdentifiers();
    const startIdentifiers = createStartIdentifiers();
    const closingStack = [];
    const colorStack = [];
    // each value in output will be an html element
    const output: HTMLSpanElement[] = [];
    for (const letter of text) {
      const currentSelector = document.createElement("span");
      const currentIdentifier = identifiers.get(letter);
      const currentClosingLetter = closingStack[closingStack.length - 1];
      const keepChar = Number(currentIdentifier?.remove) === 0;
      if (currentClosingLetter === letter) {
        const r = colorStack[colorStack.length - 1][0];
        const g = colorStack[colorStack.length - 1][1];
        const b = colorStack[colorStack.length - 1][2];
        const currentColor = `color: rgb(${r},${g},${b});`;
        currentSelector.setAttribute("style", currentColor);
        closingStack.pop();
        colorStack.pop();
        if (keepChar) {
          currentSelector.innerHTML = letter;
        }
      } else if (startIdentifiers.has(letter)) {
        const color = identifiers.get(letter).color.split(",");
        const r = color[0];
        const g = color[1];
        const b = color[2];
        colorStack.push([r, g, b]);
        closingStack.push(currentIdentifier.end);
        const currentColor = `color: rgb(${r},${g},${b});`;
        currentSelector.setAttribute("style", currentColor);
        if (keepChar) {
          currentSelector.innerHTML = letter;
        }
      } else {
        currentSelector.innerHTML = letter;
        if (colorStack.length === 0) {
          currentSelector.className = `text_${defaultColor}`;
        } else {
          const r = colorStack[colorStack.length - 1][0];
          const g = colorStack[colorStack.length - 1][1];
          const b = colorStack[colorStack.length - 1][2];
          const currentColor = `color: rgb(${r},${g},${b});`;
          currentSelector.setAttribute("style", currentColor);
        }
      }
      output.push(currentSelector);
    }
    return output;
  };
  return {
    applyMarkdown,
  };
};

export default mlConfig;
