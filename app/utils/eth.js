import crypto from 'crypto';

export async function signMessage(provider, address) {
  const signer = provider.getSigner();

  const now = new Date();
  const exp = Math.floor(now.setMinutes(now.getMinutes() + 5) / 1000);
  const msg = {
    address,
    exp
  };
  const signature = await signer.signMessage(JSON.stringify(msg));
  return { msg, signature };
}

export function truncateAddress(address) {
  if (!address) return null;
  return address.slice(0, 6) + '...' + address.slice(address.length - 4, address.length);
}

export function parseBN(value) {
  return value && value.get ? getBN(value) : value;
}

export function getBN(value) {
  const hex = value.get('_hex');
  if (hex === '0x00') {
    return 0;
  }
  return formatBN(hex, 18);
}

export function formatBN(hex, decimals = 18) {
  const numString = Number(hex).toString();
  // console.log('numString', numString);
  if (numString[numString.length - 3] === '+') {
    const trailingZeroes = getTrailingZeros(numString, decimals);
    const result = Number(withoutZeros(numString) + trailingZeroes);

    return Number.parseFloat(result).toFixed(0);
  }
  if (numString.length > 18) {
    return Number(numString.slice(0, -18));
  }
  if (numString.length === 18) {
    return Number(`0.${numString}`);
  }
  return Number(numString);
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function formatBalanceRead(balString) {
  return `${balString.slice(0, -18)}.${balString.slice(-18)}`;
}

export function formatBalanceWrite(balString, decimals = 18) {
  return (balString * 10 ** decimals).toString();
}

export function appendZeroes(numString, amount) {
  return `${numString}${'0'.repeat(amount)}`;
}

export function removeDecimal(balString) {
  return balString.split('.').join('');
}

export function withoutZeros(numString) {
  return numString.slice(0, -2).toString();
}

export function getTrailingZeros(numString, decimals) {
  return Number(Number(numString.slice(-2)) - decimals).toString();
}
