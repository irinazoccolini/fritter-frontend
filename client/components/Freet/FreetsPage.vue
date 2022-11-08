<!-- Default page that also displays freets -->

<template>
  <main>
    <section v-if="$store.state.username">
      <header>
        <h2>Welcome @{{ $store.state.username }}</h2>
      </header>
      <CreateFreetForm/>
    </section>
    <section v-else>
      <header>
        <h2>Welcome to Fritter!</h2>
      </header>
      <article>
        <h3>
          <router-link to="/login">
            Sign in
          </router-link>
          to create, edit, and delete freets.
        </h3>
      </article>
    </section>

    <section v-if="$store.state.username">
      <section class="feed-buttons">
        <button :class="`feed-button ${this.timeline}`" @click="switchToTimeline">
          Timeline
        </button>
        <button :class="`feed-button ${!this.timeline}`" @click="switchToFollowing">
          Following
        </button>
      </section>

      <header v-if="this.timeline">
        <div class="left">
          <h2>
            Viewing all freets
            <span v-if="$store.state.filter">
              by @{{ $store.state.filter }}
            </span>
          </h2>
        </div>
        <div class="right">
          <GetFreetsForm
            ref="getFreetsForm"
            value="author"
            placeholder="🔍 Filter by author (optional)"
            button="🔄 Get freets"
          />
        </div>
      </header>
      <header v-else>
      </header>
      <section class="freets"
        v-if="$store.state.freets.length && this.timeline"
      >
        <FreetComponent class="freet"
          v-for="freet in $store.state.freets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <section class="freets"
        v-if="$store.state.followingFreets.length && !this.timeline"
      >
        <FreetComponent
          v-for="freet in $store.state.followingFreets"
          :key="freet.id"
          :freet="freet"
        />
      </section>
      <article
        v-if="!$store.state.followingFreets.length && !this.timeline"
      >
        <h3>No freets found. Follow users to see their freets here!</h3>
      </article>
      <article
        v-if="!$store.state.freets.length && this.timeline"
      >
        <h3>No freets found.</h3>
      </article>
    </section>
  </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import CreateFreetForm from '@/components/Freet/CreateFreetForm.vue';
import GetFreetsForm from '@/components/Freet/GetFreetsForm.vue';

export default {
  name: 'FreetPage',
  components: {FreetComponent, GetFreetsForm, CreateFreetForm},
  mounted() {
    this.$refs.getFreetsForm.submit();
    this.$store.commit("refreshFollowingFreets");
  },
  data() {
    return {
      timeline: true
    }
  },
  methods: {
    switchToFollowing(){
    /**
     * Switch the feed view to the following feed
     */
    this.timeline = false;
  },
  switchToTimeline(){
    /**
     * Switch the feed view to the timeline feed.
     */
    this.timeline = true;
  }
  }

};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}

header, header > * {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

button {
    margin-right: 10px;
    cursor:pointer;
}

section .scrollbox {
  flex: 1 0 50vh;
  padding: 3%;
  overflow-y: scroll;
}

.feed-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: 50px;
}

.freets {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.freet {
  border: 1px solid #827081;
  padding: 20px;
  position: relative;
  margin: 10px;
  border-radius: 25px;
  width: 90%;
}

.feed-button{
  width: 100%;
  font-size: 24px;
  border: none;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
  cursor:pointer;
}

.true{
  background-color: #1e88e5;
}

.false{
  background-color: #D3D3D3;
}
</style>
