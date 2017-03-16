import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as DiscoverActions from '../../actions/discover'
import Discover from './discover';

class DiscoverContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if (this.props.params.tag) {
      this.props.getPostsByTag(this.props.params.tag);
    } else {
      this.props.getNewPosts(5, 0);
    }
  }

  render() {
    return (
      <div>
        <Discover { ...this.props} />
      </div>
    );
  }
}


export default connect(
  state => {
    return {
      discover: state.discover
    }
  },
  dispatch => {
    return Object.assign({}, { dispatch },  bindActionCreators(DiscoverActions, dispatch))
})(DiscoverContainer)
