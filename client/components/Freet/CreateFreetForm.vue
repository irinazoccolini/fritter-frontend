<template>
    <form @submit.prevent="submit">
        <h3>Create a freet <span class="freet-length-info">({{this.content.length}}/140 chars)</span></h3>
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
            <div class="dropdown">
                <p>Post to:</p>
                <select @input="updateCircle($event.target.value)">
                    <option :value="undefined">Everyone</option>
                    <option :value ='circle._id' v-for="circle in $store.state.circles">{{circle.name}}</option>
                </select>
            </div>

        </div>
        <button
            type="submit"
            >
            Create freet
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
    name:"CreateFreetForm",
    data(){
        return {
            circle: undefined,
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
        updateCircle(newCircle){
            if (newCircle == "Everyone"){
                this.circle = undefined;
            } else {
                this.circle = newCircle;
            }
        },
        updateContent(newContent){
            this.content = newContent;
        },
        async submit(){
            /**
             * Posts a new freet.
             */

            const params = {
                method: 'POST',
                message: 'Successfully created freet!',
                body: JSON.stringify({content: this.content, circleId: this.circle, anonymous: this.anonymous}),
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
                const r = await fetch(`/api/freets/`, options);
                if (!r.ok) {
                const res = await r.json();
                throw new Error(res.error);
                }
                this.$store.commit("refreshFreets");
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
}

.content{
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.freet-length-info{
  font-size: 16px;
  color: #575757
}
</style>