<!-- Page for account sign-in and registration -->
<!-- User should be NOT authenticated in order to see this page -->

<template>
  <main>
    <section>
      <header>
        <h2>New to Fritter?</h2>
      </header>
      <RegisterForm class="form"/>
    </section>
    <section>
      <header>
        <h2>Have an account?</h2>
      </header>
      <LoginForm class="form"/>
    </section>
  </main>
</template>

<script>
import RegisterForm from '@/components/Login/RegisterForm.vue';
import LoginForm from '@/components/Login/LoginForm.vue';

export default {
  name: 'LoginPage',
  components: {
    RegisterForm,
    LoginForm
  }
};
</script>

<style scoped>
.form {
  border: 1px solid #111;
  padding: 20px;
  position: relative;
  background-color: #fbfaff;
  border-radius: 20px;
}

.button{
  font-size: 16px;
  border: none;
  background-color: #1e88e5;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
  cursor:pointer;

}

</style>