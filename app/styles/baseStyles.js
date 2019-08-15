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
    font-size: 95%;
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
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a {
    color: ${colors.blue};
    overflow-wrap: anywhere;
  }

  .smartbanner-top.smartbanner-android {
    top: -80px !important;
  }
  .smartbanner-top.smartbanner-ios {
    top: -80px !important;
  }

  // Hamburger menu transition time
  .bm-overlay,
  .bm-menu-wrap {
    top: 0;
    transition-duration: .3s !important;
  }

  @media screen
  and (max-device-width: 414px) {
    html {
      font-size: 100%;
    }
  }
`;
