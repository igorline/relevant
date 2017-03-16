import React, {Component} from 'react';
import {reduxForm} from 'redux-form';
import { Link } from 'react-router';

class NewLinkForm extends Component {
  render() {
    const {fields: {link, body, tags}, handleSubmit} = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <h3>New Link Post</h3>
        <div>
          <label>URL </label>
          <input type="text" placeholder="URL" {...link}/>
          <div className="help-block" style={{display: 'inline', color: 'red'}}>
            {link.touched ? link.error : ''}
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
        {this.props.linkError && <div>{this.props.linkError}</div>}
      </form>
    );
  }
}

function validate(values) {
  const errors = {};
  if (!values.link || values.link.trim() === '') {
    errors.link = 'Enter a URL';
  }
  if (!values.body || values.body.trim() === '') {
    errors.body = 'Enter some text in the body';
  }

  return errors;
}

NewLinkForm = reduxForm({
  form: 'newLink',
  fields: ['link', 'body', 'tags'],
  validate
})(NewLinkForm);

export default NewLinkForm;
