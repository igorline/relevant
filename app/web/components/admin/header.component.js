import React from 'react';
import { Link } from 'react-router';

function AdminHeader(props) {
  return (
    <container>
      <div style={{ alignSelf: 'flex-start', margin: 20 }}>
        <Link className={'link'} to="/admin">Admin</Link>
        <Link className={'link'} to="/admin/topics">Topics</Link>
        <Link className={'link'} to="/admin/invites">Invites</Link>
        <Link className={'link'} to="/admin/waitlist">Waitlist</Link>
        <Link className={'link'} to="/admin/flagged">Flagged</Link>
        <Link className={'link'} to="/admin/downvotes">Downvotes</Link>
        <Link className={'link'} to="/admin/email">Email</Link>
        <Link className={'link'} to="/admin/topPosts">Top Posts</Link>
      </div>
      {props.children}
    </container>
  );
}

export default AdminHeader;