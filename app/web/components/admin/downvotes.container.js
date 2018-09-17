import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import { connect } from 'react-redux';
import * as adminActions from '../../../actions/admin.actions';
import InfScroll from '../common/infScroll.component';

let styles;
const PAGE_SIZE = 40;

class Downvotes extends Component {
  constructor(props) {
    super(props);
    this.renderDownvote = this.renderDownvote.bind(this);
    this.load = this.load.bind(this);
    this.hasMore = true;
  }

  renderDownvote(downvote) {
    return (
      <div className={'downvoteList'} key={downvote._id}>
        <div className={'dUser'}>{downvote.investor}</div>
        <div>- {downvote.author}</div>
        <div>{moment(downvote.createdAt).format('MMMM Do, h:mm a')}</div>
        <div>{downvote.post ? moment(downvote.post.createdAt).format('MMMM Do, h:mm a') : '[deleted]'}</div>
      </div>
    )
  }

  load(page) {
    let l = this.props.admin.downvotes.length;
    this.hasMore = (page - 1) * PAGE_SIZE <= l;
    if (this.hasMore) {
      this.props.actions.getDownvotes(l, PAGE_SIZE);
    }
  }

  render() {
    let downvoteEl = this.props.admin.downvotes
    .map(d => this.renderDownvote(d));

    return (
      <div>
        <h2>Downvotes</h2>
        <InfScroll
          data={this.props.admin.downvotes}
          className={'adminContainer'}
          loadMore={this.load}
          hasMore={this.hasMore}
        >
          {downvoteEl}
        </InfScroll>
      </div>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    admin: state.admin
  }),
  dispatch => ({
    actions: bindActionCreators(adminActions, dispatch)
  })
)(Downvotes);

