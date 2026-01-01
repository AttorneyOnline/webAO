const networkRequest = `
c0 = 247, 247, 247
c0_name = White
c0_talking = 1

c2 = 247, 0, 57
c2_name = Red
c2_start = ~
c2_end = ~
c2_remove = 1
c2_talking = 1

c4 = 107, 198, 247
c4_name = Blue
c4_start = (
c4_end = )
c4_remove = 0
c4_talking = 0

c5 = 107, 198, 247
c5_name = Blue
c5_start = [
c5_end = ]
c5_remove = 1
c5_talking = 0

c6 = 107, 198, 247
c6_name = Blue
c6_start = |
c6_end = |
c6_remove = 0
c6_talking = 0
`;

// Mock the request module properly
jest.mock("../services/request", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(networkRequest),
  request: jest.fn().mockResolvedValue(networkRequest),
  requestBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0))
}));

import request from "../services/request";
import mlConfig from "../utils/aoml";

// Ensure the mock is applied before any imports
beforeAll(() => {
  jest.clearAllMocks();
  console.log("Mock applied:", request);
});

describe("mlConfig", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  it("Should make a network request", () => {
    mlConfig("/");
    expect(request).toHaveBeenCalledTimes(1);
  });
});
describe("applyMarkdown", () => {
  const config = mlConfig("/");

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  it("Should create an array of spans containing letters", async () => {
    const word = `hello`;
    const actual = await config.applyMarkdown(`hello`, `blue`);
    let index = 0;
    for (const element of actual) {
      expect(element.innerHTML).toBe(word[index]);
      index++;
    }
  });
  it("Should add colors based on settings", async () => {
    const config = mlConfig("/");
    const actual = await config.applyMarkdown(`(heya)`, `blue`);
    expect(actual[0].getAttribute("style")).toBe("color: rgb(107, 198, 247);");
  });
  it("Should keep a letter if remove = 0", async () => {
    const config = mlConfig("/");

    const actual = await config.applyMarkdown(`(What())Hey!`, `white`);
    const expected = `(`;
    expect(actual[5].innerHTML).toBe(expected);
  });
  it("Should remove a letter if remove = 1", async () => {
    const config = mlConfig("/");

    const actual = await config.applyMarkdown(`~What~()Hey!`, `white`);
    const expected = ``;
    expect(actual[0].innerHTML).toBe(expected);
  });
  it("Should remove a letter if remove = 1", async () => {
    const config = mlConfig("/");

    const actual = await config.applyMarkdown(`~What~()Hey!`, `white`);
    const expected = ``;
    expect(actual[0].innerHTML).toBe(expected);
  });
  it("Should keep a closing letter if remove = 0", async () => {
    const config = mlConfig("/");

    const actual = await config.applyMarkdown(`~NO[]~!`, `white`);
    const expected = ``;
    expect(actual[4].innerHTML).toBe(expected);
  });
  it("Should remove a closing letter if remove = 1", async () => {
    const config = mlConfig("/");
    const actual = await config.applyMarkdown(`~NO||~!`, `white`);
    const expected = ``;
    expect(actual[5].innerHTML).toBe(expected);
  });
});
