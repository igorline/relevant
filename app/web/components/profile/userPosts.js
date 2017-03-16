import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import * as ProfileActions from '../../actions/profile'

var Infinite = require('react-infinite');

const postInitialAmt = 5; // # of posts to initially load on page
const postUpdateAmt = 5; // # of posts to load for each scroll

class UserPosts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postsToRender: [],
      isInfiniteLoading: false
    };
  }

  componentDidUpdate(prevProps) {
    // If we've received posts via props we can grab the initial amt to display
    if ((this.state.postsToRender.length == 0) || (this.props.profile.userPosts !== prevProps.profile.userPosts)) {
      this.setState({
        postsToRender: this.props.profile.userPosts.slice(0, postInitialAmt)
      });
    }
  }

  // Extends postsToRender on scroll
  loadMorePosts() {
    this.setState({
      isInfiniteLoading: true
    });

    var postsLength = this.state.postsToRender.length,
        // Grab next slice of posts to concat
        newPosts = this.props.profile.userPosts.slice(postsLength, postsLength + postUpdateAmt);

    this.setState({
      isInfiniteLoading: false,
      postsToRender: this.state.postsToRender.concat(newPosts)
    });
  }

  render() {
    var posts = this.state.postsToRender;
    if (!this.props.profile.selectedUser) return null;
    return (
      <div>
        <h1>Posts</h1>

          <Infinite elementHeight = {250}
                      infiniteLoadBeginEdgeOffset = {0}
                      onInfiniteLoad = {this.loadMorePosts.bind(this)}
                      isInfiniteLoading = {this.state.isInfiniteLoading}
                      useWindowAsScrollContainer
                      >

            {posts.map(function(post){
                  return (
                    <div style={{height: 250 + 'px'}} key={post._id}>
                      <h3>
                        <a href={'/post/' + post._id}>↪</a>
                        <a href={post.link}>{post.title}</a>
                        (Relevance: {Math.round(post.relevance * 100) / 100} Value: {post.value})
                         by <a href={'/profile/' + post.user._id}>{post.user.name}</a>
                      </h3>

                      {post.image && <img src={post.image} height ="55%"></img>}
                      
                      <p>{post.body}</p>
                      
                      <br/>
                      <br/>
                    </div>
                  )
            })}

          </Infinite>
      </div>
    )
  }
}

export default UserPosts
