export const getAbbreviatedAddress = (
  address: string,
  identifierLength: number = 4
) => {
  return `${address.slice(0, identifierLength)}...${address.slice(
    address.length - identifierLength
  )}`;
};
