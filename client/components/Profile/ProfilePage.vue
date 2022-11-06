<template>
    <main>
        <header>
            <h1>@{{username}}'s profile</h1>
            <p>0 Followers</p>
            <p>0 Following</p>
            <button v-if="username != $store.state.username">
                Follow
            </button>
            <hr/>
            <section class="profile-feed-buttons">
                <button @click="viewFreets">
                Freets
                </button>
                <button @click="viewReplies">
                Replies
                </button>
            </section>

            <section
                v-if="this.freets.length && this.freetDisplay"
            >
                <FreetComponent
                v-for="freet in this.freets"
                :key="freet.id"
                :freet="freet"
                />
            </section>

            <section
                v-if="!this.freets.length && this.freetDisplay">
                This user hasn't posted any freets yet.
            </section>

            <section
                v-if="this.replies.length && !this.freetDisplay"
            >
                <ReplyComponent
                v-for="reply in this.replies"
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
        console.log(this.$route.params.username)
        const freets = (await fetch(`/api/freets?author=${this.$route.params.username}`).then(async r => r.json()));
        this.freets = freets;
        const replies = (await fetch(`/api/replies?author=${this.$route.params.username}`).then(async r => r.json()));
        this.replies = replies;
    },
    data () {
        return {
            username: this.$route.params.username,
            freetDisplay: true,
            freets: [],
            replies: []
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
        }
    }
}

</script>


<style scoped>
.profile-feed-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 2.5%
}
</style>
