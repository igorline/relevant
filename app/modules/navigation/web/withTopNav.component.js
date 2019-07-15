import React from 'react';
import PropTypes from 'prop-types';
import { withRouter, Route, Switch } from 'react-router-dom';
import { View } from 'modules/styled/uni';

const WithTopNav = ({ route }) => (
  <View fdirection="column" display="flex" grow={1}>
    <Switch>
      {route.routes.map((r, index) => (
        <Route
          key={index}
          path={r.path}
          exact={r.exact}
          state={r.state}
          render={props => (r.navbar ? <r.navbar {...props} title={r.title} /> : null)}
        />
      ))}
    </Switch>
    <Switch>
      {route.routes.map((r, index) => (
        <Route key={index} path={r.path} exact={r.exact} component={r.component} />
      ))}
    </Switch>
  </View>
);

WithTopNav.propTypes = {
  route: PropTypes.object
};

export default withRouter(WithTopNav);
