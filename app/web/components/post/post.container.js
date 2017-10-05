import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Post from './post.component';
import * as authActions from '../../../actions/auth.actions';
import * as userActions from '../../../actions/user.actions';
import * as postActions from '../../../actions/post.actions';
import * as statsActions from '../../../actions/stats.actions';
import * as tagActions from '../../../actions/tag.actions';
import * as investActions from '../../../actions/invest.actions';
import * as createPostActions from '../../../actions/createPost.actions';
import * as navigationActions from '../../../actions/navigation.actions';
import * as animationActions from '../../../actions/animation.actions';
import Comments from '../comment/comment.container';
import RequestInvite from '../main/requestInvite.component';

if (process.env.BROWSER === true) {
  require('./post.css');
}

class Posts extends Component {
  constructor(props) {
    super(props);
  }

  static fetchData(dispatch, params, req) {
    console.log('calling fetchData');
    return dispatch(postActions.getSelectedPost(params.id));
  }

  componentDidMount() {
    if (!this.post) {
      this.props.actions.getSelectedPost(this.props.params.id);
    }
  }

  render () {
    this.post = this.props.posts.posts[this.props.params.id];
    const hasPost = this.post && this.post !== 'notFound'

    return (
      <div className='parent'>
        {hasPost &&
          <div className='postContainer'>
            <Post post={this.post} {...this.props} />
            <Comments post={this.post} {...this.props} />
          </div>
        }
        <RequestInvite {...this.props} />
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    posts: state.posts,
    investments: state.investments,
    myPostInv: state.investments.myPostInv,
    isAuthenticated: state.auth.isAuthenticated,
  }),
  dispatch => ({
    actions: bindActionCreators({
      ...postActions,
      ...investActions,
    }, dispatch)
  }))(Posts);
