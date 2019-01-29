import { css } from 'styled-components';

export const color = css`
  ${p => p.c ? `color: ${p.c}` : ''};
`;

export const padding = css`
  ${p => p.p ? `padding: ${p.p}` : ''};
  ${p => p.pb ? `padding-bottom: ${p.pb}` : ''};
  ${p => p.pl ? `padding-left: ${p.pl}` : ''};
  ${p => p.pr ? `padding-right: ${p.pr}` : ''};
  ${p => p.pt ? `padding-top: ${p.pt}` : ''};
`;

export const margin = css`
  ${p => p.m ? `margin: ${p.m}` : ''};
  ${p => p.mb ? `margin-bottom: ${p.mb}` : ''};
  ${p => p.ml ? `margin-left: ${p.ml}` : ''};
  ${p => p.mr ? `margin-right: ${p.mr}` : ''};
  ${p => p.mt ? `margin-top: ${p.mt}` : ''};
`;

export const inheritfont = css`
  ${p => p.inheritfont ? `
      font-size: 'inherit';
      line-height: 'inherit';
      font-family: 'inherit';`
    : ''};
`;

export const inheritcolor = css`
  ${p => p.inheritcolor ? `
      color: 'inherit';`
    : ''};
`;

export const width = css`
  ${p => p.w ? `width: ${p.w};` : ''};
`;

export const height = css`
  ${p => p.h ? `height: ${p.h};` : ''};
`;

export const background = css`
  ${p => p.bg ? `background: ${p.bg};` : ''};
`;

export const borderRadius = css`
  ${p => p.br ? `border-radius: ${p.br};` : ''};
`;

export const flex = css`
  display: flex;
  ${p => p.flex ? `flex: ${p.flex}` : ''};
  ${p => p.direction ? `flex-direction: ${p.direction}` : ''};
  ${p => p.justify ? `justify-content: ${p.justify}` : ''};
  ${p => p.align ? `align-items: ${p.align}` : ''};
`;

