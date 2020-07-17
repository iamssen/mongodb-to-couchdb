import { parseTimeStringToSeconds } from '@ssen/rescuetime';

describe('rescuetime', () => {
  test('should parse time string to seconds', () => {
    expect(parseTimeStringToSeconds('6h 5m')).toBe(21900);
    expect(parseTimeStringToSeconds('no time')).toBe(0);
    expect(parseTimeStringToSeconds('22m 23s')).toBe(1343);
  });
});
