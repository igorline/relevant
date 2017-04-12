import React, { Component, PropTypes } from 'react';
import Invest from '../invest/invest';
// import Tags from '../tag/tag.container';

let styles;

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInvestForm: false
    };
    this.onClick = this.onClick.bind(this);
    this.deletePost = this.deletePost.bind(this);
  }

  onClick(e) {
    e.preventDefault();
    this.setState({ showInvestForm: !this.state.showInvestForm });
  }

  deletePost() {
    this.props.actions.deletePost(this.props.post);
  }

  render() {
    let post = this.props.post;
    let titleEl;
    let buttonEL;
    let deleteEl;

    if (post === 'notFound') {
      return (<div><h1>Post not found</h1></div>);
    }
    if (!post) return null;

    if (post.user._id === this.props.auth.user._id ||
      this.props.auth.user.role === 'admin') {
      deleteEl = (
        <button
          style={{ ...styles.postButtons, float: 'right' }}
          onClick={this.deletePost}
        >
          Delete
        </button>
      );
    }

    titleEl = (
      <h3>
        <a href={post.link}>{post.title}</a>
        <br />
        by <a href={'/profile/' + post.user}>{post.embeddedUser.name}</a>
        &nbsp;
        &nbsp;
      </h3>
    );

    buttonEL = (
      <div style={styles.postButtons}>
        <button
          onClick={this.onClick}
          style={styles.investButton}
        >
          💰 Invest
        </button>
        {this.state.showInvestForm && <Invest {...this.props} />}
        {deleteEl}
      </div>
    );

    // let tagsEl = <Tags {...this.props} />;

    return (
      <div style={{ ...styles.postBox, borderColor: this.props.flagged ? 'red' : 'grey' }}>
        <img alt={post.title} src={post.image} width="100%" />
        {titleEl}
        <span>{this.props.flagged}</span>
        <p>{post.body}</p>
        <div>Relevance: {Math.round(post.relevance * 100) / 100} Value: {post.value}</div>
        {buttonEL}
      </div>
    );
  }
}

styles = {
  investButton: {
    fontSize: '16px',
    lineHeight: '20px',
  },
  postBox: {
    margin: 'auto',
    padding: '10px',
    maxWidth: '400px',
    border: '1px solid grey',
  },
  postButtons: {
    margin: '20px 10px'
  }
};

export default Post;
