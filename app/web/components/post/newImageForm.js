import React, {Component} from 'react';
import {reduxForm} from 'redux-form';
import { Link } from 'react-router';

class NewImageForm extends Component {
  render() {
    const {fields: {image, title, body, tags}, handleSubmit} = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <h3>New Image Post</h3>
        <div>
          <label>Image </label>
          <input type="file" accept="image/*" {...image} value={null}/>
        </div>

        <div>
          <label>Title </label>
          <input type="text" placeholder="Title" {...title}/>
          <div className="help-block" style={{display: 'inline', color: 'red'}}>
            {title.touched ? title.error : ''}
          </div>
        </div>

        <div>
          <label>Body </label>
          <input type="text" placeholder="Body" {...body}/>
          <div className="help-block" style={{display: 'inline', color: 'red'}}>
            {body.touched ? body.error : ''}
          </div>
        </div>
        <br/>
        <div>
          <label>Tags (separated by commas)</label><br/>
          <input type="text" placeholder="Tags" {...tags}/>
        </div>
        <button type="submit" disabled={this.props.isPosting} >Post</button>
        {this.props.imageError && <div>{this.props.imageError}</div>}
      </form>
    );
  }
}

function validate(values) {
  const errors = {};

  if (!values.title || values.title.trim() === '') {
    errors.title = 'Enter a title';
  }
  if (!values.body || values.body.trim() === '') {
    errors.body = 'Enter some text in the body';
  }

  return errors;
}

NewImageForm = reduxForm({
  form: 'newImage',
  fields: ['image', 'title', 'body', 'tags'],
  validate
})(NewImageForm);

export default NewImageForm;
