import queryParser from '../utils/queryParser'
let { asset } = queryParser();
const DEFAULT_HOST = 'http://attorneyoffline.de/base/';
const AO_HOST = asset || DEFAULT_HOST 
export default AO_HOST
