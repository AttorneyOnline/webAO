import queryParser from '../utils/queryParser'
const { asset } = queryParser();
const DEFAULT_HOST = 'http://attorneyoffline.de/base/';
export let AO_HOST = asset || DEFAULT_HOST 
export const setAOhost = (val: string) => {
    AO_HOST = val
}
