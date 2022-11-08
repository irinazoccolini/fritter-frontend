<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
  <article
    class="freet"
  >
    <header>
      <div class="upper-section">


        <ProfileComponent class="profile" v-if="!freet.anonymous"
          :user="freet.author"
        />
        <h3 class="author" v-else>
          @{{ freet.author }}
        </h3>
        <div
          v-if="$store.state.userId === freet.authorId"
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
          <button class="delete" @click="deleteFreet">
            🗑️ Delete
          </button>
        </div>
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
      {{ freet.content }}
    </p>
    <p class="info">
      Posted at {{ freet.dateModified }}
      <i v-if="!(freet.dateModified === freet.dateCreated)">(edited)</i>
    </p>
    <i class='info' v-if="freet.private">(This freet is private -- only visible by you)</i>
    <hr/>

    <div class="general-actions">
      <button @click="viewReplies">
        View Replies
      </button>
      <button v-if="this.liked" @click="unlikeFreet">
        ❤️ {{this.likeCount}}
      </button>
      <button v-else @click="likeFreet">
        🤍 {{this.likeCount}}
      </button>
      <button @click="reportFreet">
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
  name: 'FreetComponent',
  components: {ProfileComponent},
  props: {
    // Data from the stored freet
    freet: {
      type: Object,
      required: true
    }
  },
  async created() {
    const freetLikes = (await fetch(`/api/freets/${this.$options.propsData.freet._id}/likes`).then(async r => r.json())).likes;
    const freetLikers = freetLikes.map(like => like.likerUsername);
    this.likeCount = freetLikers.length;
    this.liked = freetLikers.includes(this.$store.state.username);
  },
  data() {
    return {
      editing: false, // Whether or not this freet is in edit mode
      draft: this.freet.content, // Potentially-new content for this freet
      alerts: {}, // Displays success/error messages encountered during freet modification
      likeCount: 0, // How many likes the freet has
      liked: false, // Whether the current user has liked the freet
    }; 
  },
  methods: {
    startEditing() {
      /**
       * Enables edit mode on this freet.
       */
      this.editing = true; // Keeps track of if a freet is being edited
      this.draft = this.freet.content; // The content of our current "draft" while being edited
    },
    stopEditing() {
      /**
       * Disables edit mode on this freet.
       */
      this.editing = false;
      this.draft = this.freet.content;
    },
    likeFreet() {
      /**
       * Likes the freet.
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
    unlikeFreet() {
      /**
       * Unlikes the freet.
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
    deleteFreet() {
      /**
       * Deletes this freet.
       */
      const params = {
        method: 'DELETE',
        callback: () => {
          this.$store.commit('alert', {
            message: 'Successfully deleted freet!', status: 'success'
          });
        }
      };
      this.request(params);
    },
    submitEdit() {
      /**
       * Updates freet to have the submitted draft content.
       */
      if (this.freet.content === this.draft) {
        const error = 'Error: Edited freet content should be different than current freet content.';
        this.$set(this.alerts, error, 'error'); // Set an alert to be the error text, timeout of 3000 ms
        setTimeout(() => this.$delete(this.alerts, error), 3000);
        return;
      }

      const params = {
        method: 'PATCH',
        message: 'Successfully edited freet!',
        body: JSON.stringify({content: this.draft}),
        callback: () => {
          this.$set(this.alerts, params.message, 'success');
          setTimeout(() => this.$delete(this.alerts, params.message), 3000);
        }
      };
      this.request(params);
    },
    viewReplies() {
      /**
       * Changes the router to the reply page.
       */
      this.$router.push(`/freet/${this.freet._id}/replies`);
    },
    async likeRequest(params) {
      /**
       * Submits a request to the freet's like endpoint
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
        const r = await fetch(`/api/freets/${this.freet._id}/likes`, options);
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
    async reportFreet(){
      /**
       * Posts a request to the freet's report endpoint
       */
       const params = {
        method: 'POST',
        message: 'Successfully reported freet!',
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
        const r = await fetch(`/api/freets/${this.freet._id}/reports`, options);
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
       * Submits a request to the freet's endpoint
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
        const r = await fetch(`/api/freets/${this.freet._id}`, options);
        if (!r.ok) {
          const res = await r.json();
          throw new Error(res.error);
        }

        this.editing = false;
        this.$store.commit('refreshFreets');
        this.$store.commit('refreshProfileFreets');

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

.upper-section{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.freet {
  border: 1px solid #111;
  padding: 20px;
  position: relative;
  background-color: #fbfaff;
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

.content {
  width: 100%;
}
.delete{
    background-color: #830700;
}
</style>
