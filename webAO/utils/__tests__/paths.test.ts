import {getFilenameFromPath} from '../paths'
jest.mock('../fileExists')

describe('getFilenameFromPath', () => {
    const EXAMPLE_PATH = "localhost/stoneddiscord/assets.png"
    it('Should get the last value from a path', async () => {
        const actual = getFilenameFromPath(EXAMPLE_PATH);
        const expected = 'assets.png';
        expect(actual).toBe(expected);
    });
})
