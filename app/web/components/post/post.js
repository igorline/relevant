import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import * as PostActions from '../../actions/post'
import Invest from '../invest/invest'
import Tags from '../tag/tag.container'
import Comments from '../comment/comment.container'

class Post extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showInvestForm: false
    }
  }

  onClick(e){
    e.preventDefault();
    this.setState({showInvestForm: !this.state.showInvestForm})
  }

  deletePost() {
    this.props.deletePost(this.props.auth.token, this.props.post.selectedPost._id)
  }

  render() {
    var post = this.props.post.selectedPost

    if (post) {
      if (post == 'notFound') {
        return (
          <div>
            <h1>Post not found</h1>
          </div>
        )
      }

      // Otherwise we found post
      return (
        <div>
          <h1><a href={post.link}>{post.title}</a>
              &nbsp;
              (Relevance: {Math.round(post.relevance * 100) / 100} Value: {post.value})
              by <a href={'/profile/' + post.user._id}>{post.user.name}</a> 
              &nbsp;
              &nbsp;
              {post.user._id === this.props.auth.user._id && <a onClick={this.deletePost.bind(this)} href='#'>[delete]</a>} 
          </h1>
          <img src={post.image} width="15%"></img>
          <p>{post.body}</p>
          <br/>
          <a onClick={this.onClick.bind(this)} href='#'style={{fontSize: 1.5 + 'em'}}>💰 Invest</a>
          {this.state.showInvestForm && <Invest { ...this.props} />}
          <br/>
          <br/>
          <br/>
          <Tags { ...this.props } />
          <Comments { ...this.props } />
       </div>
      )

    } else {
      // Still loading response
      return (
        null
      )
    }
  }
}

export default Post
