<template>
  <div id="app">
    <notifications group="foo" />
    <Billable />
  </div>
</template>

<script>
import Billable from './components/Billable.vue'

export default {
  name: 'app',
  components: {
    Billable
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
form{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 40%;
    margin: 0 auto;
    background-color: rgba(67,91,113,.9);
    color: #fff;
    font-family: calibri;
    font-size: 1.2rem;
    border-radius: 10px;
    line-height: 1.428571429;
    padding: 2%
    /*float: left;*/
  }
  h2{
    text-align: left;
  }
</style>
