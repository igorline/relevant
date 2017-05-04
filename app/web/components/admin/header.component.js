import React from 'react';
import { Link } from 'react-router';

let styles;

function AdminHeader(props) {
  return (
    <container className="main">
      <container style={{ alignSelf: 'flex-start' }}>
        <Link className={'link'} to="/admin">Admin</Link>
        <Link className={'link'} to="/admin/topics">Topics</Link>
        <Link className={'link'} to="/admin/invites">Invites</Link>
        <Link className={'link'} to="/admin/waitlist">Waitlist</Link>
        <Link className={'link'} to="/admin/flagged">Flagged</Link>
        <Link className={'link'} to="/admin/downvotes">Downvotes</Link>
        {props.children}
      </container>
    </container>
  );
}

export default AdminHeader;