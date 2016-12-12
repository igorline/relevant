import {
  StyleSheet,
  Dimensions
} from 'react-native';

const fullWidth = Dimensions.get('window').width;
const fullHeight = Dimensions.get('window').height;

const font = StyleSheet.create({
  font10: {
    fontSize: 10,
  },
  font15: {
    fontSize: 15,
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
    fontSize: 20,
    fontFamily: 'Bebas Neue',
  },
  navButton: {
    fontSize: 10,
    fontFamily: 'Bebas Neue',
  },
  bebas: {
    fontFamily: 'Bebas Neue',
  },
  libre: {
    fontFamily: 'Libre Caslon Display',
  },
  georgia: {
    fontFamily: 'Georgia',
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
  }
});

const colors = StyleSheet.create({
  active: {
    color: '#4D4EFF',
  },
  white: {
    color: '#fff',
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
    paddingTop: 40,
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
    height: 75,
    borderWidth: 2,
    borderColor: '#3E3EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeButtonText: {
    fontFamily: 'Bebas Neue',
    color: '#3E3EFF',
    fontSize: 30,
  },
  mediumButton: {
    height: 50,
    borderWidth: 2,
    borderColor: '#3E3EFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediumButtonText: {
    fontFamily: 'Bebas Neue',
    color: '#3E3EFF',
    fontSize: 15,
  },
  activityRight: {
    flex: 0.40,
  },
  activityLeft: {
    flex: 0.60,
  },
  singleActivity: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
    width: fullWidth,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'stretch',
    flex: 1,
    overflow: 'visible',
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
    borderBottomColor: '#007aff',
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
    backgroundColor: '#009E1D',
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
    flex: 1
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
    marginTop: 10,
    padding: 10,
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
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'lightgrey'
  },
  uploadAvatar: {
    height: 125,
    width: 125,
    borderRadius: 62.5,
    resizeMode: 'cover',

  },
});

const globalStyles = { ...colors, ...font, ...alignment, ...layout };

export {
  globalStyles,
  fullWidth,
  fullHeight
};
