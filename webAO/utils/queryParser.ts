interface QueryParams {
  ip: string;
  serverIP: string;
  mode: string;
  asset: string;
  theme: string;
}
interface StringMap {
  [key: string]: any;
}
// Get the arguments from the URL bar
const queryParser = (): QueryParams => {
  const queryDict: StringMap = {};
  location.search
    .substr(1)
    .split("&")
    .forEach((item) => {
      queryDict[item.split("=")[0]] = item.split("=")[1];
    });
  return queryDict as QueryParams;
};
export default queryParser;
