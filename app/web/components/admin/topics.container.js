import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as tagActions from '../../../actions/tag.actions';

// import styled from 'styled-components';

let styles;

class TopicsAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: '',
      emoji: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateTag = this.updateTag.bind(this);
  }

  componentDidMount() {
    this.props.actions.getParentTags();
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  updateTag(e, tag) {
    tag[e.target.name] = e.target.value;
    this.props.actions.updateParentTag(tag);
  }

  archiveTag(tag) {
    tag.active = !tag.active;
    this.props.actions.updateTag(tag);
  }

  saveTag(tag) {
    tag.main = tag.main.split(', ').filter(t => t !== '');
    tag.children = tag.children.split(', ').filter(t => t !== '');
    this.props.actions.updateTag(tag);
  }

  newTag() {
    let tag = {
      _id: this.state.topic + '_category_tag',
      categoryName: this.state.topic,
      category: true,
      emoji: this.state.emoji
    };
    this.props.actions.createTag(tag);
  }

  render() {
    let tags = this.props.tags.parentTags || [];
    tags = [
      ...tags.filter(tag => tag.active),
      ...tags.filter(tag => !tag.active),
    ];

    return (
      <div style={styles.topicsContainerStyle}>
        <input
          type={'text'}
          name={'topic'}
          placeholder={'topic'}
          value={this.state.topic}
          onChange={this.handleChange}
        />
        <input
          type={'text'}
          name={'emoji'}
          placeholder={'emoji'}
          value={this.state.emoji}
          onChange={this.handleChange}
        />
        <button onClick={() => this.newTag()} >Add new category</button>
        {tags.map(tag => {
          if (!tag.newId) tag.newId = tag._id;
          if (tag.main && typeof tag.main !== 'string') {
            tag.main = tag.main.join(', ');
          }
          if (tag.children && typeof tag.children !== 'string') {
            tag.children = tag.children.join(', ');
          }
          return (
            <div style={tag.active ? null : { textDecoration: 'line-through' }} key={tag._id}>
              {tag.emoji}
              &nbsp;
              <input
                type={'text'}
                name={'categoryName'}
                placeholder={'topic'}
                value={tag.categoryName}
                onChange={e => this.updateTag(e, tag)}
              />
              <input
                type={'text'}
                name={'newId'}
                placeholder={'_id'}
                value={tag.newId}
                onChange={e => this.updateTag(e, tag)}
              />
              <input
                type={'text'}
                name={'main'}
                placeholder={'main'}
                value={tag.main}
                onChange={e => this.updateTag(e, tag)}
              />
              <input
                type={'text'}
                name={'children'}
                placeholder={'children'}
                value={tag.children}
                onChange={e => this.updateTag(e, tag)}
              />
              &nbsp;
              {tag.count}
              &nbsp;
              <button onClick={() => this.archiveTag(tag)}>remove</button>
              <button onClick={() => this.saveTag(tag)}>save</button>
            </div>
          );
        })}
      </div>
    );
  }
}

// const TopicsContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   alignItems: center;
// `;

styles = {
  topicsContainerStyle: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};


export default connect(
  state => ({
    auth: state.auth,
    tags: state.tags
  }),
  dispatch => ({
    actions: bindActionCreators(tagActions, dispatch)
  })
)(TopicsAdmin);
