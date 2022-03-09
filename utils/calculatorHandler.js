import calculateGifLength from './calculateGifLength';
import calculateWebpLength from './calculateWebpLength';

export default {
  '.gif': calculateGifLength,
  '.webp': calculateWebpLength,
};
