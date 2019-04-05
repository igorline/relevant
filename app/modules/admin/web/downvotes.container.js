import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as adminActions from 'modules/admin/admin.actions';
import InfScroll from 'modules/listview/web/infScroll.component';
import { getDayMonthYearTimestamp } from 'app/utils/numbers';

const PAGE_SIZE = 40;

class Downvotes extends Component {
  static propTypes = {
    admin: PropTypes.object,
    actions: PropTypes.object
  };

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
        <div>{getDayMonthYearTimestamp(downvote.createdAt)}</div>
        <div>
          {downvote.post
            ? getDayMonthYearTimestamp(downvote.post.createdAt)
            : '[deleted]'}
        </div>
      </div>
    );
  }

  load(page) {
    const l = this.props.admin.downvotes.length;
    this.hasMore = (page - 1) * PAGE_SIZE <= l;
    if (this.hasMore) {
      this.props.actions.getDownvotes(l, PAGE_SIZE);
    }
  }

  render() {
    const downvoteEl = this.props.admin.downvotes.map(d => this.renderDownvote(d));

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
