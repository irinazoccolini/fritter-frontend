<template>
    <vue-modal class="modal" name="create-circle-modal" transitionName="slide-in-top" title="Create New Circle">
        <header>
            <h2 slot="header">Create New Circle</h2>
        </header>
        <hr/>
        <section class="circleName">
            <h3>Circle Name</h3>
            <input @input="editCircleName($event.target.value)">
        </section>
        <hr/>
        <section class="circleMembers">

            <h3>Circle Members</h3>
            <button @click="addMember">Add Member</button>
            <div class="circleMember" v-for="(member,index) in circleMemberUsernames">
                <input
                    placeholder="Username"
                    :value = member
                    @input="editUsername(index, $event.target.value)"
                />
                <button @click="deleteMember(index)">Delete Member</button>
            </div>
            <br/>

        </section>  
        <hr/>
        <br/>
        <button @click="submit">
            Create Circle
        </button>
        <section class="circle-alerts">
            <article
                v-for="(status, alert, index) in alerts"
                :key="index"
                :class="status"
            >
                <p>{{ alert }}</p>
            </article>
        </section>

    </vue-modal>
</template>

<script>

export default {
    name: "CreateCircleModal",
    data() {
        return {
            circleName: "",
            circleMemberUsernames: [],
            alerts: {},
        }
    },
    methods: {
        addMember(){
            /**
             * Add another input field for members
             */
            this.circleMemberUsernames.push("");
        },
        deleteMember(index){
            /**
             * Remove a member input field.
             */
            this.circleMemberUsernames.splice(index, 1);
        },
        editUsername(index, newName){
            /**
             * Edit a username
             */
            this.circleMemberUsernames[index] = newName;
        },
        editCircleName(newName){
            /**
             * Edit the circle's name
             */
            this.circleName = newName;
        },
        async submit(){
            /**
             * Make a POST request to the circles endpoint to create a new circle
             */
            const usernames = this.circleMemberUsernames.join(",");
            if (this.circleName == ""){
                const e = "You must add a circle name to create a circle."
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            } else if (usernames.length === 0){
                const e = "You must add at least 1 username to create a circle."
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
            } else {
                const params = {
                method: 'POST',
                message: 'Successfully created circle!',
                body: JSON.stringify({usernames: usernames, name: this.circleName}),
                callback: () => {
                    this.$set(this.alerts, params.message, 'success');
                    setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                }
                }

                const options = {
                    method: params.method, headers: {'Content-Type': 'application/json'}
                };
                if (params.body) {
                    options.body = params.body;
                }

                try {
                    const r = await fetch(`/api/circles`, options);
                    if (!r.ok) {
                    const res = await r.json();
                    throw new Error(res.error);
                    }

                    this.$store.commit('refreshCircles');

                    params.callback();
                } catch (e) {
                    this.$set(this.alerts, e, 'error');
                    setTimeout(() => this.$delete(this.alerts, e), 3000);
                }

            }

        },
    }
}
</script>

<style scoped>

.circle-alerts {
    z-index: 99;
    bottom: 0;
    top: 100%;
    left: 50%;
    width: 100%;
    text-align: center;
}

.circle-alerts article {
    border-radius: 5px;
    padding: 10px 20px;
    color: #fff;
} 

.circle-alerts p {
    margin: 0;
}

.circle-alerts .error {
    background-color: rgb(166, 23, 33);
}

.circle-alerts .success {
    background-color: rgb(45, 135, 87);
}
</style>