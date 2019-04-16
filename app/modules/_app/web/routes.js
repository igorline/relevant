import React from 'react';
import loadable from '@loadable/component';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import App from './app';
import NotFound from './404';
import withAuth from './withAuth';

const DiscoverContainer = loadable(() =>
  import('modules/discover/web/discover.container')
);
const TopicsAdmin = loadable(() => import('modules/admin/web/topics.container'));
const Invites = loadable(() => import('modules/admin/web/invites.container'));
const Invite = loadable(() => import('modules/admin/web/invite.component'));
const Faq = loadable(() => import('modules/admin/web/faq.component'));
const AdminHeader = loadable(() => import('modules/admin/web/header.component'));
const Flagged = loadable(() => import('modules/admin/web/flagged.component'));
const Waitlist = loadable(() => import('modules/admin/web/waitlist.component'));
const Downvotes = loadable(() => import('modules/admin/web/downvotes.container'));
const Email = loadable(() => import('modules/admin/web/email.component'));
const TopPosts = loadable(() => import('modules/admin/web/topPosts.component'));
const CommunityAdminForm = loadable(() =>
  import('modules/admin/web/communityAdminForm.component')
);
const CommunityAdminList = loadable(() =>
  import('modules/admin/web/communityAdminList.component')
);

const CommunityList = loadable(() => import('modules/community/communityList.component'));
const ProfileContainer = loadable(() => import('modules/profile/web/profile.container'));
const ActivityContainer = loadable(() => import('modules/activity/activity.container'));
// const SplashContainer = loadable(() => import('modules/web_splash/splash.container'));
const WithSideNav = loadable(() =>
  import('modules/navigation/web/withSideNav.component')
);
const WithTopNav = loadable(() => import('modules/navigation/web/withTopNav.component'));

const PostContainer = loadable(() => import('modules/post/web/singlePost.container'));
const Wallet = loadable(() => import('modules/wallet/web/wallet.container'));
const AdminWallet = loadable(() => import('modules/admin/web/admin.main.component'));
const Auth = loadable(() => import('modules/auth/web/auth.container'));
const CreatePostContainer = loadable(() =>
  import('modules/createPost/createPost.container')
);

const MyRedirect = withRouter(props => (
  <Redirect {...props} to={props.match.url + props.to + props.location.search} />
));

// community slug blacklist
// user
// admin
// info
// api
// img
// fonts
// files
// home

const routes = [
  {
    path: '/',
    component: App,
    routes: [
      // {
      //   path: '/',
      //   component: SplashContainer,
      //   exact: true
      // },
      {
        path: '/',
        component: WithSideNav,
        routes: [
          {
            path: '/admin',
            component: withAuth(AdminHeader, 'admin'),
            indexRoute: { component: AdminWallet },
            routes: [
              { path: '/admin/flagged', component: Flagged },
              { path: '/admin/waitlist', component: Waitlist },
              { path: '/admin/downvotes', component: Downvotes },
              { path: '/admin/topics', component: TopicsAdmin },
              { path: '/admin/invites', component: Invites },
              { path: '/admin/email', component: Email },
              { path: '/admin/topPosts', component: TopPosts },
              { path: '/admin/community', component: CommunityAdminList, exact: true },
              {
                path: '/admin/community/new',
                component: CommunityAdminForm,
                exact: true
              },
              {
                path: '/admin/community/:slug',
                component: CommunityAdminForm,
                exact: true
              }
            ]
          },

          // INFO
          { path: '/info/faq', component: Faq, exact: true },

          {
            path: '/',
            component: WithTopNav,
            routes: [
              // WALLET
              { path: '/user/wallet', component: Wallet, exact: true },
              // USER
              {
                path:
                  '/user/:modal(login|confirmEmail|confirm|signup|resetPassword|forgot)',
                component: Auth,
                exact: true
              },
              {
                path: '/user/:modal(resetPassword)/:token',
                component: Auth,
                exact: true
              },
              { path: '/user/:modal(confirm)/:user/:code', component: Auth, exact: true },
              { path: '/user/profile/:id', component: ProfileContainer, exact: true },
              {
                path: '/user/profile/:id/settings',
                component: ProfileContainer,
                exact: true
              },
              { path: '/user/activity', component: ActivityContainer, exact: true },
              // WARNING THESE ROUTES MUST MACH MOBILE APP!
              // '/user/resetPassword/:token'
              // '/user/resetPassword'
              // '/user/confirm/:user/:code'

              // TODO: use this route
              // { path: '/user/confirmEmail', component: Auth, exact: true },
              { path: '/user/invite/:code', component: Invite, exact: true },
              { path: '/community/all', component: CommunityList, exact: true },
              { path: '/:community/post/:id', component: PostContainer, exact: true },
              {
                path: '/:community/post/:id/:commentId',
                component: PostContainer,
                exact: true
              },

              // DISCOVER
              // TODO - parent route doesn't have access to child params
              {
                path: '/:community/',
                component: props => <MyRedirect {...props} to={'/new'} />,
                exact: true
              },
              // {
              //   path: '/:community/invite/:handle',
              //   component: (props) => <MyRedirect {...props} to={'/new'} />,
              //   exact: true
              // },
              {
                path: '/:community/:sort/invite/slava',
                component: DiscoverContainer,
                exact: true
              },
              {
                path: '/:community/:sort/:tag?',
                component: DiscoverContainer,
                exact: true
              },
              {
                path: '/:community/post/new',
                exact: true,
                component: withAuth(CreatePostContainer)
                // component: CreatePostContainer
              }
            ]
          }
        ]
      },
      { path: '*', component: NotFound }
    ]
  }
];
export default routes;
