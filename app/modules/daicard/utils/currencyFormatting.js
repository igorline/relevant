/* eslint-disable */
import * as Connext from 'connext';

const { CurrencyConvertable, CurrencyType, Currency } = Connext.types;
const { getExchangeRates } = new Connext.Utils();

export function getChannelBalanceInUSD(channelState, connextState, onlyTokens = true) {
  if (!connextState || !channelState) {
    return '$0.00';
  }

  const convertableTokens = new CurrencyConvertable(
    CurrencyType.BEI,
    channelState.balanceTokenUser,
    () => getExchangeRates(connextState)
  );

  if (onlyTokens) {
    return Currency.USD(convertableTokens.toUSD().amountBigNumber).format({});
  }

  const convertableWei = new CurrencyConvertable(
    CurrencyType.WEI,
    channelState.balanceWeiUser,
    () => getExchangeRates(connextState)
  );

  console.log(
    'total:',
    convertableTokens
      .toBEI()
      .amountBigNumber.plus(convertableWei.toBEI().amountBigNumber)
      .toFixed(0)
  );

  const total = new CurrencyConvertable(
    CurrencyType.BEI,
    convertableTokens
      .toBEI()
      .amountBigNumber.plus(convertableWei.toBEI().amountBigNumber),
    () => getExchangeRates(connextState)
  ).toUSD().amountBigNumber;

  return Currency.USD(total).format({});
}

export function getAmountInUSD(amount, connextState, onlyTokens = true) {
  if (!connextState || !amount) {
    return '$0.00';
  }
  const convertableTokens = new CurrencyConvertable(
    CurrencyType.BEI,
    amount.amountToken,
    () => getExchangeRates(connextState)
  );

  if (onlyTokens) {
    return Currency.USD(convertableTokens.toUSD().amountBigNumber).format({});
  }

  const convertableWei = new CurrencyConvertable(CurrencyType.WEI, amount.amountWei, () =>
    getExchangeRates(connextState)
  );

  const totalBalance = Currency.USD(
    convertableTokens.toBEI().amountBigNumber.plus(convertableWei.toBEI)
  ).format({});

  return totalBalance;
}
