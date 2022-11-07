<!-- Reusable component representing a single reply and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
    <article
      class="reply"
    >
      <header>
        <ProfileComponent class="profile" v-if="!reply.anonymous"
          :user="reply.author"
        />
        <h3 class="author" v-else>
          @{{ reply.author }}
        </h3>


        <div
          v-if="$store.state.userId === reply.authorId"
          class="author-actions"
        >
          <button
            v-if="editing"
            @click="submitEdit"
          >
            ✅ Save changes
          </button>
          <button
            v-if="editing"
            @click="stopEditing"
          >
            🚫 Discard changes
          </button>
          <button
            v-if="!editing"
            @click="startEditing"
          >
            ✏️ Edit
          </button>
          <button @click="deleteReply">
            🗑️ Delete
          </button>
        </div>

      </header>
      <textarea
        v-if="editing"
        class="content"
        :value="draft"
        @input="draft = $event.target.value"
      />
      <p
        v-else
        class="content"
      >
        {{ reply.content }}
      </p>
      <p class="info">
        Posted at {{ reply.dateModified }}
        <i v-if="!(reply.dateModified === reply.dateCreated)">(edited)</i>
      </p>
      <hr/>
      <div class="general-actions">
        <button @click="viewReplies">
            View Replies
        </button>
        <button v-if="this.liked" @click="unlikeReply">
          ❤️ {{this.likeCount}}
        </button>
        <button v-else @click="likeReply">
          🤍 {{this.likeCount}}
        </button>
        <button @click="reportReply">
          Report
        </button>
      </div>

      <section class="alerts">
        <article
          v-for="(status, alert, index) in alerts"
          :key="index"
          :class="status"
        >
          <p>{{ alert }}</p>
        </article>
      </section>
    </article>
  </template>
  
  <script>
  import ProfileComponent from '@/components/Profile/ProfileComponent.vue';

  export default {
    
    name: 'ReplyComponent',
    components: {ProfileComponent},
    props: {
      // Data from the stored reply
      reply: {
        type: Object,
        required: true
      }
    },
    async created() {
      const replyLikes = (await fetch(`/api/replies/${this.$options.propsData.reply._id}/likes`).then(async r => r.json())).likes;
      const replyLikers = replyLikes.map(like => like.likerUsername);
      this.likeCount = replyLikers.length;
      this.liked = replyLikers.includes(this.$store.state.username);
    },
    data() {
      return {
        editing: false, // Whether or not this reply is in edit mode
        draft: this.reply.content, // Potentially-new content for this reply
        alerts: {}, // Displays success/error messages encountered during reply modification
        likeCount: 0, // How many likes this reply has 
        liked: false, // Whether the current user has liked the reply
      };
    },
    methods: {
      startEditing() {
        /**
         * Enables edit mode on this reply.
         */
        this.editing = true; // Keeps track of if a reply is being edited
        this.draft = this.reply.content; // The content of our current "draft" while being edited
      },
      stopEditing() {
        /**
         * Disables edit mode on this reply.
         */
        this.editing = false;
        this.draft = this.reply.content;
      },
      deleteReply() {
        /**
         * Deletes this reply.
         */
        const params = {
          method: 'DELETE',
          callback: () => {
            this.$store.commit('alert', {
              message: 'Successfully deleted reply!', status: 'success'
            });
          }
        };
        this.request(params);
      },
      submitEdit() {
        /**
         * Updates reply to have the submitted draft content.
         */
        if (this.reply.content === this.draft) {
          const error = 'Error: Edited reply content should be different than current reply content.';
          this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
          setTimeout(() => this.$delete(this.alerts, error), 3000);
          return;
        }
  
        const params = {
          method: 'PATCH',
          message: 'Successfully edited reply!',
          body: JSON.stringify({content: this.draft}),
          callback: () => {
            this.$set(this.alerts, params.message, 'success');
            setTimeout(() => this.$delete(this.alerts, params.message), 3000);
          }
        };
        this.request(params);
      },
      likeReply() {
        /**
         * Likes the reply.
         */
        const params = {
          method: 'POST',
          body: JSON.stringify(),
          callback: () => {
            this.liked = true;
            this.likeCount += 1;
          }
        };
        this.likeRequest(params);
      },
      unlikeReply() {
        /**
         * Unlikes the reply.
         */
        const params = {
          method: 'DELETE',
          callback: () => {
            this.liked = false;
            this.likeCount -= 1;
          }
        };
        this.likeRequest(params);
      },
      viewReplies() {
        /**
         * Changes the router to view the replies.
         */
        this.$router.push(`/reply/${this.reply._id}/replies`);
      },
      async reportReply(){
        /**
         * Posts a request to the repys's report endpoint
         */
        const params = {
          method: 'POST',
          message: 'Successfully reported reply!',
          callback: () => {
            this.$set(this.alerts, params.message, 'success');
            setTimeout(() => this.$delete(this.alerts, params.message), 3000);
          }
        };
        const options = {
          method: params.method, headers: {'Content-Type': 'application/json'}
        };
        options.body = JSON.stringify();
        try {
          const r = await fetch(`/api/replies/${this.reply._id}/reports`, options);
          if (!r.ok) {
            const res = await r.json();
            throw new Error(res.error);
          }
          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      },
      async likeRequest(params) {
        /**
         * Submits a request to the reply's like endpoint
         * @param params - Options for the request
         * @param params.body - Body for the request, if it exists
         * @param params.callback - Function to run if the request succeeds
         */
        const options = {
          method: params.method, headers: {'Content-Type': 'application/json'}
        };
        if (params.body) {
          options.body = params.body;
        }

        try {
          const r = await fetch(`/api/replies/${this.reply._id}/likes`, options);
          if (!r.ok) {
            const res = await r.json();
            throw new Error(res.error);
          }
          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      },
      async request(params) {
        /**
         * Submits a request to the reply's endpoint
         * @param params - Options for the request
         * @param params.body - Body for the request, if it exists
         * @param params.callback - Function to run if the the request succeeds
         */
        const options = {
          method: params.method, headers: {'Content-Type': 'application/json'}
        };
        if (params.body) {
          options.body = params.body;
        }
  
        try {
          const r = await fetch(`/api/replies/${this.reply._id}`, options);
          if (!r.ok) {
            const res = await r.json();
            throw new Error(res.error);
          }
  
          this.editing = false;
          this.$store.commit('refreshReplies', [this.$route.params.parentItemType, this.$route.params.parentItemId]);
          params.callback();
        } catch (e) {
          this.$set(this.alerts, e, 'error');
          setTimeout(() => this.$delete(this.alerts, e), 3000);
        }
      }
    }
  };
  </script>
  
<style scoped>
  .reply {
      border: 1px solid #111;
      padding: 20px;
      position: relative;
      background-color: #fbfaff;
  }

header{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.author-actions{
  padding: 5px;
}

.profile {
  padding: 0;
}

.general-actions{
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.likes {
  display: flex;
  flex-direction: row;
}

button{
  font-size: 16px;
  border: none;
  background-color: #1e88e5;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
}

.info {
  font-size: 14px;
  color: #575757
}
</style>
  