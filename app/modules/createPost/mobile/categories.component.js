import React, { Component } from 'react';
import { View, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as createPostActions from 'modules/createPost/createPost.actions';
import * as tagActions from 'modules/tag/tag.actions';
import Topics from './topics.component';

class Categories extends Component {
  static propTypes = {
    createPost: PropTypes.object,
    actions: PropTypes.object,
    tags: PropTypes.array
  };

  constructor(props, context) {
    super(props, context);
    this.setTopic = this.setTopic.bind(this);
  }

  componentWillMount() {
    // TODO check this works
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.tags.length) this.props.actions.getParentTags();
    });

    if (this.props.createPost.postCategory) {
      this.selectedTopic = this.props.createPost.postCategory;
    }
  }

  setTopic(topic) {
    if (this.props.createPost.postCategory === topic) {
      this.selectedTopic = null;
      this.props.actions.setPostCategory(null);
    } else {
      this.selectedTopic = topic;
      this.props.actions.setPostCategory(topic);
    }
    return null;
  }

  render() {
    const { createPost, actions, tags } = this.props;
    const { selectedTopic } = this;
    let categoryEl;

    if (this.props.tags) {
      categoryEl = (
        <Topics
          ref={c => (this.topicsEl = c)}
          topics={tags}
          selectedTopic={selectedTopic}
          type={'create'}
          action={this.setTopic}
          actions={actions}
          createPost={createPost}
        />
      );
    }

    return (
      <View style={{ flex: 1 }} behavior={'padding'}>
        <View style={{ flex: 1 }}>{categoryEl}</View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    createPost: state.createPost,
    user: state.user,
    tags: state.tags.parentTags
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...createPostActions,
        ...tagActions,
      },
      dispatch
    )
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Categories);
