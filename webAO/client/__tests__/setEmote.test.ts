import setEmote from '../setEmote.js';
import Client from '../../client.js';
import fileExists from '../../utils/fileExists.js';
import transparentPng from '../../constants/transparentPng.js';

jest.mock('../../viewport/utils/createMusic');
jest.mock('../../utils/fileExists');
jest.mock('../../viewport/utils/createSfxAudio');
jest.mock('../../viewport/utils/createShoutAudio');
jest.mock('../../viewport/utils/createTestimonyAudio');
describe('setEmote', () => {
    const AO_HOST = '';

    const client = new Client('127.0.0.1');
    const firstExtension = '.gif';

    test('Should have a client_def_char_img with a valid source', async () => {
        (fileExists as any).mockReturnValue(true);
        document.body.innerHTML = `
      <img id="client_def_char_img" />
    `;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', false, 'def');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;
        expect((document.getElementById('client_def_char_img') as any).src).toEqual(expected);
    });
    test('Should have a client_pro_char_img to have a valid src', async () => {
        document.body.innerHTML = `
      <img id="client_pro_char_img" />

    `;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', false, 'pro');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;
        expect((document.getElementById('client_pro_char_img') as any).src).toEqual(expected);
    });
    test('Should have a client_wit_char_img', async () => {
        document.body.innerHTML = `
      <img id="client_wit_char_img" />
  `;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', false, 'wit');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

        expect((document.getElementById('client_wit_char_img') as any).src).toEqual(expected);
    });
    test('Should have a client_def_pair_img', async () => {
        document.body.innerHTML = `
<img id="client_def_pair_img" />

`;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', true, 'def');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

        expect((document.getElementById('client_def_pair_img') as any).src).toEqual(expected);
    });
    test('Should have a client_pro_pair_img', async () => {
        document.body.innerHTML = `
<img id="client_pro_pair_img" />

`;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', true, 'pro');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

        expect((document.getElementById('client_pro_pair_img') as any).src).toEqual(expected);
    });
    test('Should have a client_wit_pair_img', async () => {
        document.body.innerHTML = `
<img id="client_wit_pair_img" />

`;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', true, 'wit');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

        expect((document.getElementById('client_wit_pair_img') as any).src).toEqual(expected);
    });
    test('Should have a client_char_img', async () => {
        document.body.innerHTML = `
    <img id="client_char_img" />

    `;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', false, 'notvalid');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

        expect((document.getElementById('client_char_img') as any).src).toEqual(expected);
    });
    test('Should have a client_pair_img', async () => {
        document.body.innerHTML = `
      <img id="client_pair_img" />
      `;
        await setEmote(AO_HOST, client, 'salanto', 'coding', '(a)', true, 'notvalid');
        const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

        expect((document.getElementById('client_pair_img') as any).src).toEqual(expected);
    });
    test('Should handle .png urls differently', async () => {
        (fileExists as any).mockReturnValueOnce(false);
        document.body.innerHTML = `
    <img id="client_pair_img" />
    `;
        await setEmote(AO_HOST, client, 'salanto', 'coding', 'prefixNotValid', true, 'notvalid');
        const expected = 'http://localhost/characters/salanto/coding.png';

        expect((document.getElementById('client_pair_img') as any).src).toEqual(expected);
    });
    test('Should replace character if new character responds', async () => {
        (fileExists as any).mockReturnValue(false);
        document.body.innerHTML = `
    <img id="client_pair_img" />
    `;
        await setEmote(AO_HOST, client, 'salanto', 'coding', 'prefixNotValid', true, 'notvalid');
        const expected = transparentPng;
        expect((document.getElementById('client_pair_img') as any).src).toEqual(expected);
    });
});
