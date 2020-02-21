import { StyleSheet, Dimensions, Platform } from 'react-native';

const fullWidth = Dimensions.get('window').width || Dimensions.get('screen').width;
const fullHeight = Dimensions.get('window').height || Dimensions.get('screen').height;

const smallScreen = fullWidth <= 320 || false;

const mainPadding = smallScreen ? 16 : 16;

const darkGrey = '#242425';
const blue = '#4d4eff';
const lightGrey = '#9C9C9C';
const greyText = '#9C9C9C';
const green = '#196950';
const borderGrey = '#E3E3E3';

const IphoneHeader = 59;
const AndroidHeader = 44;

function isIphoneX() {
  const dimen = Dimensions.get('screen');
  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTVOS &&
    (dimen.height === 812 ||
      dimen.width === 812 ||
      dimen.width === 896 ||
      dimen.height === 896)
  );
}

const IphoneX = isIphoneX();

// eslint-disable-next-line
let headerHeight = Platform.OS === 'ios' ? IphoneHeader : AndroidHeader;
let statusBar = 20;

if (IphoneX) {
  statusBar = 44;
  headerHeight = 89;
}

export const font = {
  font10: {
    fontSize: 10,
    lineHeight: 10
  },
  font12: {
    fontSize: 12,
    lineHeight: 12
  },
  font13: {
    fontSize: 13,
    lineHeight: 13
  },
  font14: {
    fontSize: 14,
    lineHeight: 14
  },
  font15: {
    fontSize: 15,
    lineHeight: 15
  },
  font17: {
    fontSize: 17,
    lineHeight: 17
  },
  font20: {
    fontSize: 20,
    lineHeight: 20
  },
  font25: {
    fontSize: 25,
    lineHeight: 25
  },
  font40: {
    fontSize: 40,
    lineHeight: 40
  },
  bold: {
    fontWeight: 'bold'
  },

  smallInfo: {
    fontSize: 10,
    color: greyText
  },
  statNumber: {
    fontSize: 17,
    fontFamily: 'BebasNeueRelevantRegular',
    marginBottom: -2
  },

  largeNumber: {
    fontSize: 25,
    height: 24,
    lineHeight: 25,
    fontFamily: 'BebasNeueRelevantRegular',
    marginBottom: -2
  },
  headerInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shareHeader: {
    height: 42,
    paddingTop: 0
  },
  header: {
    height: Platform.OS === 'ios' ? headerHeight : 44,
    paddingTop: Platform.OS === 'ios' ? statusBar : 0,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#242425',
    borderBottomWidth: StyleSheet.hairlineWidth,

    zIndex: 1000,
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0
  },
  navButton: {
    fontSize: 10,
    fontFamily: 'BebasNeueRelevantRegular'
  },
  bebasNoMargin: {
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'normal',
    letterSpacing: 0.5
  },
  bebas: {
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'normal',
    letterSpacing: 0.5,
    // flex: 1,
    marginBottom: -2
  },
  bebasBold: {
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'bold',
    color: darkGrey,
    // marginBottom: -3,
    // lineHeight: 24,
    letterSpacing: 0.5
  },
  libre: {
    fontFamily: 'Libre Caslon Display'
  },
  georgia: {
    fontFamily: 'Georgia'
  },
  tabFont: {
    fontWeight: 'bold',
    fontSize: 14
  },
  tabStyle: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.25,
    color: darkGrey
  },
  halfLetterSpacing: {
    letterSpacing: 0.5
  },
  quarterLetterSpacing: {
    letterSpacing: 0.25
  },
  signInText: {
    paddingTop: 20,
    textAlign: 'center',
    fontFamily: 'Arial',
    fontSize: 15,
    color: darkGrey
  }
};

export const colors = {
  active: {
    color: blue
  },
  white: {
    color: '#fff'
  },
  timestampGray: {
    color: '#B0B3B6'
  },
  greyText: {
    color: greyText
  }
};

export const alignment = {
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  }
};

export const layout = {
  loadMoreButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  reloadIcon: {
    height: 100,
    width: 100,
    marginBottom: 20
  },

  fieldsParent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 20
  },
  fieldsInner: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  fieldsInputParent: {
    borderBottomWidth: 1,
    borderBottomColor: 'black'
  },
  fieldsInput: {
    height: 50,
    fontFamily: 'Arial',
    paddingHorizontal: 0,
    color: 'black'
  },
  largeButton: {
    height: 50,
    borderWidth: 2,
    borderColor: '#3E3EFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  largeButtonText: {
    fontFamily: 'BebasNeueRelevantRegular',
    color: '#3E3EFF',
    fontSize: 29,
    backgroundColor: 'transparent'
  },
  mediumButton: {
    height: 35,
    // borderWidth: 2,
    borderColor: '#3E3EFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20
  },
  mediumButtonText: {
    fontFamily: 'BebasNeueRelevantRegular',
    color: '#3E3EFF',
    fontSize: 17
  },
  onlineUser: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10
  },
  categoryItem: {
    padding: 10,
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'white'
  },
  activeBorder: {
    borderBottomWidth: 5,
    borderBottomColor: blue
  },
  typeBar: {
    width: fullWidth
  },
  type: {
    flex: 1,
    textAlign: 'center'
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  category: {
    flex: 1,
    textAlign: 'center'
  },
  linkInput: {
    height: 50
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  },
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  onlineCirc: {
    backgroundColor: blue,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 5,
    marginRight: 5
  },
  offlineCirc: {
    backgroundColor: 'red',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 5,
    marginRight: 5
  },
  onlineRow: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center'
  },
  emoji: {
    marginTop: -3
  },
  emojiFont: {
    fontFamily: Platform.OS === 'android' ? 'AndroidEmoji' : 'Georgia'
  },
  tagBox: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    // padding: 20,
    height: 35,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2.5,
    marginVertical: 2.5
    // color: '#808080'
  },
  singleTagBox: {
    backgroundColor: 'black',
    padding: 10,
    color: 'white'
  },
  tagStringContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: {
    borderColor: '#cccccc',
    borderStyle: 'solid',
    borderWidth: 1,
    height: 30,
    width: 250,
    alignSelf: 'center'
  },
  authInput: {
    height: 35,
    width: 300,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 4,
    alignSelf: 'center'
  },
  marginTop: {
    marginTop: 10
  },
  margin: {
    margin: 10
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: 'transparent'
  },
  contentContainer: {
    paddingVertical: 30,
    backgroundColor: 'white'
  },
  fullContainer: {
    flex: 1
  },
  row: {
    flexDirection: 'row'
  },
  fullWidthStyle: {
    width: fullWidth
  },
  flexRow: {
    flexDirection: 'row'
  },
  buttonParent: {
    flexDirection: 'row',
    padding: 10
  },
  buttonParentCenter: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'center'
  },
  buttonText: {
    color: '#808080'
  },
  genericButton: {
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5
  },
  whiteButton: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5
  },
  padding10: {
    padding: 10
  },
  createPostInput: {
    // marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 0
  },
  flex1: {
    flex: 1
  },
  boxShadow: {
    shadowColor: 'black',
    shadowOffset: { width: -0, height: 0.5 },
    shadowRadius: 1,
    shadowOpacity: 0.2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: lightGrey
  },
  darkGrey: {
    color: darkGrey
  },

  separator: {
    height: 16,
    borderColor: 'lightgrey',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  dots: {
    color: greyText,
    fontSize: 20,
    marginTop: -4,
    letterSpacing: -0.5
  },
  r: {
    height: 15,
    width: 16,
    marginRight: 0.5,
    marginLeft: 1
  },
  smallR: {
    marginRight: 1,
    width: 10,
    height: 10
  },
  coin: {
    height: 15,
    width: 16,
    marginRight: 1
  },
  rup: {
    height: 20,
    width: 24,
    resizeMode: 'contain'
  },
  postCat: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: blue,
    color: 'white',
    paddingHorizontal: 5,
    paddingVertical: 2,
    paddingBottom: 3,
    fontSize: 12
  },
  userImage: {
    height: 26,
    width: 26,
    borderRadius: 13,
    marginRight: 5,
    resizeMode: 'cover'
  },
  close: {
    position: 'absolute',
    width: 10,
    height: 10,
    top: 7,
    right: 5,
    resizeMode: 'contain'
  },
  notifCount: {
    position: 'absolute',
    top: 2,
    backgroundColor: 'red',
    right: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2.5,
    paddingVertical: 2,
    paddingHorizontal: 4
  },
  notifText: {
    fontSize: 12,
    color: 'white'
  },
  emptyText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 28
  },
  emptyList: {
    flex: 1,
    paddingHorizontal: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center'
    // justifyContent: 'flex-end',
  },
  break: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderGrey,
    marginHorizontal: 40
  },
  authScrollContent: {
    padding: 20,
    paddingTop: 15,
    flexGrow: 1
  }
};

const globalStyles = StyleSheet.create({ ...colors, ...font, ...alignment, ...layout });

export {
  globalStyles,
  fullWidth,
  fullHeight,
  blue,
  green,
  greyText,
  darkGrey,
  headerHeight,
  mainPadding,
  smallScreen,
  borderGrey,
  IphoneX
};
