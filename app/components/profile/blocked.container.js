import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { globalStyles } from '../../styles/global';
import * as userActions from '../../actions/user.actions';
import * as navigationActions from '../../actions/navigation.actions';
import * as postActions from '../../actions/post.actions';
import UserList from '../common/userList.component';
import DiscoverUser from '../discoverUser.component';


let styles;

class Blocked extends Component {
  constructor(props, context) {
    super(props, context);
    this.renderRow = this.renderRow.bind(this);
    this.getDataAction = this.getDataAction.bind(this);
    this.renderRight = this.renderRight.bind(this);
    this.getViewData = this.getViewData.bind(this);
  }

  getViewData() {
    let data = [];
    if (this.props.auth.user) {
      data = this.props.auth.user.blocked;
    }
    let loaded = true;
    // let loaded = this.props.auth.user.loaded;
    return {
      data,
      loaded
    };
  }

  getDataAction(view, length) {
    this.props.actions.getBlocked();
  }

  renderRow(rowData) {
    let user = rowData;
    if (!user || !user._id) return null;
    return (<DiscoverUser
      relevance={false}
      user={user}
      {...this.props}
      renderRight={() => this.renderRight(rowData)}
    />);
  }

  renderRight(props) {
    let inner = (
      <TouchableHighlight
        underlayColor={'transparent'}
        style={styles.button}
        onPress={() => this.props.actions.updateBlock(props._id, true)}
      >
        <Text style={[styles.bebas, styles.votes]}>
          Unblock
        </Text>
      </TouchableHighlight>
    );
    return inner;
  }

  render() {
    return (
      <UserList
        getViewData={this.getViewData}
        renderRow={this.renderRow}
        getDataAction={this.getDataAction}
        type={'Blocked Users '}
      />
    );
  }
}

const localStyles = StyleSheet.create({
  votes: {
    alignSelf: 'center',
    fontSize: 17,
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: 'grey',
    borderWidth: StyleSheet.hairlineWidth,
  }
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    users: state.user.users,
    auth: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
        ...userActions,
        ...navigationActions,
      }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Blocked);

