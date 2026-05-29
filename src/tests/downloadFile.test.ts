import { describe, it, expect, spyOn, mock, beforeAll } from "bun:test";
import downloadFile from "../services/downloadFile";

beforeAll(() => {
  (global as any).URL.createObjectURL = mock(() => "");
  (global as any).Blob = function (content: BlobPart[], options: BlobPropertyBag) {
    return { content, options };
  };
});

describe("downloadFile", () => {
  it("Creates an <a> tag", () => {
    const createElementSpy = spyOn(document, "createElement");
    downloadFile("hi", "filename");
    expect(createElementSpy).toHaveBeenCalled();
  });

  it("Creates the blob with the correct data", () => {
    const data = "writingtestsishard";
    const createObjectURL = mock(() => data);
    (global as any).URL.createObjectURL = createObjectURL;
    downloadFile(data, "filename");
    const expected = {
      content: [data],
      options: {
        type: "text",
      },
    };
    expect(createObjectURL).toHaveBeenCalledWith(expected);
  });
});
