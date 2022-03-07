import iniParse from '../iniParse';

const iniExample = `
[Options]
name = Matt
showname = Matty

[Emotions]
number = 9
1 = Normal#-#normal#0#1
`;
describe('iniParse', () => {
  test('should not lowercase value if key is showname', () => {
    const parsedIni = iniParse(`
        [test]
        showname = MATT
        `);
    expect(parsedIni.test.showname).toBe('MATT');
  });
  test('should lowercase value if key is not showname', () => {
    const parsedIni = iniParse(`
        [test]
        party = TIME
        `);
    expect(parsedIni.test.party).toBe('time');
  });
  test('should parse sections', () => {
    const parsedIni = iniParse(iniExample);
    expect(Object.keys(parsedIni).length).toBe(2);
  });
  test('should parse parameters', () => {
    const parsedIni = iniParse(iniExample);
    expect(Object.keys(parsedIni.options).length).toBe(2);
  });
  test('should remove empty lines', () => {
    const parsedIni = iniParse(`
        [test]
        
        
        1 = 1
        2 = 2


        `);
    expect(Object.keys(parsedIni.test).length).toBe(2);
  });
});
