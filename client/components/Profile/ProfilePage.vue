<template>
    <main>
        <header>
            <h1>@{{username}}</h1>
            <p>{{followers}} Followers</p>
            <p>{{following}} Following</p>
            <button v-if="username != $store.state.username && !currentlyFollowing" @click="followUser">
                Follow
            </button>
            <button v-if="username != $store.state.username && currentlyFollowing" @click="unfollowUser">
                Unfollow
            </button>
            <hr/>
            <section class="profile-feed-buttons">
                <button :class="`feed-button ${this.freetDisplay}`" @click="viewFreets">
                Freets
                </button>
                <button :class="`feed-button ${!this.freetDisplay}`" @click="viewReplies">
                Replies
                </button>
            </section>

            <section class="feed"
                v-if="this.freets.length && this.freetDisplay"
            >
                <FreetComponent v-if="username!==$store.state.username" class="freet"
                v-for="freet in this.freets"
                :key="freet.id"
                :freet="freet"
                />
                <FreetComponent v-if="username===$store.state.username" class="freet"
                v-for="freet in $store.state.profileFreets"
                :key="freet.id"
                :freet="freet"
                />
            </section>

            <section
                v-if="!this.freets.length && this.freetDisplay">
                This user hasn't posted any freets yet.
            </section>

            <section class="feed"
                v-if="this.replies.length && !this.freetDisplay"
            >
                <ReplyComponent v-if="username!==$store.state.username"  class="reply"
                v-for="reply in this.replies"
                :key="reply.id"
                :reply="reply"
                />
                <ReplyComponent v-if="username===$store.state.username"  class="reply"
                v-for="reply in $store.state.profileReplies"
                :key="reply.id"
                :reply="reply"
                />
            </section>

            <section
                v-if="!this.replies.length && !this.freetDisplay">
                This user hasn't posted any replies yet.
            </section>
        </header>
    </main>
</template>

<script>
import FreetComponent from '@/components/Freet/FreetComponent.vue';
import ReplyComponent from '@/components/Reply/ReplyComponent.vue';

export default {
    name: "ProfilePage", 
    components: {FreetComponent, ReplyComponent},
    async beforeCreate() {
        const freets = (await fetch(`/api/freets?author=${this.$route.params.username}`).then(async r => r.json()));
        this.freets = freets;
        const replies = (await fetch(`/api/replies?author=${this.$route.params.username}`).then(async r => r.json()));
        this.replies = replies;
        const followers = (await fetch(`/api/users/${this.$route.params.username}/followers`).then(async r=> r.json())).followers;
        this.followers = followers.length;
        this.currentlyFollowing = followers.map(follower => follower.follower).includes(this.$store.state.username);
        const following = (await fetch(`/api/users/${this.$route.params.username}/following`).then(async r=> r.json())).following.length;
        this.following = following;
        this.$store.commit('refreshProfileFreets');
        this.$store.commit('refreshProfileReplies');
    },
    data () {
        return {
            username: this.$route.params.username,
            freetDisplay: true,
            freets: [],
            replies: [],
            currentlyFollowing: false,
            following: 0,
            followers: 0
        }
    },
    methods: {
        viewReplies(){
            /**
             * View the user's replies
             */
            this.freetDisplay = false;
        },
        viewFreets(){
            /**
             * View the user's freets
             */
            this.freetDisplay = true;
        }, 
        followUser(){
            /**
             * Follow the user whose profile you're on
             */
            const params = {
                method: 'POST',
                body: JSON.stringify(),
                callback: () => {
                    this.followers += 1;
                    this.currentlyFollowing = true;
                }
            };
            this.followRequest(params);
        },
        unfollowUser(){
            /**
             * Unfollow the user whose profile you're on
             */
            const params = {
                method: 'DELETE',
                callback: () => {
                    this.followers -= 1;
                    this.currentlyFollowing = false;
                }
            };
            this.followRequest(params);
        },
        async followRequest(params){
            /**
             * Submits a request to the user's followers endpoint.
             * 
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
                const r = await fetch(`/api/users/${this.$route.params.username}/followers`, options);
                if (!r.ok) {
                const res = await r.json();
                throw new Error(res.error);
                }
                params.callback();
            } catch (e) {
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            }
        }
    }
}

</script>


<style scoped>

.freet {
  border: 1px solid #827081;
  padding: 20px;
  position: relative;
  margin: 10px;
  border-radius: 25px;
  width: 90%;
}

button{
  font-size: 16px;
  border: none;
  background-color: #1e88e5;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
}
.reply {
  border: 1px solid #827081;
  padding: 20px;
  position: relative;
  margin: 10px;
  border-radius: 25px;
  width: 90%;
}
.profile-feed-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 2.5%
}

.feed-button{
  width: 100%;
  font-size: 24px;
  border: none;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
}

.true{
  background-color: #1e88e5;
}

.false{
  background-color: #D3D3D3;
}

.feed {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
