import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Avatar from 'modules/user/web/avatar.component';
import ShadowButton from 'modules/ui/web/ShadowButton';
import * as authActions from 'modules/auth/auth.actions';
import * as notifActions from 'modules/activity/activity.actions';
import DiscoverTabs from 'modules/discover/web/discoverTabs.component';
import Activity from 'modules/activity/web/activity.container';
import RequestInvite from 'modules/web_splash/requestInvite.component';
import { matchPath } from 'react-router';

// const

const ContentHeader = (props) => {
  <nav>
    hello
  </nav>
};

export default ContentHeader;
