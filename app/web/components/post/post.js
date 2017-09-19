import React, { Component, PropTypes } from 'react';
import AvatarBox from '../common/avatarbox';

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.onClick = this.onClick.bind(this);
  }

  onClick(e) {
    e.preventDefault();
  }


  render() {
    let post = this.props.post;
    let titleEl;
    let buttonEL;

    if (post === 'notFound') {
      return (<div><h1>Post not found</h1></div>);
    }
    if (!post) return null;
    return (
      <div className='post'>
        <a href={post.link}>
          <div class='shadowBox'>
            <span class='image' alt={post.title} style={'background-image':'url('+post.image+')'} />
            <h3>{post.title}</h3>
            <div class='domain'>{post.domain}</div>
          </div>
        </a>
        <AvatarBox user={post.user} date={post.postDate} size='large' />
      </div>
    );
  }
}
export default Post;
