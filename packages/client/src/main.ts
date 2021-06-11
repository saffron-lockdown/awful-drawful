import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './main.css';

import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';

import App from './App.vue';
import Vue from 'vue';
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client';

const socket = io();

console.log({ socket });

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);
Vue.use(VueSocketIOExt, socket);

new Vue({
  render: (h) => h(App),
}).$mount('#app');
