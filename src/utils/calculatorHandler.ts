import calculateGifLength from "./calculateGifLength";
import calculateWebpLength from "./calculateWebpLength";
import calculateApngLength from "./calculateApngLength";

type Calculator = (file: ArrayBuffer) => number;

const calculatorHandler: Record<string, Calculator> = {
  ".gif": calculateGifLength,
  ".webp": calculateWebpLength,
  ".apng": calculateApngLength,
};

export default calculatorHandler;
