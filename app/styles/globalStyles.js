import { createGlobalStyle } from 'styled-components';
import colors from 'app/styles/colors';
import layout from 'app/styles/layout';
import * as fonts from 'app/styles/fonts';

// eslint-disable-next-line
export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html {
    font-size: 62.5%;
    display: flex;
  }
  body {
    font-size: 1.5rem;
    line-height: 1.5;
  }

  html, body {
    width: 100%;
    margin: 0;
    padding: 0;
    color: ${colors.black};
    font-family: Arial, sans-serif;
    position:relative;
    flex: 1;
    -webkit-font-smoothing: antialiased;
  }
`;

const mixins = {};

export {
  colors,
  layout,
  mixins,
  fonts,
};
