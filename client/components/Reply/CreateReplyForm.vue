<!-- Form for creating replies (block style) -->

<script>
import BlockForm from '@/components/common/BlockForm.vue';

export default {
  name: 'CreateReplyForm',
  mixins: [BlockForm],
  data() {
    let parentFreet = "";
    let parentReply = "";
    let url = "";

    if (this.$route.params.parentItemType == "freet") {
        parentFreet = this.$route.params.parentItemId;
        url = `/api/freets/${this.$route.params.parentItemId}/replies`;
    } else if (this.$route.params.parentItemType == "reply") {
        parentReply = this.$route.params.parentItemId;
        url = `/api/replies/${this.$route.params.parentItemId}/replies`;
    }


    return {
      url: url,
      method: 'POST',
      hasBody: true,
      fields: [
        {id: 'content', label: 'Content', value: ''},
        {id: 'anonymous', label: 'Anonymous', value: ''}
      ],
      knownFields: [
        {id: 'parentFreet', value: parentFreet},
        {id: 'parentReply', value: parentReply}
      ],
      title: 'Create a reply',
      refreshReplies: true,
      callback: () => {
        const message = 'Successfully created a reply!';
        this.$set(this.alerts, message, 'success');
        setTimeout(() => this.$delete(this.alerts, message), 3000);
      }
    };
  }
};
</script>