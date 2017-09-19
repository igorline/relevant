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

    if (post === 'notFound') {
      return (<div><h1>Post not found</h1></div>);
    }
    if (!post) return null;

    const postImage = {
      backgroundImage: 'url(' + post.image + ')'
    };

    console.log(post);

    return (
      <div className='post'>
        <a href={post.link}>
          <div className='shadowBox'>
            <span className='image' alt={post.title} style={postImage} />
            <div className='headline'>
              <h3 className='bebasRegular'>{post.title}</h3>
              <div className='domain'>{post.domain}</div>
            </div>
          </div>
        </a>
        <AvatarBox user={post.user} date={post.postDate} size='large' />
        <div className='body'>

        </div>
      </div>
    );
  }
}
export default Post;
