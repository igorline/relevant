import React, { useReducer, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { getTokenReserves } from '@uniswap/sdk';
import { abbreviateNumber } from 'utils/numbers';

if (process.env.WEB !== 'true') {
  require('../../publicenv');
}

const { TOKEN_ADDRESS } = process.env;
const UPDATE_INTERVAL = 1 * 60 * 1000;

export const PriceContext = React.createContext(0);

export function exchangeLink() {
  return `https://uniswap.exchange/swap?theme=dark&outputCurrency=${TOKEN_ADDRESS}`;
}

export function tokenEnabled() {
  return !!TOKEN_ADDRESS;
}

export function usePrice(amount, type) {
  const { price } = useContext(PriceContext);
  if (!price) return '';
  if (type === 'number') return abbreviateNumber(price * amount);
  return ` ($${abbreviateNumber(price * amount, 2)})`;
}

PriceProvider.propTypes = {
  children: PropTypes.node
};

export function PriceProvider({ children }) {
  const [state, dispatch] = useReducer(priceReducer, {
    loading: false,
    error: false,
    data: null,
    refresh: 0
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_PRICE_INIT' });
      if (!TOKEN_ADDRESS) return;
      try {
        const tokenPrice = await getTokenReserves(TOKEN_ADDRESS);
        const res = await fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/');
        const ethPrice = await res.json();

        if (!didCancel) {
          dispatch({
            type: 'FETCH_PRICE_SUCCESS',
            payload: { ...tokenPrice, ethPrice: ethPrice[0] }
          });
        }
      } catch (err) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_PRICE_ERROR', payload: err });
        }
      }
    };
    fetchData();

    setTimeout(() => {
      dispatch({ type: 'REFRESH_PRICE' });
    }, UPDATE_INTERVAL);

    return () => {
      didCancel = true;
    };
  }, [state.refresh]);

  const price = computePrice(state.data);
  const priceString = `($${abbreviateNumber(price, 2)})`;

  return (
    <PriceContext.Provider value={{ price, priceString }}>
      {children}
    </PriceContext.Provider>
  );
}

const priceReducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRICE':
      return {
        ...state,
        refresh: state.refresh + 1
      };
    case 'FETCH_PRICE_INIT':
      return {
        ...state,
        loading: true,
        error: false
      };
    case 'FETCH_PRICE_SUCCESS':
      return {
        ...state,
        loading: false,
        error: false,
        data: action.payload
      };
    case 'FETCH_PRICE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      throw new Error();
  }
};

function computePrice(data) {
  if (!data) return null;
  const { ethReserve, tokenReserve, ethPrice } = data;
  if (!ethReserve || !tokenReserve) return null;
  const priceInEth = ethReserve.amount.div(tokenReserve.amount);
  const usdPrice = priceInEth.times(ethPrice.price_usd);
  return parseFloat(usdPrice.toString());
}
