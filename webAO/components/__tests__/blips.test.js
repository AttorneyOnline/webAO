import createBlip from '../blip';

describe('createBlip', () => {
    test('create 3 blips audios', () => {
        document.body.innerHTML = '';
        createBlip(3);
        expect(document.getElementsByClassName('blipSound').length).toBe(3);
    });
});
