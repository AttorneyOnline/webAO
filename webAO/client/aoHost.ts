import queryParser from '../utils/queryParser'

const { asset } = queryParser();
export let AO_HOST = asset;
export const setAOhost = (val: string) => {
    AO_HOST = val;
}
