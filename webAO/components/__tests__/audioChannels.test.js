import createAudioChannels from "../audioChannels";

describe("createAudioChannels", () => {
  test("Should create 4 channels", () => {
    document.body.innerHTML = "";
    createAudioChannels(4);
    expect(document.getElementsByClassName("audioChannel").length).toBe(4);
  });
});
