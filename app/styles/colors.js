const lightTheme = true;
// const darkTheme = false;

const gs = n => `hsl(0, 0%, ${n}%)`;
const gsa = (n, a) => `hsla(0, 0%, ${n}%, ${a})`;

export const blue = lightTheme ? '#0000ff' : '#0088ff';
export const grey = lightTheme ? gs(50) : gs(50);

export const black = lightTheme ? gs(0) : gs(100);
export const white = lightTheme ? gs(100) : gs(8);

export const lightGreyBg = lightTheme ? gs(98) : gs(7);

export const modalBackground = lightTheme ? gsa(100, 0.7) : gsa(0, 0.7);

export const green = '#7ED321';
export const red = '#D0021B';
export const gold = '#FFC864';

export const error = 'hsl(0, 66%, 45%)';
export const errorA = 'hsla(33, 66%, 45%, .05)';
export const warning = 'hsl(33, 93%,54%)';
export const warningA = 'hsla(33, 93%, 54%, .05)';

export const twitterBlue = '#00aced';

// mobile post diver
export const dividerBg = lightTheme ? gs(97) : gs(3);

// splash and user search bg
export const lightGrey = lightTheme ? gs(87) : gs(13);
export const lightBorder = lightTheme ? gs(85) : gs(20);
export const redditColor = '#ff4500';
export const uniswap = 'rgb(220, 107, 229)';

export const background = white;
export const secondaryText = grey;
export const lineColor = lightGrey;
export const secondaryBG = lightGreyBg;
