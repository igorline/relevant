'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
} from 'react-native';
import { globalStyles } from '../styles/global';

export default class Tags extends Component {

  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  clearTag() {
    this.props.actions.setTag(null);
  }


  setTag(tag) {
    this.props.actions.setTag(tag);
  }

  render() {

    var tagsEl = null;
    var tags;
    var id = null;

    if (this.props.posts.tag) id = this.props.posts.tag._id;
    tags = this.props.posts.discoverTags;
    tagsEl = tags.map((data, i) => {
      return (
        <Text style={
          [styles.tagBox, {
            backgroundColor: data._id == id ? '#007aff' : '#F0F0F0',
            color: data._id == id ? 'white' : '#808080'
          }]}
          onPress={data._id == id ? () => this.clearTag() : () => this.setTag(data)}
          key={i}>
          {data.name}
        </Text>)
    })

    return (
      <ScrollView horizontal={true} 
        showsHorizontalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={styles.tags}>
        {tagsEl}
      </ScrollView>
    )
  }
}

var styles = {...globalStyles};
