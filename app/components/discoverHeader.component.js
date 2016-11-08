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
    this.search = this.search.bind(this);
    this.headerHeight = 134;
    this.changeView = this.changeView.bind(this);
  }

  componentDidMount() {
    if (this.props.showHeader) this.showHeader();
  }

  componentWillReceiveProps(next) {
    //console.log(next.showHeader, 'next.showHeader');
    if (this.props.showHeader !== next.showHeader) {
      if (next.showHeader) this.showHeader();
      else this.hideHeader();
    }
    if (this.props.tags.selectedTags !== next.tags.selectedTags) {
      this.input.blur();
    }
  }

  hideHeader() {
    const moveHeader = this.headerHeight * -1;
    this.setState({ showHeader: false });
    Animated.timing(          // Uses easing functions
       this.state.transY,    // The value to drive
       { toValue: moveHeader }            // Configuration
     ).start();
  }

  showHeader() {
    this.setState({ showHeader: true });
    Animated.timing(          // Uses easing functions
       this.state.transY,    // The value to drive
       { toValue: 0 }         // Configuration
     ).start();
  }

  changeView(view) {
    this.layout = false;
    if (this.props.view === view) this.props.triggerReload();
    this.props.actions.setView('discover', view);
  }

  search(term) {
    if (term && term.length > 1) {
      this.props.actions.searchTags(term);
    }
    else this.props.actions.searchTags(null);
  }

  close() {
    this.search();
    this.input.blur();
    this.input.clear();
  }

  render() {
    let tabs = [
      { id: 1, title: 'New' },
      { id: 2, title: 'Top' },
      { id: 3, title: 'People' }
    ];

    let tags = (
      <View>
        <Tags actions={this.props.actions} tags={this.props.tags} />
      </View>
    );

    let search = (
      <View style={[styles.searchParent]}>
        <TextInput
          ref={c => this.input = c}
          onSubmitEditing={this.search}
          style={[styles.searchInput, styles.font15]}
          placeholder={'Search'}
          multiline={false}
          onChangeText={term => this.search(term)}
          varlue={this.searchTerm}
          returnKeyType="done"
          clearTextOnFocus
        />
        <View style={styles.closeParent}>
          <Text
            style={styles.close}
            onPress={() => this.close()}
          >
            ✕
          </Text>
        </View>
      </View>
    );


    if (this.props.view === 3) {
      tags = null;
      search = null;
    }

    return (
      <Animated.View
        style={[styles.transformContainer, {
          position: 'absolute',
          top: 0,
          backgroundColor:
          'white',
          transform: [{ translateY: this.state.transY }],
        }]}
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
        {search}
        {tags}
        <Tabs
          tabs={tabs}
          active={this.props.view}
          handleChange={this.changeView}
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
  searchInput: {
    flex: 1,
    paddingTop: 5,
    height: 25,
    textAlign: 'center',
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  closeParent: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 10,
    // borderColor: '#f0f0f0',
    // borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  close: {
    color: 'grey',
    fontSize: 12,
    textAlign: 'center',
    opacity: .8
  }
});

styles = { ...localStyles, ...globalStyles };

