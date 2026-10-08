// import https from "https";
// import calculateApngLength from "../calculateApngLength";
// import calculateGifLength from "../calculateGifLength";
// import calculateWebpLength from "../calculateWebpLength";

// jest.setTimeout(30000);

// const download = (url) =>
//   new Promise((resolve, reject) => {
//     https
//       .get(url, (response) => {
//         if (response.statusCode !== 200) {
//           reject(new Error(`Request failed with status ${response.statusCode}`));
//           response.resume();
//           return;
//         }

//         const chunks = [];
//         response.on("data", (chunk) => chunks.push(chunk));
//         response.on("end", () => resolve(Buffer.concat(chunks)));
//       })
//       .on("error", reject);
//   });

// describe("animation length calculators", () => {
//   it("calculates the APNG length", async () => {
//     const animation = await download(
//       "https://attorneyoffline.de/newvanillabase/characters/judge/%28a%29normal.apng",
//     );

//     expect(calculateApngLength(animation)).toBeCloseTo(3760);
//   });

//   it("calculates the GIF length", async () => {
//     const animation = await download(
//       "https://attorneyoffline.de/base/characters/judgesoj/(a)normal.gif",
//     );

//     expect(calculateGifLength(animation)).toBe(4180);
//   });

//   it("calculates the WebP length", async () => {
//     const animation = await download(
//       "https://attorneyoffline.de/base/characters/judgesoj/(a)/normal.webp",
//     );

//     expect(calculateWebpLength(animation)).toBe(5066);
//   });
// });
