import loadable from '@loadable/component';

import App from './app';
import NotFound from './404';
import withAuth from './auth';

const DiscoverContainer = loadable(() => import('modules/discover/web/discover.container'));
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
const CommuntiyAdmin = loadable(() => import('modules/admin/web/communityAdmin.component'));
const ProfileContainer = loadable(() => import('modules/profile/web/profile.container'));
const SplashContainer = loadable(() => import('modules/web_splash/splash.container'));
const MainNav = loadable(() => import('modules/navigation/web/mainNav.component'));

const PostContainer = loadable(() => import(
  'modules/post/web/post.container'
));
const Wallet = loadable(() => import(
  'modules/wallet/web/wallet.container'
));
const AdminWallet = loadable(() => import(
  'modules/admin/web/admin.main.component',
));
const Auth = loadable(() => import(
  'modules/auth/web/auth.container'
));
const CreatePostContainer = loadable(() => import(
  'modules/createPost/web/createPost.container'
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
      {
        path: '/',
        component: SplashContainer,
        exact: true
      },

      {
        path: '/',
        component: MainNav,
        routes: [
          // USER
          { path: '/user/login', component: Auth, exact: true },
          { path: '/user/signup', component: Auth, exact: true },
          { path: '/user/wallet', component: Wallet, exact: true },
          { path: '/user/profile/:id', component: ProfileContainer, exact: true },
          { path: '/user/forgot', component: Auth, exact: true },
          // WARNING THESE ROUTES MUST MACH MOBILE APP!
          { path: '/user/resetPassword/:token', component: Auth, exact: true },
          { path: '/user/confirm/:user/:code', component: Auth, exact: true },
          { path: '/user/invite/:code', component: Invite, exact: true },
          { path: '/:community/post/:id', component: PostContainer, exact: true },

          // INFO
          { path: '/info', routes: [{ path: 'faq', component: Faq, exact: true }] },

          // DISCOVER
          // TODO - parent route doesn't have access to child params
          { path: '/:community/', component: DiscoverContainer, exact: true },
          { path: '/:community/:sort/:tag?', component: DiscoverContainer, exact: true },
          {
            path: '/:community/post/new',
            exact: true,
            component: withAuth(CreatePostContainer)
            // component: CreatePostContainer
          },
        ]
      },

      {
        path: '/admin',
        component: withAuth(AdminHeader, 'admin'),
        indexRoute: { component: AdminWallet },
        routes: [
          { path: '/user/flagged', component: Flagged },
          { path: '/user/waitlist', component: Waitlist },
          { path: '/user/downvotes', component: Downvotes },
          { path: '/user/topics', component: TopicsAdmin },
          { path: '/user/invites', component: Invites },
          { path: '/user/email', component: Email },
          { path: '/user/topPosts', component: TopPosts },
          { path: '/user/community', component: CommuntiyAdmin }
        ]
      },
      { path: '*', component: NotFound },
    ]
  }
];
export default routes;
