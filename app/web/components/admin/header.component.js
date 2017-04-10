import React from 'react';
import { Link } from 'react-router';

let styles;

function AdminHeader(props) {
  return (
    <container style={{ alignSelf: 'flex-start' }}>
      <Link className={'link'} to="/admin">Admin</Link>
      <Link className={'link'} to="/admin/topics">Topics</Link>
      <Link className={'link'} to="/admin/invites">Invites</Link>
      <Link className={'link'} to="/admin/flagged">Flagged</Link>
      {props.children}
    </container>
  );
}

export default AdminHeader;