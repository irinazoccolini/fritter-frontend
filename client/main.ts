import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import VueModal from "vue2-modal";
 
Vue.use(VueModal);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
