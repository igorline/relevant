import React from 'react';
import loadable from '@loadable/component';
import { Redirect } from 'react-router';
import { withRouter } from 'react-router-dom';

import App from './app'; // eslint-disable-line
import NotFound from './404';
import withAuth from './withAuth';
// import CommunityRedirect from './communityRedirect';

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
const Contract = loadable(() => import('modules/admin/web/contractParams.container'));
const About = loadable(() => import('modules/web_splash/about.component'));
const TopNav = loadable(() => import('modules/navigation/web/topnav.component'));

const CommunityAdminForm = loadable(() =>
  import('modules/admin/web/communityAdminForm.component')
);
const CommunityAdminList = loadable(() =>
  import('modules/admin/web/communityAdminList.component')
);
const Styles = loadable(() => import('modules/ui/styles.component'));

const CommunityList = loadable(() => import('modules/community/communityList.container'));
const ProfileContainer = loadable(() => import('modules/profile/web/profile.container'));
const ActivityContainer = loadable(() => import('modules/activity/activity.container'));
// const SplashContainer = loadable(() => import('modules/web_splash/splash.container'));
const WithSideNav = loadable(() =>
  import('modules/navigation/web/withSideNav.component')
);
const WithTopNav = loadable(() => import('modules/navigation/web/withTopNav.component'));

const PostContainer = loadable(() => import('modules/post/web/singlePost.container'));
const ChatContainer = loadable(() => import('modules/chat/web/chat.container'));
const Wallet = loadable(() => import('modules/wallet/web/wallet.container'));
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
        component: About,
        exact: true
      },
      { path: '/about', component: About, exact: true },
      {
        path: '/',
        component: WithSideNav,
        routes: [
          {
            path: '/admin',
            component: withAuth(AdminHeader, 'admin'),
            indexRoute: { component: Contract },
            routes: [
              { path: '/admin/contract', component: Contract },
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
          { path: '/info/styles', component: Styles, exact: true },

          {
            path: '/:community/channel/:id',
            component: ChatContainer,
            exact: true
          },

          {
            path: '/',
            component: WithTopNav,
            routes: [
              // WALLET
              {
                path: '/user/wallet',
                component: Wallet,
                navbar: TopNav,
                title: 'Wallet',
                exact: true
              },
              // USER
              {
                path: '/user/:modal(resetPassword)/:token',
                component: Auth,
                navbar: TopNav,
                exact: true
              },
              {
                path:
                  '/user/:modal(login|confirmEmail|confirm|signup|resetPassword|forgot|setHandle)',
                component: Auth,
                navbar: TopNav,
                exact: true
              },
              {
                path: '/user/:modal(confirm)/:user/:code',
                component: Auth,
                navbar: TopNav,
                exact: true
              },
              {
                path: '/user/profile/:id',
                component: ProfileContainer,
                navbar: TopNav,
                exact: true
              },
              {
                path: '/user/profile/:id/settings',
                component: ProfileContainer,
                exact: true,
                navbar: TopNav
              },
              {
                path: '/user/activity',
                component: ActivityContainer,
                exact: true,
                navbar: TopNav
              },
              // WARNING THESE ROUTES MUST MACH MOBILE APP!
              // '/user/resetPassword/:token'
              // '/user/resetPassword'
              // '/user/confirm/:user/:code'

              // TODO: use this route
              // { path: '/user/confirmEmail', component: Auth, exact: true },
              {
                path: '/user/invite/:code',
                component: Invite,
                exact: true,
                navbar: TopNav
              },
              {
                path: '/communities',
                component: CommunityList,
                exact: true,
                navbar: TopNav,
                title: 'Communities'
              },
              // {
              //   path: '/community/all',
              //   component: CommunityList,
              //   exact: true,
              //   navbar: TopNav,
              //   title: 'Communities'
              // },
              {
                path: '/:community/post/:id',
                component: PostContainer,
                exact: true,
                navbar: TopNav
              },
              {
                path: '/:community/post/:id/:commentId',
                component: PostContainer,
                exact: true,
                navbar: TopNav
              },

              // DISCOVER
              // TODO - parent route doesn't have access to child params
              {
                path: '/:community/',
                component: props => <MyRedirect {...props} to={'/new'} />,
                exact: true,
                navbar: TopNav
              },
              // {
              //   path: '/:community/invite/:handle',
              //   component: (props) => <MyRedirect {...props} to={'/new'} />,
              //   exact: true
              // },
              {
                path: '/:community/:sort/invite/slava',
                component: DiscoverContainer,
                exact: true,
                navbar: TopNav
              },
              {
                path: '/:community/:sort/:tag?',
                component: DiscoverContainer,
                exact: true,
                navbar: TopNav
              },
              {
                path: '/:community/post/new',
                exact: true,
                component: withAuth(CreatePostContainer),
                navbar: TopNav
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
