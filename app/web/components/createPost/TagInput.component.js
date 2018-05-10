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
            placeholder={!selectedTags.length ? 'Please add at least one tag' : ''}
            value={this.state.input}
            onKeyDown={e => {
              if (e.keyCode === 13) {
                props.selectTag(e.target.value);
                return this.setState({ input: '' });
              }
              return;
            }}
            onChange={e => {
              let tags = e.target.value;
              let tagsArr = tags.split(',');
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
