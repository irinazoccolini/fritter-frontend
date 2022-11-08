<template>
  <div id="app">
    <header>
      <NavBar />
    </header>
    <router-view :key="$route.path"/>
  </div>
</template>

<script>
import NavBar from '@/components/common/NavBar.vue';

export default {
  name: 'App',
  components: {NavBar},
  beforeCreate() {
    // Sync stored username to current session
    fetch('/api/users/session', {
      credentials: 'same-origin' // Sends express-session credentials with request
    }).then(res => res.json()).then(res => {
      const user = res.user;
      this.$store.commit('setUsername', user ? user.username : null);
      this.$store.commit('setUserId', user ? user._id : null);
    });

    // Clear alerts on page refresh
    this.$store.state.alerts = {};
  }
};
</script>

<style>

@import url('https://fonts.googleapis.com/css2?family=Quicksand&display=swap');

* {
  box-sizing: border-box;
}

body {
  height: 100vh;
  flex-direction: column;
  display: flex;
  padding: 0;
  margin: 0;
  font-size: 1.2em;
  background-color: #e3f2fd;
  font-family: 'Quicksand', sans-serif;
  padding-top: 80px; 
}

main {
  padding: 0 5em 5em;
}

.alerts {
    position: absolute;
    z-index: 99;
    bottom: 0;
    top: 100%;
    left: 50%;
    transform: translate(-50%, 10%);
    width: 100%;
    text-align: center;
}

.alerts article {
    border-radius: 5px;
    padding: 10px 20px;
    color: #fff;
}

.alerts p {
    margin: 0;
}

.alerts .error {
    background-color: rgb(166, 23, 33);
}

.alerts .success {
    background-color: rgb(45, 135, 87);
}

h1{
  font-family: 'Quicksand', sans-serif;
}

p{
  font-family: 'Quicksand', sans-serif;
}

h2{
  font-family: 'Quicksand', sans-serif;
}

h3{
  font-family: 'Quicksand', sans-serif;
}

button {
  font-family: 'Quicksand', sans-serif;
  background-color: #1e88e5;
  color: white;
  cursor:pointer;
}

</style>
