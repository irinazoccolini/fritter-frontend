
<template>
    <main>
        <section v-if="!$store.state.username">
            <article>
                <h3>
                    <router-link to="/login">
                        Sign in
                    </router-link>
                    to view, create, edit, and delete freets and replies.
                </h3>
            </article>
        </section>
        <section v-else>
            <h3>Viewing replies for:</h3>
            <ParentItemComponent
             :key = '$store.state.currentParentItem._id'
             :item="$store.state.currentParentItem"
            />
            <CreateReplyForm />
            <section
                v-if="$store.state.replies && $store.state.replies.length"
            >
            <h3>
                Replies:
            </h3>
            <ReplyComponent
                v-for="reply in $store.state.replies"
                :key="reply._id"
                :reply="reply"
                />
            
            </section>
            <article
                v-else
            >
            <h3>No replies found.</h3>
            </article>
        </section>
    </main>
</template>

<script>
import ReplyComponent from '@/components/Reply/ReplyComponent.vue';
import ParentItemComponent from '@/components/Reply/ParentItemComponent.vue';
import CreateReplyForm from '@/components/Reply/CreateReplyForm.vue';
export default {
    name: "ReplyPage",
    components: {ParentItemComponent, ReplyComponent, CreateReplyForm},
    async beforeCreate() {
        console.log("in before create");
        this.$store.commit('updateCurrentParentType', this.$route.params.parentItemType);
        this.$store.commit('refreshCurrentParentItem', this.$route.params.parentItemId);
        this.$store.commit(`refreshReplies`, [this.$route.params.parentItemType, this.$route.params.parentItemId]);
    }
}
</script>