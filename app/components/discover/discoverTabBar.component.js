import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';

let styles;

const DefaultTabBar = React.createClass({
  propTypes: {
    goToPage: PropTypes.func,
    activeTab: PropTypes.number,
    tabs: PropTypes.array,
    backgroundColor: PropTypes.string,
    activeTextColor: PropTypes.string,
    inactiveTextColor: PropTypes.string,
    textStyle: Text.propTypes.style,
    tabStyle: View.propTypes.style,
    renderTab: PropTypes.func,
    underlineStyle: View.propTypes.style,
  },

  getDefaultProps() {
    return {
      activeTextColor: 'navy',
      inactiveTextColor: 'black',
      backgroundColor: null,
    };
  },

  renderTabOption(name, page) {
  },

  renderTab(name, page, isTabActive, onPressHandler, textColor) {
    const { activeTextColor, inactiveTextColor, textStyle } = this.props;
    // const textColor = isTabActive ? activeTextColor : inactiveTextColor;
    const fontWeight = isTabActive ? 'bold' : 'normal';

    return (<TouchableOpacity
      style={styles.flexOne}
      key={name}
      accessible
      accessibilityLabel={name}
      accessibilityTraits={'button'}
      onPress={() => onPressHandler(page)}
    >
      <View style={[styles.tab, this.props.tabStyle]}>
        <Animated.Text style={[{ color: textColor, fontWeight }, textStyle]}>
          {name}
        </Animated.Text>
      </View>
    </TouchableOpacity>);
  },

  render() {
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    const tabUnderlineStyle = {
      position: 'absolute',
      width: containerWidth / numberOfTabs,
      height: 4,
      backgroundColor: 'navy',
      bottom: 0,
    };

    const left = this.props.scrollValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, containerWidth / numberOfTabs],
    });

    return (
      <View style={[styles.tabs, { backgroundColor: this.props.backgroundColor }, this.props.style]}>
        {this.props.tabs.map((name, page) => {

          let inputRange = [0, 1, 2];
          let outputRange = inputRange.map(i => i === page ? 1 : 0);

          const textColor = this.props.scrollValue.interpolate({
            inputRange,
            outputRange
          }).interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(35, 31, 32, 1)', 'rgba(77, 78, 255, 1)']
          });

          const isTabActive = this.props.activeTab === page;
          const renderTab = this.props.renderTab || this.renderTab;
          return renderTab(name, page, isTabActive, this.props.goToPage, textColor);
        })}
        <Animated.View style={[tabUnderlineStyle, { left }, this.props.underlineStyle]} />
      </View>
    );
  },
});

styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  flexOne: {
    flex: 1,
  },
  tabs: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: '#ccc',
  },
});

module.exports = DefaultTabBar;
