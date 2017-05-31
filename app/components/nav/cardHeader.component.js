import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
  Image,
  Animated,
  ActionSheetIOS,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import Search from './search.component';
import { globalStyles } from '../../styles/global';
import Stats from '../post/stats.component';

let styles;

class CardHeader extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      search: false
    };
    this.renderTitle = this.renderTitle.bind(this);
    this.renderLeft = this.renderLeft.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
  }

  showActionSheet(id) {
    ActionSheetIOS.showActionSheetWithOptions({
      options: ['Block User', 'Cancel'],
      cancelButtonIndex: 1,
      destructiveIndex: 0,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0:
          console.log(this.props.actions);
          this.props.actions.updateBlock(id);
          break;
        default:
          return;
      }
    });
  }

  toggleSearch() {
    this.setState({ search: !this.state.search });
  }

  renderLeft(props) {
    let leftEl = <View style={styles.leftButton} />;
    let back;
    if (props.scene.route.back) {
      back = (
        <View style={{ paddingHorizontal: 10, marginLeft: -10 }}>
          <Image
            resizeMode={'contain'}
            style={{ width: 11, height: 19 }}
            source={require('../../assets/images/backarrow.png')}
          />
        </View>
      );

      if (this.props.scene.route.left) {
        back = (
          <Text
            style={[
              { fontSize: 17 },
              styles.active,
              styles.leftButtonText,
            ]}
          >
            {this.props.scene.route.left}
          </Text>
        );
      }

      return (<TouchableHighlight
        style={[styles.leftButton]}
        underlayColor={'transparent'}
        onPress={this.props.back}
      >
        {back}
      </TouchableHighlight>);
    }

    // if (this.props.scene.route.title === 'Discover') {
    //   leftEl = [];
    //   leftEl.push(
    //     <View
    //       key={0}
    //       style={[styles.leftButton, { flex: this.state.search ? 0.06 : 1 }]}
    //     >
    //       <TouchableHighlight
    //         underlayColor={'transparent'}
    //         onPress={() => this.toggleSearch()}
    //       >
    //         <Text style={{ paddingBottom: 5 }}>🔎</Text>
    //       </TouchableHighlight>
    //     </View>);
    //   if (this.state.search) {
    //     leftEl.push(
    //       <Search
    //         key={'search'}
    //         toggleSearch={this.toggleSearch}
    //         {...this.props}
    //       />
    //     );
    //   }
    // }
    return leftEl;
  }

  renderTitle(props) {
    if (this.state.search) return null;
    let title = props.scene.route ? props.scene.route.title : '';
    let component = props.scene.route.component;
    let key = props.scene.route.key;
    let bottomArrow;
    let rightArrow;
    let titleAction = () => null;
    let id;

    title = title ? title.trim() : null;

    if (component === 'profile') {
      if (this.props.users.users[props.scene.route.id]) {
        title = this.props.users.users[props.scene.route.id].name;
        id = this.props.users.users[props.scene.route.id]._id;
      }

      if (this.props.auth.user && id !== this.props.auth.user._id) {
        titleAction = () => this.showActionSheet(id);

        bottomArrow = (<View
          style={{ marginBottom: -10 }}
          onPress={titleAction}
        >
          <Image
            style={styles.arrow}
            resizeMode={'contain'}
            source={require('../../assets/images/downarrow.png')}
          />
        </View>);
      }
    }

    if (key === 'discover' || key === 'mainDiscover' || component === 'discover') {
      titleAction = () => this.props.actions.toggleTopics();
      bottomArrow = (<View
        style={[styles.arrow]}
        onPress={titleAction}
      >
        <Image
          style={styles.arrow}
          resizeMode={'contain'}
          source={require('../../assets/images/downarrow.png')}
        />
      </View>);

      if (key === 'mainDiscover') {
        return (
          <TouchableOpacity
            style={{
              alignItems: 'center',
              backgroundColor: 'transparent',
              paddingVertical: 6,
            }}
            onPress={titleAction}
          >
            <View style={{ marginBottom: -10 }}>
              <Image
                source={require('../../assets/images/logo.png')}
                resizeMode={'contain'}
                style={{ width: 120, height: 20, marginBottom: 4 }}
              />
              {bottomArrow}
            </View>
          </TouchableOpacity>
        );
      }
    }

    if (title === 'Profile' && this.props.auth.user) {
      title = this.props.auth.user.name;
    }

    let clipped = title;

    if (title && title.length > 20) {
      clipped = title.substring(0, 18);
      clipped += '...';
    }

    if (title === 'Read' || component === 'login' || component === 'signup' || component === 'imageUpload') {
      return (
        <View style={{ alignItems: 'center', paddingVertical: 6, backgroundColor: 'transparent' }}>
          <Image
            source={require('../../assets/images/logo.png')}
            resizeMode={'contain'}
            style={{ width: 130, height: 25 }}
          />
        </View>
      );
    }

    return (
      <View
        ref={c => this.title = c}
        style={[styles.titleComponent]}
      >
        <Text onPress={titleAction} style={styles.navTitle}>
          {clipped}
        </Text>
        {bottomArrow}
      </View>
    );
  }

  renderRight(props) {
    if (this.state.search) return null;
    let statsEl = null;
    let rightEl;

    let key = this.props.defaultContainer;

    if (this.props.auth.user) {
      // let id = this.props.auth.user._id;
      // let user = this.props.user.users[id];
      let component = props.scene.route.component;

      statsEl = (
        <Stats
          type={'nav'}
          discover={component === 'mainDiscover'}
          parent={this}
          entity={this.props.auth.user}
        />
      );
    }

    if (key !== 'myProfile') {
      rightEl = statsEl;
    } else {
      rightEl = (
        <TouchableHighlight
          style={styles.gear}
          underlayColor={'transparent'}
          onPress={() => this.props.showActionSheet()}
        >
          <Text style={{ paddingBottom: 5, fontSize: 17 }}>⚙️</Text>
        </TouchableHighlight>
      );
    }

    // if (props.scene.route.component === 'profile' &&
    //   this.props.auth.user &&
    //   props.scene.route.id !== this.props.auth.user._id) {
    //   rightEl = null;
      // rightEl = (
      //   <View style={styles.gear}>
      //     <TouchableHighlight
      //       underlayColor={'transparent'}
      //       onPress={() => this.thirsty()}
      //     >
      //       <Text>thirsty</Text>
      //     </TouchableHighlight>
      //   </View>
      // );
    // }

    return <View style={styles.rightButton}>{rightEl}</View>;
  }

  renderHeader(props, headerStyle) {
    let style = [styles.header, headerStyle];
    if (this.props.share) {
      style = [styles.header, styles.shareHeader, headerStyle];
    }

    return (
      <Animated.View
        style={[headerStyle, style]}
      >
        {this.renderLeft(props)}
        {this.renderTitle(props)}
        {this.props.renderRight ? this.props.renderRight(props) : this.renderRight(props)}
      </Animated.View>
    );
  }

  render() {
    return this.renderHeader(this.props, this.props.style);
  }
}

const localStyles = StyleSheet.create({
  titleComponent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
    // position: 'absolute',
    marginTop: -6,
    bottom: -3,
    left: 0,
    right: 0,
    width: 22,
    height: 15,
  },
  backArrow: {
    paddingTop: 4,
  },
  leftButton: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  leftButtonText: {
    fontFamily: 'Helvetica'
  },
  rightButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 10,
  },
  gearImg: {
    height: 20,
    width: 20,
    justifyContent: 'center'
  },
  gear: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: 10,
  },
  closeParent: {
    position: 'absolute',
    top: 12,
    right: 10,
    width: 20,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  close: {
    color: 'grey',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8
  }
});

styles = { ...localStyles, ...globalStyles };

export default CardHeader;

