import { createGlobalStyle } from 'styled-components';
import * as colors from 'app/styles/colors';
import sizing from './sizing';

// eslint-disable-next-line
export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    border-width: 0px;
  }

  html {
    font-size: 62.5%;
    display: flex;
  }
  body {
    font-size: ${sizing(1.75)};
    line-height: ${sizing(2)};
  }

  html, body {
    width: 100%;
    margin: 0;
    padding: 0;
    color: ${colors.black};
    font-family: HelveticaNeue, Helvetica Neue, sans-serif;
    position:relative;
    flex: 1;
    font-smooth: auto;
    -moz-osx-font-smoothing: auto;
    -webkit-font-smoothing: antialiased;
  }
  a {
    color: ${colors.blue};
  }
`;
