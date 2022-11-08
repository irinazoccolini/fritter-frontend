<template>
    <vue-modal height="100%" width="100%" size="lg" class="modal" :name='`edit-circle-modal-${circle._id}`' :on-show="showModal" transitionName="slide-in-top" title="Edit Circle">
        <header>
            <h2 slot="header">Edit Circle</h2>
        </header>
        <hr/>
        <section class="circleName">
            <h3>Circle Name</h3>
            <input :value = circleName @input="editCircleName($event.target.value)">
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
                <button class="delete" @click="deleteMember(index)">Delete Member</button>
            </div>
            <br/>

        </section>  
        <hr/>
        <br/>
        <button @click="submit">
            Update Circle
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
    name: "EditCircleModal",
    props: {
        circle: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            initialCircleName: "",
            initialCircleMemberUsernames: [],
            circleName: "",
            circleMemberUsernames: [],
            alerts: {},
        }
    },
    methods: {
        showModal(){
            this.circleName = this.$options.propsData.circle.name;
            this.circleMemberUsernames = [...this.$options.propsData.circle.members];
            this.initialCircleName = this.$options.propsData.circle.name;
            this.initialCircleMemberUsernames = this.$options.propsData.circle.members;
        },
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
        arraysEqual(a, b) {
            if (a.length !== b.length) return false;

            for (var i = 0; i < a.length; ++i) {
                if (a[i] !== b[i]){
                    return false;
                }
            }
            return true;
        },
        async submit(){
            /**
             * Make a PUT or PATCH request to the circles endpoint to edit an existing circle
             */
            let params = {}
            const usernames = this.circleMemberUsernames.join(",");
            if (this.circleName == ""){
                const e = "You must add a circle name to your circle."
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
                return
            } else if (usernames.length === 0){
                const e = "You must add at least 1 user to your circle."
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
                return
            } else if (this.circleName !== this.initialCircleName && !this.arraysEqual(this.circleMemberUsernames,this.initialCircleMemberUsernames)) {
                params = {
                    method: 'PUT',
                    message: 'Successfully updated circle!',
                    body: JSON.stringify({usernames: usernames, name: this.circleName}),
                    callback: () => {
                        this.$set(this.alerts, params.message, 'success');
                        setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                    }
                }
            } else if (this.circleName !== this.initialCircleName){
                params = {
                    method: 'PATCH',
                    message: 'Successfully updated circle!',
                    body: JSON.stringify({name: this.circleName}),
                    callback: () => {
                        this.$set(this.alerts, params.message, 'success');
                        setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                    }
                }
            } else if (!this.arraysEqual(this.circleMemberUsernames,this.initialCircleMemberUsernames)) {
                params = {
                    method: 'PATCH',
                    message: 'Successfully updated circle!',
                    body: JSON.stringify({usernames: usernames}),
                    callback: () => {
                        this.$set(this.alerts, params.message, 'success');
                        setTimeout(() => this.$delete(this.alerts, params.message), 3000);
                    }
                }
            } else {
                const e = "Your circle settings have not changed."
                this.$set(this.alerts, e, 'error');
                setTimeout(() => this.$delete(this.alerts, e), 3000);
                return
            }

            const options = {
                    method: params.method, headers: {'Content-Type': 'application/json'}
                };
            if (params.body) {
                options.body = params.body;
            }

            try {
                const r = await fetch(`/api/circles/${this.circle._id}`, options);
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

.delete{
    background-color: #830700;
}

input{
    font-size: 16px;
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

</style>