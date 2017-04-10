import React, { Component, PropTypes } from 'react';
import Tag from './tag';

class Tags extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let tags = this.props.post.tags;
    if (tags.length === 0) return null;
  	return (
      <div>
        Tags:
          {tags.map(tag => (
            <div key={tag}>
              <Tag data={tag} />
            </div>
          ))}
      </div>
  	);
  }
}

export default Tags;