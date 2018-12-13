import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Post from './post.component';
import * as postActions from '../../../actions/post.actions';
import * as investActions from '../../../actions/invest.actions';
import Comments from '../comment/comment.container';
import Footer from '../common/footer.component';
import Sidebar from '../common/sidebar.component';

if (process.env.BROWSER === true) {
  require('./post.css');
}

class Posts extends Component {
  static propTypes = {
    actions: PropTypes.object,
    posts: PropTypes.object,
    params: PropTypes.object,
    location: PropTypes.object
  };

  static fetchData(dispatch, params) {
    if (!params.id || params.id === undefined) return null;
    return dispatch(postActions.getSelectedPost(params.id));
  }

  componentDidMount() {
    this.post = this.props.posts.posts[this.props.params.id];
    if (!this.post) {
      this.props.actions.getSelectedPost(this.props.params.id);
    }
  }

  render() {
    this.post = this.props.posts.posts[this.props.params.id];
    if (!this.post) return null;
    const link = this.props.posts.links[this.post.metaPost];
    const hasPost = this.post && this.post !== 'notFound';

    return (
      <div style={{ flex: 1 }}>
        <div className="singlePost row column pageContainer">
          {hasPost && (
            <div className="postContainer">
              <Post post={this.post} link={link} {...this.props} />
              <Comments post={this.post} {...this.props} />
            </div>
          )}
          <Sidebar {...this.props} />
        </div>
        <Footer location={this.props.location} />
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    posts: state.posts,
    user: state.user,
    investments: state.investments,
    myPostInv: state.investments.myPostInv,
    isAuthenticated: state.auth.isAuthenticated
  }),
  dispatch => ({
    actions: bindActionCreators(
      {
        ...postActions,
        ...investActions
      },
      dispatch
    )
  })
)(Posts);
