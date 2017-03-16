import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Post from './post';
import * as PostActions from '../../actions/post'

class Posts extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.getSelectedPost(this.props.params.id);
  }

  render () {
    return <Post { ...this.props} />;
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      post: state.post
    }
  },
  dispatch => {
    return Object.assign({}, { dispatch },  bindActionCreators(PostActions, dispatch))
})(Posts)
