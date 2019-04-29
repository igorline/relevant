import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { renderRoutes } from 'react-router-config';

function AdminHeader(props) {
  return (
    <div>
      <div style={{ alignSelf: 'flex-start', margin: 20 }}>
        <Link className={'link'} to="/admin/contract">
          Contract
        </Link>
        <Link className={'link'} to="/admin/topics">
          Topics
        </Link>
        <Link className={'link'} to="/admin/invites">
          Invites
        </Link>
        <Link className={'link'} to="/admin/waitlist">
          Waitlist
        </Link>
        <Link className={'link'} to="/admin/flagged">
          Flagged
        </Link>
        <Link className={'link'} to="/admin/downvotes">
          Downvotes
        </Link>
        <Link className={'link'} to="/admin/email">
          Email
        </Link>
        <Link className={'link'} to="/admin/topPosts">
          Top Posts
        </Link>
        <Link className={'link'} to="/admin/community">
          Community
        </Link>
      </div>
      {renderRoutes(props.route.routes)}
    </div>
  );
}

AdminHeader.propTypes = {
  route: PropTypes.object
};

export default withRouter(AdminHeader);
