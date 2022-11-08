<template>
    <vue-modal transitionName="slide-in-top" title="Delete Circle" :name='`delete-circle-modal-${circle._id}`'>
        <h1>Delete Circle</h1>
        <p>Are you sure you want to delete this circle? Once it's deleted, all freets posted to it will become private. Only you will be
            able to see them. Users who were in the circle will no longer have access to them.
        </p>
        <button @click="deleteCircle">Yes, delete</button>
        <button @click="closeModal">No, go back</button>
    </vue-modal>
</template>


<script>

export default {
    name: "DeleteCircleModal",
    props: {
        circle: {
            type: Object,
            required: true
        }
    },
    methods: {
        closeModal(){
            this.$modals.hide(`delete-circle-modal-${this.circle._id}`);
        },
        async deleteCircle(){
            /**
             * Deletes the circle
             */
             const params = {
                method: 'DELETE',
                callback: () => {
                    this.$store.commit('alert', {
                        message: 'Successfully deleted circle!', status: 'success'
                    });
                }
            };

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
        }
    }
}
</script>

<style scoped>
    button{
    width: 100%;
    font-size: 16px;
    border: none;
    background-color: #1e88e5;
    margin: 5px;
    border-radius: 20px;
    padding: 10px;
}
</style>