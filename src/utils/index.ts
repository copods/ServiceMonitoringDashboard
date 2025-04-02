export const toRoman = (num: number): string => {
  if (isNaN(num) || num < 1 || num > 3999) return String(num);
  const romanMap: { [key: number]: string } = { 
    1: 'I', 4: 'IV', 5: 'V', 9: 'IX', 10: 'X', 40: 'XL', 50: 'L', 
    90: 'XC', 100: 'C', 400: 'XD', 500: 'D', 900: 'CM', 1000: 'M' 
  };
  const keys = Object.keys(romanMap).map(Number).sort((a, b) => b - a);
  let i = 0;
  let result = '';
  while (num > 0) {
    const key = keys[i];
    if (num >= key) {
      result += romanMap[key];
      num -= key;
    } else {
      i++;
    }
  }
  return result;
};

