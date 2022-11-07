<!-- Form for deleting account (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'DeleteAccountForm',
  mixins: [BlockForm],
  data() {
    return {
      url: '/api/users',
      method: 'DELETE',
      setUser: true,
      title: 'Delete account',
      fields: [],
      knownFields: [],
      content: 'Deleting your account is permanent and irreversible. Proceed only if you understand these consequences.',
      callback: () => {
        this.$router.push({name: 'Home'}); // Goes to Home page after deleting account
        this.$store.commit('alert', {
          message: 'Your account has been deleted!', status: 'success'
        });
      }
    };
  }
};
</script>

<style scoped>
button{
  font-size: 16px;
  border: none;
  background-color: #830700;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
  width: 100%
}
</style>