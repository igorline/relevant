import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';

const Infinite = require('react-infinite');

const postInitialAmt = 5; // # of posts to initially load on page
const postUpdateAmt = 5; // # of posts to load for each scroll

class UserPosts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postsToRender: [],
      isInfiniteLoading: false
    };
    this.loadMorePosts = this.loadMorePosts.bind(this);
  }

  componentDidUpdate(prevProps) {
    // If we've received posts via props we can grab the initial amt to display
    if ((this.state.postsToRender.length === 0) || (this.props.profile.userPosts !== prevProps.profile.userPosts)) {
      // this.setState({
      //   postsToRender: this.props.posts.userPosts.slice(0, postInitialAmt)
      // });
    }
  }

  // Extends postsToRender on scroll
  loadMorePosts() {
    // console.log(this.props, this.state)

    this.setState({
      isInfiniteLoading: true
    });

    const postsLength = this.state.postsToRender.length;

    // console.log(this.state.postsToRender)
    if (! this.state.postsToRender.length) {
      return
    }

    // Grab next slice of posts to concat
    // const newPosts = this.props.posts.userPosts.slice(postsLength, postsLength + postUpdateAmt);
    //
    // this.setState({
    //   isInfiniteLoading: false,
    //   postsToRender: this.state.postsToRender.concat(newPosts)
    // });
  }

  // render() {
  //   const posts = this.state.postsToRender;
  //   console.log(this.props.posts)
  //   // if (!this.props.user) return null;
  //   return (
  //     <div>
  //       <h1>Posts</h1>
  //       <Infinite
  //         elementHeight={250}
  //         infiniteLoadBeginEdgeOffset={0}
  //         onInfiniteLoad={this.loadMorePosts}
  //         isInfiniteLoading={this.state.isInfiniteLoading}
  //         useWindowAsScrollContainer
  //       >
  //         {posts.map(post => {
  //           return (
  //             <div style={{ height: 250 + 'px' }} key={post._id}>
  //               <h3>
  //                 <a href={'/post/' + post._id}>↪</a>
  //                 <a href={post.link}>{post.title}</a>
  //                 (Relevance: {Math.round(post.relevance * 100) / 100} Value: {post.value})
  //                  by <a href={'/profile/' + post.user._id}>{post.user.name}</a>
  //               </h3>
  //
  //               {post.image && <img src={post.image} height="55%" role="presentation" />}
  //               <p>{post.body}</p>
  //               <br />
  //               <br />
  //             </div>
  //           );
  //         })}
  //       </Infinite>
  //     </div>
  //   );
  // }

  render() {
    const posts = this.state.postsToRender;
    console.log(this.props.posts)
    // if (!this.props.user) return null;
    return (
      <div>
        <h1>Posts</h1>
        {posts.map(post => {
          return (
            <div style={{ height: 250 + 'px' }} key={post._id}>
              <h3>
                <a href={'/post/' + post._id}>↪</a>
                <a href={post.link}>{post.title}</a>
                (Relevance: {Math.round(post.relevance * 100) / 100} Value: {post.value})
                 by <a href={'/profile/' + post.user._id}>{post.user.name}</a>
              </h3>

              {post.image && <img src={post.image} height="55%" role="presentation" />}
              <p>{post.body}</p>
              <br />
              <br />
            </div>
          );
        })}
      </div>
    );
  }

}

export default UserPosts;
