const regexPatterns = {
  section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
  param: /^\s*([\w.\-_]+)\s*=\s*(.*?)\s*$/,
  comment: /^\s*;.*$/,
};

const valueHandler = (matchKey, matchValue) => (matchKey === 'showname' ? matchValue : matchValue.toLowerCase());

const lineFilter = (value) => {
  const isEmpty = value.length === 0;
  const isComment = regexPatterns.comment.test(value);
  if (isComment || isEmpty) {
    return false;
  }
  return true;
};

const iniParse = (data) => {
  const parsedIni = {};
  const lines = data.split(/\r\n|\r|\n/);
  const filteredLines = lines.filter(lineFilter);

  let currentSection;
  filteredLines.forEach((line) => {
    const isParameter = regexPatterns.param.test(line);
    const isSection = regexPatterns.section.test(line);
    if (isParameter && currentSection) {
      const match = line.match(regexPatterns.param);
      const matchKey = match[1].toLowerCase();
      const matchValue = match[2];
      parsedIni[currentSection][matchKey] = valueHandler(matchKey, matchValue);
    } else if (isSection) {
      const match = line.match(regexPatterns.section);
      const matchKey = match[1].toLowerCase();
      parsedIni[matchKey] = {};
      currentSection = matchKey;
    }
  });
  return parsedIni;
};

export default iniParse;
