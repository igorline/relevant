import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Post from './post';
import * as postActions from '../../../actions/post.actions';
import Comments from '../comment/comment.container';

class Posts extends Component {
  constructor(props) {
    super(props);
  }

  static fetchData(dispatch, params, req) {
    console.log('calling fetchData');
    return dispatch(postActions.getSelectedPost(params.id));
  }

  componentDidMount() {
    this.props.actions.getSelectedPost(this.props.params.id);
  }

  render () {
    return (
      <div>
        <Post {...this.props} />
        <Comments {...this.props} />
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    post: state.post,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...postActions
    }, dispatch)
  }))(Posts);

