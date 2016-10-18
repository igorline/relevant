'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  TextInput,
  TouchableHighlight,
  AlertIOS
} from 'react-native';
import Button from 'react-native-button';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
import Tags from './tags.component';

export default class DiscoverHeader extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      searchTerm: null,
      transY: new Animated.Value(0),
      headerHeight: 0,
      layout: false,
    }
  }

  componentDidMount() {
    if(this.props.showHeader) this.showHeader();
  }

  componentWillReceiveProps(next) {
    if(this.props.showHeader != next.showHeader) {
      if(next.showHeader) this.showHeader();
      else this.hideHeader();
    }
  }

  hideHeader() {
    var self = this;
    self.setState({showHeader: false})
    var moveHeader = self.state.headerHeight * -1;
    Animated.timing(          // Uses easing functions
       this.state.transY,    // The value to drive
       {toValue: moveHeader}            // Configuration
     ).start();
  }

  showHeader() {
    var self = this;
    self.setState({showHeader: true})
    Animated.timing(          // Uses easing functions
       this.state.transY,    // The value to drive
       {toValue: 0}         // Configuration
     ).start();
  }

  changeView(view) {
    this.props.actions.setView('discover', view);
  }

  search() {
    this.props.actions.searchTags(this.state.tagSearchTerm)
      //TODO should this be here?
      .then(foundTags => {
        console.log(foundTags, 'foundTags')
        if (!foundTags.status) {
          AlertIOS.alert("Search error");
        } else {
          if (foundTags.data.length) {
            this.props.actions.setTag(foundTags.data[0]);
          } else {
            this.setState({noResults: true});
            AlertIOS.alert("No results");
          }
        }
      })
  }

  render() {
    var self = this;

    return (
      <Animated.View
        style={[styles.transformContainer], {
          position:'absolute',
          top: 0,
          backgroundColor:
          'white',
          transform: [{translateY: self.state.transY}]
        }}
          onLayout={
            (event) => {
              var {x, y, width, height} = event.nativeEvent.layout;
              if (!self.state.layout) {
                self.setState({headerHeight: height, layout: true})
                self.props.setPostTop(height);
              }
            }
          }>
          <View style={[styles.searchParent]}>
            <TextInput onSubmitEditing={this.search.bind(this)}
              style={[styles.searchInput, styles.font15]}
              placeholder={'Search'}
              multiline={false}
              onChangeText={term => this.setState({tagSearchTerm: term})}
              value={this.state.tagSearchTerm} returnKeyType='done' />
          </View>
          <View>
            <Tags actions={this.props.actions} posts={this.props.posts} />
          </View>
           <View style={[styles.row, {width: fullWidth}]}>
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.typeParent, this.props.view == 1 ? styles.activeBorder : null]}
            onPress={() => this.changeView(1)}>
            <Text style={[styles.type, styles.darkGray, styles.font15, this.props.view == 1 ? styles.active : null]}>
              New
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.typeParent, this.props.view == 2 ? styles.activeBorder : null]}
            onPress={() => this.changeView(2)}>
            <Text style={[styles.type, styles.darkGray, styles.font15, this.props.view == 2 ? styles.active : null]}>
              Top
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor={'transparent'}
            style={[styles.typeParent, this.props.view == 3 ? styles.activeBorder : null]}
            onPress={() => this.changeView(3)}>
            <Text style={[styles.type, styles.darkGray, styles.font15, this.props.view == 3 ? styles.active : null]}>
              People
            </Text>
          </TouchableHighlight>
        </View>
      </Animated.View>
    )
  }
}

const localStyles = StyleSheet.create({
transformContainer: {
  overflow: 'hidden',
},
searchParent: {
  width: fullWidth,
  backgroundColor: '#F0F0F0',
  overflow: 'hidden',
  padding: 5
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
  borderRadius: 5
}
});

var styles = {...localStyles, ...globalStyles};