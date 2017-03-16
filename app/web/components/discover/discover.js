import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import * as DiscoverActions from '../../actions/discover'
var Infinite = require('react-infinite');

class Discover extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInfiniteLoading: false,
      disableLoad: false
    };
  }

  loadMorePosts() {
    var self = this;

    if (self.state.isInfiniteLoading) return;

    this.setState({
      isInfiniteLoading: true
    });

    var newPosts = this.props.getNewPosts(5, this.props.discover.selectedPosts.length);

    setTimeout(function() {
      self.setState({isInfiniteLoading: false})
    }, 500);
  }

  render() {
    var posts = this.props.discover.selectedPosts;
    if (posts.length !== 0) {
      return (
        <div>
          <Infinite elementHeight = {250}
                    infiniteLoadBeginEdgeOffset = {0}
                    onInfiniteLoad = {this.loadMorePosts.bind(this)}
                    isInfiniteLoading = {this.state.isInfiniteLoading}
                    useWindowAsScrollContainer
                    >

            {posts.map(function(post, i){
              return (
                <div style={{height: 250 + 'px'}} key={i}>
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
    } else {
      return ( null );
    }

  }
}

Discover.defaultProps = {
    selectedPosts: []
}

export default Discover