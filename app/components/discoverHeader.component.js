import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TextInput,
  Text,
} from 'react-native';
import { globalStyles, fullWidth } from '../styles/global';
import Tags from './tags.component';
import Tabs from './tabs.component';

let styles;

export default class DiscoverHeader extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      searchTerm: null,
      transY: new Animated.Value(0),
    };
    this.headerHeight = 134;
  }

  componentDidMount() {
    if (this.props.showHeader) this.showHeader();
  }

  componentWillReceiveProps(next) {
    if (this.props.showHeader !== next.showHeader) {
      if (next.showHeader) this.showHeader();
      else this.hideHeader();
    }
    // if (this.props.tags.selectedTags !== next.tags.selectedTags) {
    //   this.input.blur();
    // }
  }

  hideHeader() {
    const moveHeader = this.headerHeight * -1;
    this.setState({ showHeader: false });
    Animated.timing(
       this.state.transY,
       { toValue: moveHeader }
     ).start();
  }

  showHeader() {
    this.setState({ showHeader: true });
    Animated.timing(
       this.state.transY,
       { toValue: 0 }
     ).start();
  }

  render() {

    let tags = (
      <View>
        <Tags actions={this.props.actions} tags={this.props.tags} />
      </View>
    );

    if (this.props.view === 2) {
      tags = null;
      search = null;
    }

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          backgroundColor:
          'white',
          transform: [{ translateY: this.state.transY }],
          overflow: 'hidden',
        }}
        ref={(c) => { this.header = c; }}
        onLayout={
          (event) => {
            const { height } = event.nativeEvent.layout;
            // TODO make sure this is efficient
            // if (!this.layout) {
            this.headerHeight = height;
            this.props.setPostTop(this.headerHeight);
            this.layout = true;
            // }
          }
        }
      >
        {tags}
        <Tabs
          tabs={this.props.tabs}
          active={this.props.view}
          handleChange={this.props.changeView}
        />
      </Animated.View>
    );
  }
}

DiscoverHeader.propTypes = {
  view: React.PropTypes.number,
  posts: React.PropTypes.object,
  actions: React.PropTypes.object,
  showHeader: React.PropTypes.bool,
  setPostTop: React.PropTypes.func,
};

const localStyles = StyleSheet.create({
  transformContainer: {
    overflow: 'hidden',
  },
  searchParent: {
    width: fullWidth,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
    padding: 5,
  },
});

styles = { ...localStyles, ...globalStyles };
