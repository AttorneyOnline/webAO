const cheerio = require('cheerio');

const apacheParse = (src: string) => {
  const $: any = cheerio.load(src);
  const dir: string = '/' + $('h1').text().split('/').slice(1).join('/');
  const files: any = [];

  const rows: any = $('table').find('tr').toArray();

  // Figure out the order of the columns,
  // by looking at the header row.
  // eg { 'Name': 0, 'Last modified': 1, 'Size': 2 }
  const fieldCols: any = $(rows[0])
    .children('th')
    .toArray()
    .reduce((fieldCols, th, i) =>
      Object.assign(fieldCols, {
        [$(th).text().trim()]: i
      }),
    {});

  // Make sure we at least found a "Name" column
  if (fieldCols.Name === undefined) {
    throw new Error('Unable to parse apache index html: cannot identify "Name" column.');
  }

  // Parse fields
  rows
    // Ignore the header row
    .slice(1)
    .forEach((tr) => {
      const $tds = $(tr).find('td');
      const getCol = label => fieldCols[label] === undefined ? null : $tds.eq(fieldCols[label]);
      const getColText = label => getCol(label) && getCol(label).text().trim();
      const name = getColText('Name');

      // Ignore 'Parent Directory' row
      if (name === 'Parent Directory' || !name) return;

      let path = getCol('Name').children().eq(0).attr('href');
      if (!path.startsWith('http://') && !path.startsWith('https://')) {
        path = join(dir, path);
      }

      files.push({
        type: path.endsWith('/')
          ? 'directory'
          : 'file',
        name: name,
        path: path,
        lastModified: getCol('Last modified') && new Date(getColText('Last modified')),
        description: getColText('Description')
      });
    });

  return { dir, files };
};

export default apacheParse;