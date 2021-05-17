import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import './main.css'

import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import App from './App.vue'
import Vue from 'vue'
import VueSocketIO from 'vue-socket.io';

Vue.use(new VueSocketIO({
  // debug: true,
  connection: 'http://localhost:3000'
}))
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
