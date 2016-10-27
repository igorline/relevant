import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  TextInput,
  AlertIOS,
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
    if (this.props.showHeader !== next.showHeader) {
      if (next.showHeader) this.showHeader();
      else this.hideHeader();
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

  search() {
    this.props.actions.searchTags(this.state.tagSearchTerm)
    // TODO should this be here?
    .then((foundTags) => {
      if (!foundTags.status) {
        AlertIOS.alert('Search error');
      } else if (foundTags.data.length) {
        this.props.actions.setTag(foundTags.data[0]);
      } else {
        this.setState({ noResults: true });
        AlertIOS.alert('No results');
      }
    });
  }

  render() {
    let tabs = [
      { id: 1, title: 'New' },
      { id: 2, title: 'Top' },
      { id: 3, title: 'People' }
    ];

    let tags = (
      <View>
        <Tags actions={this.props.actions} posts={this.props.posts} />
      </View>
    );

    let search = (
      <View style={[styles.searchParent]}>
        <TextInput
          onSubmitEditing={this.search}
          style={[styles.searchInput, styles.font15]}
          placeholder={'Search'}
          multiline={false}
          onChangeText={term => this.setState({ tagSearchTerm: term })}
          value={this.state.tagSearchTerm} returnKeyType="done"
        />
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
            if (!this.layout) {
              this.headerHeight = height;
              this.props.setPostTop(this.headerHeight);
              this.layout = true;
            }
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
});

styles = { ...localStyles, ...globalStyles };

