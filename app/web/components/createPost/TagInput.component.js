import React, { Component } from 'react';

if (process.env.BROWSER === true) {
  require('./selectTags.css');
}

if (process.env.BROWSER === true) {
  // require('./divider.css');
}


export default class TagInput extends Component {
  state = {
    input: ''
  }

  render() {
    let props = this.props;
    const selectedTags = props.selectedTags;
    const tagEls = selectedTags.map((tag, i) => {
      // tag = tag.replace(/\s/g, '');
      return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <span
          key={i}
          className={'selected'}
          role="checkbox"
          aria-checked
          onClick={() => props.deselectTag(tag)}
        >
          #{tag}
        </span>
      );
    });
    let input = this.state.input || '';

    return (
      <div>
        Tags: <span className="selectTags">{tagEls}</span>
        <div className='tagInput'>
          <input
            placeholder={this.props.placeholderText}
            value={this.state.input}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                let tag = e.target.value.trim().replace('#', '');
                props.selectTag(tag);
                return this.setState({ input: '' });
              }
              return;
            }}
            onBlur={e => {
              let tags = e.target.value.split(/\,|#/);
              tags = tags.map(t => t.trim().replace('#', ''))
              .filter(t => t.length);
              if (tags.length) {
                props.selectTag(tags);
              }
              return this.setState({ input: '' });
            }}
            onChange={e => {
              let tags = e.target.value;
              let tagsArr = tags.split(/\,|#/);
              tagsArr = tagsArr.map(t => t.trim())
              .filter(t => t.length);
              if (tagsArr.length > 1) {
                props.selectTag(tagsArr[0]);
                return this.setState({ input: tagsArr[1] });
              }
              return this.setState({ input: tags });
            }}
          />
        </div>
      </div>
    );
  }
}
