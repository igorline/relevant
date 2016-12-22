import {
  StyleSheet,
  Dimensions
} from 'react-native';

const fullWidth = Dimensions.get('window').width;
const fullHeight = Dimensions.get('window').height;

const darkGrey = '#231f20';
const blue = '#4d4eff';

const font = StyleSheet.create({
  font10: {
    fontSize: 10,
  },
  font14: {
    fontSize: 14,
  },
  font15: {
    fontSize: 15,
  },
  font17: {
    fontSize: 17,
  },
  font20: {
    fontSize: 20,
  },
  font25: {
    fontSize: 25,
  },
  font40: {
    fontSize: 40,
  },
  navTitle: {
    fontSize: 22.5,
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'bold',
    letterSpacing: 0.15,
    paddingVertical: 10,
    // flex: 1,
    // justifyContent: 'center',
  },
  shareHeader: {
    marginTop: -20,
  },
  navButton: {
    fontSize: 10,
    fontFamily: 'BebasNeueRelevantRegular',
  },
  bebas: {
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'normal',
    letterSpacing: 0.5,
  },
  bebasBold: {
    fontFamily: 'BebasNeueRelevantRegular',
    fontWeight: 'bold',
    // marginBottom: -3,
    // lineHeight: 24,
    letterSpacing: 0.5,
  },
  libre: {
    fontFamily: 'Libre Caslon Display',
  },
  georgia: {
    fontFamily: 'Georgia',
  },
  tabFont: {
    fontFamily: 'Helvetica',
    fontWeight: 'bold'
  },
  strokeText: {
    fontFamily: 'HelveticaNeueLTStd-BdOu',
    lineHeight: 30,
  },
  halfLetterSpacing: {
    letterSpacing: 0.5,
  },
  quarterLetterSpacing: {
    letterSpacing: 0.25,
  },
  signInText: {
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'Georgia',
    fontSize: 18,
  }
});

const colors = StyleSheet.create({
  active: {
    color: blue,
  },
  white: {
    color: '#fff',
  },
  timestampGray: {
    color: '#B0B3B6'
  }
});


const alignment = StyleSheet.create({
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const layout = StyleSheet.create({
  commentInputParent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: 'white',
    paddingLeft: 5,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  commentInput: {
    flex: 1,
    padding: 10,
  },
  commentSubmit: {
    flex: 0,
    width: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreButton: {
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  reloadIcon: {
    height: 100,
    width: 100,
    marginBottom: 20
  },
  investOption: {
    margin: 5,
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    borderRadius: 5,
    width: 75,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  modalButtonText: {
    color: 'white',
    backgroundColor: 'transparent'
  },
  fieldsParent: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: 20,
  },
  fieldsInner: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  fieldsInputParent: {
    borderBottomWidth: 1,
    borderBottomColor: 'black'
  },
  fieldsInput: {
    height: 50,
    fontFamily: 'Georgia'
  },
  largeButton: {
    height: 50,
    borderWidth: 2,
    borderColor: '#3E3EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeButtonText: {
    fontFamily: 'BebasNeueRelevantRegular',
    color: '#3E3EFF',
    fontSize: 29,
  },
  mediumButton: {
    height: 50,
    borderWidth: 2,
    borderColor: '#3E3EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediumButtonText: {
    fontFamily: 'BebasNeueRelevantRegular',
    color: '#3E3EFF',
    fontSize: 15,
  },
  activityRight: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingLeft: 10,
  },
  activityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  singleActivity: {
    padding: 10,
    width: fullWidth,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'stretch',
    flex: 1,
    overflow: 'visible',
    backgroundColor: 'white'
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
    borderBottomColor: blue,
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
    alignItems: 'center',
  },
  category: {
    flex: 1,
    textAlign: 'center'
  },
  linkInput: {
    height: 50,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    height: 50
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
  tagBox: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    marginLeft: 5,
    marginTop: 5,
    fontSize: 15,
    color: '#808080'
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
    flex: 1,
    backgroundColor: 'hsl(0,0%,90%)',
  },
  row: {
    flexDirection: 'row',
  },
  fullWidthStyle: {
    width: fullWidth,
  },
  flexRow: {
    flexDirection: 'row',
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
    paddingTop: 12.5,
    paddingBottom: 12.5,
    backgroundColor: '#ffffff'
  },
  flex1: {
    flex: 1
  },
  boxShadow: {
    shadowColor: 'grey',
    shadowOffset: { width: -1, height: 1 },
    shadowRadius: 2,
    shadowOpacity: 0.1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgrey'
  },
  uploadAvatar: {
    height: 125,
    width: 125,
    borderRadius: 62.5,
    resizeMode: 'cover',
  },
  darkGrey: {
    color: darkGrey
  },
  separator: {
    height: 12,
    backgroundColor: 'hsl(0,0%,90%)',
  }
});

const globalStyles = { ...colors, ...font, ...alignment, ...layout, blue };

export {
  globalStyles,
  fullWidth,
  fullHeight
};
