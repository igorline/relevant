import React from 'react';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';
import TopNav from 'modules/navigation/web/topnav.component';
import { withRouter } from 'react-router-dom';
import { View } from 'modules/styled/uni';

const WithTopNav = props => (
  <View fdirection="column" display="flex" grow={1}>
    <TopNav />
    {renderRoutes(props.route.routes)}
  </View>
);

WithTopNav.propTypes = {
  route: PropTypes.object
};

export default withRouter(WithTopNav);
