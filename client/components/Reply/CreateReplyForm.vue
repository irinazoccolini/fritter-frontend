<template>
    <form @submit.prevent="submit">
        <h3>Create a reply <span class="reply-length-info">({{this.content.length}}/140 chars)</span></h3>
        <article>
            <div class="content">
                <textarea @input="updateContent($event.target.value)" rows="5" placeholder="Content">

                </textarea>
            </div>
        </article>
        <div class="dropdowns">
            <div class="dropdown">
                <p>Post as:</p>
                <select name="anonymous" @input="updateAnonymous($event.target.value)">
                    <option>Non-Anonymous</option>
                    <option>Anonymous</option>
                </select>
            </div>
        </div>
        <button
            type="submit"
            >
            Create reply
        </button>
        <section class="alerts">
            <article
                v-for="(status, alert, index) in alerts"
                :key="index"
                :class="status"
            >
                <p>{{ alert }}</p>
            </article>
        </section>
    </form>
</template>

<script>
export default {
    name:"CreateReplyForm",
    data(){
        return {
            anonymous: false,
            content: "",
            alerts: {}
        }
    },
    methods: {
        updateAnonymous(newSetting){
            if (newSetting == "Anonymous"){
                this.anonymous = true;
            } else {
                this.anonymous = false;
            }
        },
        updateContent(newContent){
            this.content = newContent;
        },
        async submit(){
            /**
             * Posts a new reply.
             */
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


            const params = {
                method: 'POST',
                message: 'Successfully created reply!',
                body: JSON.stringify({content: this.content, anonymous: this.anonymous, parentFreet: parentFreet, parentReply:parentReply}),
                callback: () => {
                this.$set(this.alerts, params.message, 'success');
                setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                }
            };

            const options = {
                method: params.method, headers: {'Content-Type': 'application/json'}
            };
            if (params.body) {
                options.body = params.body;
            }
            try {
                const r = await fetch(url, options);
                if (!r.ok) {
                const res = await r.json();
                throw new Error(res.error);
                }
                this.$store.commit('refreshReplies', [this.$route.params.parentItemType, this.$route.params.parentItemId]);
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
form {
  border: 1px solid #111;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 14px;
  position: relative;
  border-radius: 10px;
  background-color: #fbfaff;
}

textarea{
    width: 100%;
    font-family: 'Quicksand', sans-serif;
    font-size: 16px;
    margin: 0px 10px;
}

select {
    font-family: 'Quicksand', sans-serif;
    font-size: 16px;
    margin: 10px;
}

form > article p {
  margin: 0;
}

form h3,
form > * {
  margin: 0.3em 0;
}

form h3 {
  margin-top: 0;
}

.dropdowns{
    display: flex;
    flex-direction: row;
    justify-content: right;
}
.dropdown{
    display: flex;
    flex-direction: row;
    padding: 10px;
}

button{
  font-size: 16px;
  border: none;
  background-color: #1e88e5;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
  cursor:pointer;
}

.content{
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.reply-length-info{
  font-size: 16px;
  color: #575757
}
</style>