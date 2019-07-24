import Vue from 'vue'
import App from './App.vue'
import Notifications from 'vue-notification'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

Vue.use(Buefy)
Vue.use(Notifications)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
