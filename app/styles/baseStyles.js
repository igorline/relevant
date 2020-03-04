import { createGlobalStyle } from 'styled-components';
import * as colors from 'app/styles/colors';
import sizing from './sizing';
import { title, header, commentText } from './fonts';
import markdown from './markdown';

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

  ${markdown}
  .markdown-body h1 {${header}}
  .markdown-body h2 {${title}}
  .markdown-body, .markdown-body p, .markdown-body li {${commentText}}

  #app, main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    position: relative;
    width: 100%;
  }

  /* pre {
    font-family: inherit;
    font-size: inherit;
    white-space: pre-wrap;
    margin: 0;
    display: inline-block;
    overflow-wrap: break-word;
    overflow-wrap: anywhere;
    max-width: 100%;
  }
  */

  a {
    color: ${colors.blue};
    overflow-wrap: anywhere;
    text-decoration: none;
    cursor: pointer;
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

    .BeaconContainer {
      /*bottom: 30px !important; */
      left: 0 !important;
      top: 0 !important;
      padding-bottom: 32px;
    }
    .c-BeaconCloseButton {
      padding: 0;
      margin: 0;
      top: auto !important;
      bottom: -32px !important;
      height: 32px;
      backgroundColor: blue;
      z-index: 1000 !important;
    }
    .BeaconFabButtonFrame {
      left: 16px !important;
      right: auto !important;
      bottom: 16px !important;
    }
  }
`;
