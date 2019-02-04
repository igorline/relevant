import { css } from 'styled-components';
import { lineColor } from './colors';
import sizing from './sizing';

export const color = css`
  ${p => p.c ? `color: ${p.c}` : ''};
`;

function size(units) {
  if (typeof units === 'number') return sizing(units);
  if (!units || units.match(/px|rem|em|vh|vw|%/)) return units;
  const uArray = units.split(' ');
  if (uArray.lenght === 1) sizing(Number(units));
  return uArray.map(u => sizing(Number(u))).join(' ');
}

export const padding = css`
  ${p => p.p ? `padding: ${size(p.p)}` : ''};
  ${p => p.pb ? `padding-bottom: ${size(p.pb)}` : ''};
  ${p => p.pl ? `padding-left: ${size(p.pl)}` : ''};
  ${p => p.pr ? `padding-right: ${size(p.pr)}` : ''};
  ${p => p.pt ? `padding-top: ${size(p.pt)}` : ''};
`;

export const margin = css`
  ${p => p.m ? `margin: ${size(p.m)}` : ''};
  ${p => p.mb ? `margin-bottom: ${size(p.mb)}` : ''};
  ${p => p.ml ? `margin-left: ${size(p.ml)}` : ''};
  ${p => p.mr ? `margin-right: ${size(p.mr)}` : ''};
  ${p => p.mt ? `margin-top: ${size(p.mt)}` : ''};
`;

export const font = css`
  ${p => p.fs ? `font-size: ${size(p.fs)}` : ''};
  ${p => p.lh ? `line-height: ${size(p.lh)}` : ''};
  ${p => p.fw ? `font-weight: ${p.fw}` : ''};
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
  ${p => p.w ? `width: ${size(p.w)};` : ''};
`;

export const height = css`
  ${p => p.h ? `height: ${size(p.h)};` : ''};
`;

export const background = css`
  ${p => p.bg ? `background: ${p.bg};` : ''};
`;

export const borderRadius = css`
  ${p => p.bradius ? `border-radius: ${size(p.bradius)};` : ''};
`;

const universalBorder = (side, c = lineColor, w = '1px') => `
  border${side ? `-${side}` : ''}-color: ${c};
  border${side ? `-${side}` : ''}-width: ${size(w)};
  border${side ? `-${side}` : ''}-style: solid;
`;

export const border = css`
  ${p => p.br && universalBorder('right', p.bc, p.bw)};
  ${p => p.bl && universalBorder('left', p.bc, p.bw)};
  ${p => p.bt && universalBorder('top', p.bc, p.bw)};
  ${p => p.bb && universalBorder('bottom', p.bc, p.bw)};
  ${p => p.border && universalBorder('', p.bc, p.bw)};
`;

export const flex = css`
  display: flex;
  position: relative;
  ${p => p.flex ? `flex: ${p.flex}` : ''};
  ${p => p.direction ? `flex-direction: ${p.direction}` : ''};
  ${p => p.justify ? `justify-content: ${p.justify}` : ''};
  ${p => p.align ? `align-items: ${p.align}` : ''};
  ${p => p.shrink ? `flex-shrink: ${p.grow}` : ''};
  ${p => p.grow ? `flex-grow: ${p.grow}` : ''};
  ${p => p.wrap ? 'flex-wrap: wrap' : ''};
`;

export const link = css`
${p => p.color ? `color: ${p.color}` : ''};
${p => p.hc ? `&:hover { color: ${p.hc}; }` : ''};
${p => p.hc ? `&:hover * { fill: ${p.hc}; }` : ''};
${p => p.ac ? `&.active { color: ${p.ac}; }` : ''};
${p => p.ac ? `&.active * { fill: ${p.ac}; }` : ''};
`;
