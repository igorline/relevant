import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableHighlight,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as tagActions from '../actions/tag.actions';
import * as createPostActions from '../actions/createPost.actions';
import * as navigationActions from '../actions/navigation.actions';
import { globalStyles } from '../styles/global';

class Categories extends Component {
  constructor(props, context) {
    super(props, context);
    this.setCategory.bind(this);
    this.state = {
    };
  }

  componentWillMount() {
    this.props.actions.getParentTags();
  }

  setCategory(tag) {
    this.props.actions.setPostCategory(tag);
    this.props.actions.push({
      key: 'createPostFinish',
      back: true,
      title: 'Post',
      next: 'Post'
    }, 'home');
  }

  render() {
    let categoryEl = null;
    let styles = globalStyles;
    if (this.props.tags) {
      categoryEl = this.props.tags.map((tag, i) => {
        return (
          <TouchableHighlight
            key={i}
            onPress={() => this.setCategory(tag)}
            underlayColor={'transparent'}
            style={[styles.categoryItem]}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center' }}
            >
              <Text>{tag.emoji}</Text>
              <Text>{tag.categoryName}</Text>
            </View>
          </TouchableHighlight>
        );
      });
    }

    return (
      <ScrollView >
        {categoryEl}
      </ScrollView>
    );
  }
}

// export default Categories;
function mapStateToProps(state) {
  return {
    tags: state.tags.parentTags,
    view: state.view,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { ...createPostActions,
        ...tagActions,
        ...navigationActions,
      }, dispatch),
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(Categories);
