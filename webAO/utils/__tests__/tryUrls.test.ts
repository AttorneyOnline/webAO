import fileExists from '../fileExists.js'
import tryUrls from '../tryUrls.js';
import transparentPng from '../../constants/transparentPng.js'
jest.mock('../fileExists.ts')

const mockFileExists = fileExists as jest.MockedFunction<typeof fileExists>;

describe('tryUrls', () => {
    it('Should try multiple file extensions', async () => {
        const url = "localhost/stoneddiscord/assets"
        mockFileExists
            .mockReturnValueOnce(Promise.resolve(false))
            .mockReturnValueOnce(Promise.resolve(false))
            .mockReturnValueOnce(Promise.resolve(false))
            .mockReturnValueOnce(Promise.resolve(true))
        const actual = await tryUrls(url)
        const expected = 'localhost/stoneddiscord/assets.apng'
        expect(actual).toBe(expected);
    });

    it('Should return a transparent png if it cant find any assets', async () => {
        const url = "localhost/stoneddiscord/assets"
        mockFileExists
            .mockReturnValue(Promise.resolve(false))
        const actual = await tryUrls(url)
        const expected = transparentPng
        expect(actual).toBe(expected);
    });
})


