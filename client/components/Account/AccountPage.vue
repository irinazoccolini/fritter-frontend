<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section>
      <header>
        <h2>Account settings for @{{ $store.state.username }}</h2>
      </header>
      <ChangeUsernameForm class="form" />
      <ChangePasswordForm class="form"/>
    </section>
    <section>
      <header>
        <h2>Account management</h2>
      </header>
      <LogoutForm class="form"/>
      <DeleteAccountForm class="form"/>
    </section>
  </main>
</template>

<script>
import ChangeUsernameForm from '@/components/Account/ChangeUsernameForm.vue';
import ChangePasswordForm from '@/components/Account/ChangePasswordForm.vue';
import DeleteAccountForm from '@/components/Account/DeleteAccountForm.vue';
import LogoutForm from '@/components/Account/LogoutForm.vue';

export default {
  name: 'AccountPage',
  components: {
    ChangeUsernameForm,
    ChangePasswordForm,
    DeleteAccountForm,
    LogoutForm
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
}

</style>