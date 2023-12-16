export const shortenString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str;
  }

  return `${str.substring(0, maxLength)}...`;
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (match) => {
    const rand = (Math.random() * 16) | 0;
    const res = match === 'x' ? rand : (rand & 0x3) | 0x8;
    return res.toString(16);
  });
};
