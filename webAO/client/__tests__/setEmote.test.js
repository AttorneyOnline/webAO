import setEmote from "../setEmote.ts";
import Client from "../../client.ts";
import fileExists from "../../utils/fileExists";
import transparentPng from "../../constants/transparentPng";

jest.mock("../../viewport/utils/createMusic");
jest.mock("../../utils/fileExists");
jest.mock("../../viewport/utils/createSfxAudio");
jest.mock("../../viewport/utils/createShoutAudio");
jest.mock("../../viewport/utils/createTestimonyAudio");
describe("setEmote", () => {
  const AO_HOST = "";

  const client = new Client("127.0.0.1");
  const firstExtension = ".gif";

  test("Should have a client_def_char_img with a valid source", async () => {
    fileExists.mockReturnValue(true);
    document.body.innerHTML = `
      <img id="client_def_char_img" />
    `;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 0, "def");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;
    expect(document.getElementById("client_def_char_img").src).toEqual(
      expected,
    );
  });
  test("Should have a client_pro_char_img to have a valid src", async () => {
    document.body.innerHTML = `
      <img id="client_pro_char_img" />

    `;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 0, "pro");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;
    expect(document.getElementById("client_pro_char_img").src).toEqual(
      expected,
    );
  });
  test("Should have a client_wit_char_img", async () => {
    document.body.innerHTML = `
      <img id="client_wit_char_img" />
  `;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 0, "wit");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

    expect(document.getElementById("client_wit_char_img").src).toEqual(
      expected,
    );
  });
  test("Should have a client_def_pair_img", async () => {
    document.body.innerHTML = `
<img id="client_def_pair_img" />

`;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 1, "def");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

    expect(document.getElementById("client_def_pair_img").src).toEqual(
      expected,
    );
  });
  test("Should have a client_pro_pair_img", async () => {
    document.body.innerHTML = `
<img id="client_pro_pair_img" />

`;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 1, "pro");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

    expect(document.getElementById("client_pro_pair_img").src).toEqual(
      expected,
    );
  });
  test("Should have a client_wit_pair_img", async () => {
    document.body.innerHTML = `
<img id="client_wit_pair_img" />

`;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 1, "wit");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

    expect(document.getElementById("client_wit_pair_img").src).toEqual(
      expected,
    );
  });
  test("Should have a client_char_img", async () => {
    document.body.innerHTML = `
    <img id="client_char_img" />

    `;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 0, "notvalid");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

    expect(document.getElementById("client_char_img").src).toEqual(expected);
  });
  test("Should have a client_pair_img", async () => {
    document.body.innerHTML = `
      <img id="client_pair_img" />
      `;
    await setEmote(AO_HOST, client, "salanto", "coding", "(a)", 1, "notvalid");
    const expected = `http://localhost/characters/salanto/(a)coding${firstExtension}`;

    expect(document.getElementById("client_pair_img").src).toEqual(expected);
  });
  test("Should handle .png urls differently", async () => {
    fileExists.mockReturnValueOnce(false);
    document.body.innerHTML = `
    <img id="client_pair_img" />
    `;
    await setEmote(
      AO_HOST,
      client,
      "salanto",
      "coding",
      "prefixNotValid",
      1,
      "notvalid",
    );
    const expected = "http://localhost/characters/salanto/coding.png";

    expect(document.getElementById("client_pair_img").src).toEqual(expected);
  });
  test("Should replace character if new character responds", async () => {
    fileExists.mockReturnValue(false);
    document.body.innerHTML = `
    <img id="client_pair_img" />
    `;
    await setEmote(
      AO_HOST,
      client,
      "salanto",
      "coding",
      "prefixNotValid",
      1,
      "notvalid",
    );
    const expected = transparentPng;
    expect(document.getElementById("client_pair_img").src).toEqual(expected);
  });
});
