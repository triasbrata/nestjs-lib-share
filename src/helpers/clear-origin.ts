export const cleanOrigin = (origin: string): string => {
  return origin
    .replace(new RegExp('^htt(p|ps)://', 'g'), '')
    .replace(new RegExp('^www.', 'g'), '');
};
