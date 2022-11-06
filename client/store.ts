import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import router from "./router";
Vue.use(Vuex);

/**
 * Storage for data that needs to be accessed from various compoentns.
 */
const store = new Vuex.Store({
  state: {
    filter: null, // Username to filter shown freets by (null = show all)
    freets: [], // All freets created in the app
    username: null, // Username of the logged in user
    alerts: {}, // global success/error messages encountered during submissions to non-visible forms
    userId: null, // User id of the logged in user
    currentParentItem: null, // The current item (freet or reply) that is being viewed 
    currentParentType: null, // The current item type (freet or reply)
    replies: [], // The current replies to the reply or freet that 
    followingFreets: []
  },
  mutations: {
    alert(state, payload) {
      /**
       * Add a new message to the global alerts.
       */
      Vue.set(state.alerts, payload.message, payload.status);
      setTimeout(() => {
        Vue.delete(state.alerts, payload.message);
      }, 3000);
    },
    setUsername(state, username) {
      /**
       * Update the stored username to the specified one.
       * @param username - new username to set
       */
      state.username = username;
    },
    setUserId(state, userId) {
      /**
       * Update the stored userId to the specified one.
       * @param userId - new userId to set
       */
      state.userId = userId;
    },
    updateFilter(state, filter) {
      /**
       * Update the stored freets filter to the specified one.
       * @param filter - Username of the user to fitler freets by
       */
      state.filter = filter;
    },
    updateFreets(state, freets) {
      /**
       * Update the stored freets to the provided freets.
       * @param freets - Freets to store
       */
      state.freets = freets;
    },
    updateCurrentParentItem(state, item){
      /**
       * Update the current item to the provided item.
       * @param item - Freet or reply to store
       */
      state.currentParentItem = item;
    },
    updateCurrentParentType(state, type){
      /**
       * Update the current type to the provided type.
       * @param type - Type ('freet' or 'reply') to store
       */
      state.currentParentType = type;
    },
    async refreshFollowingFreets(state) {
      /**
       * Request the server for the currently available freets the 
       * users that the current user is following
       */
      const url = `api/freets/followingFeed`;
      const res = await fetch(url).then(async r => r.json());
      state.followingFreets = res.followingFeed;
    },
    async refreshCurrentParentItem(state, itemId){
      /**
       * 
       */
      if (state.currentParentType == "freet") {
        const url = `/api/freets/${itemId}`;
        const res = await fetch(url).then(async r => r.json());
        state.currentParentItem = res.freet;
      } else if (state.currentParentType == "reply") {
        const url = `/api/replies/${itemId}`;
        const res = await fetch(url).then(async r => r.json());
        state.currentParentItem = res.reply;
      }
    },
    async refreshReplies(state, parentInfo){
      /**
       * Request the server for the currently available replies.
       */
       if (parentInfo[0] == "freet"){
        const url = `/api/freets/${parentInfo[1]}/replies`;
        const res = await fetch(url).then(async r => r.json());
        state.replies = res;
      } else if (parentInfo[0] == "reply"){
        const url = `/api/replies/${parentInfo[1]}/replies`;
        const res = await fetch(url).then(async r => r.json());
        state.replies = res;
      }
    },
    async refreshFreets(state) {
      /**
       * Request the server for the currently available freets.
       */
      const url = state.filter ? `/api/users/${state.filter}/freets` : '/api/freets';
      const res = await fetch(url).then(async r => r.json());
      state.freets = res;
    },
  },
  // Store data across page refreshes, only discard on browser close
  plugins: [createPersistedState()]
});

export default store;
