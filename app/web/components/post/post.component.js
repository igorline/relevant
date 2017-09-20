import React, { Component, PropTypes } from 'react';
import AvatarBox from '../common/avatarbox.component';
import PostButtons from './postbuttons.component';

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
    const tags = post.tags.map( (tag) => {
      return (
        <a href={'/tag/' + tag} key={tag}>#{tag}</a>
      )
    })

    return (
      <div className='post'>
        <a href={post.link} target='_blank'>
          <div className='shadowBox'>
            <span className='image' alt={post.title} style={postImage} />
            <div>
              <h3 className='headline bebasRegular'>{post.title}</h3>
              <div className='domain'>{post.domain}</div>
            </div>
          </div>
        </a>
        <AvatarBox user={post.user} date={post.postDate} size='large' />
        <div className='body'>
          <span>{post.description}</span>
          {tags}
        </div>
        <PostButtons post={post} />
      </div>
    );
  }
}
export default Post;
