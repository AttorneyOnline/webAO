import calculateGifLength from './calculateGifLength';
import calculateWebpLength from './calculateWebpLength';
import calculateApngLength from './calculateApngLength';

export default {
    '.gif': calculateGifLength,
    '.webp': calculateWebpLength,
    '.apng': calculateApngLength,
};
