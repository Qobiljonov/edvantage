import { cn } from '../utils';

describe('cn utility', () => {
  it('merges class names and deduplicates tailwind', () => {
    expect(cn('p-2 p-2', 'text-sm')).toBe('p-2 text-sm');
  });
});
