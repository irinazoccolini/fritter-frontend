import Vue from 'vue';
import VueRouter from 'vue-router';
import FreetsPage from './components/Freet/FreetsPage.vue';
import AccountPage from './components/Account/AccountPage.vue';
import LoginPage from './components/Login/LoginPage.vue';
import NotFound from './NotFound.vue';
import ReplyPage from './components/Reply/ReplyPage.vue';
import ProfilePage from './components/Profile/ProfilePage.vue';
import CirclesPage from './components/Circle/CirclesPage.vue';
Vue.use(VueRouter);

const routes = [
  {path: '/', name: 'Home', component: FreetsPage},
  {path: '/account', name: 'Account', component: AccountPage},
  {path: '/login', name: 'Login', component: LoginPage},
  {path: '*', name: 'Not Found', component: NotFound},
  {path: '/:parentItemType/:parentItemId/replies', name: 'Replies', component: ReplyPage},
  {path: '/profile/:username', name: 'Profile', component: ProfilePage},
  {path: '/circles', name: 'Circles', component: CirclesPage},
];

const router = new VueRouter({routes});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from, next) => {
  if (router.app.$store) {
    if (to.name === 'Login' && router.app.$store.state.username) {
      next({name: 'Account'}); // Go to Account page if user navigates to Login and are signed in
      return;
    }

    if (to.name === 'Account' && !router.app.$store.state.username) {
      next({name: 'Login'}); // Go to Login page if user navigates to Account and are not signed in
      return;
    }

    if (to.name === 'Replies' && !router.app.$store.state.username) {
      next({name: 'Login'}); // Go to Login page if user navigates to Replies and are not signed in
      return;
    }

    if (to.name === 'Circles' && !router.app.$store.state.username) {
      next({name: 'Login'}); // Go to Login page if user navigates to Circles and are not signed in
      return;
    }

    if (to.name === 'Profile' && !router.app.$store.state.username) {
      next({name: 'Login'}); // Go to Login page if user navigates to Profile and are not signed in
      return;
    }
  }

  next();
});

export default router;
