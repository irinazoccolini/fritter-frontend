<template>
    <main>
        <header>
            <h1>Your Circles</h1>      
        </header>
        <button @click="createNewCircle">New Circle</button>
        <CreateCircleModal/>
        <section class="existingCircles" >
            <CircleComponent v-for="circle in $store.state.circles"
                :key=" circle._id"
                :circle="circle"
            />
        
        </section>
        
    </main>

</template>


<script>
 
import CircleComponent from "@/components/Circle/CircleComponent.vue"
import CreateCircleModal from "@/components/Circle/CreateCircleModal.vue"

export default {
    name: "CirclesPage",
    components: {CircleComponent, CreateCircleModal},
    methods: {
        createNewCircle(){
            /**
             * Navigates to the create new circle form page.
             */
            // this.$router.push('/newCircle');
            console.log("hello")
            this.$modals.show("create-circle-modal")
        }
    },
    beforeCreate() {
        this.$store.commit('refreshCircles');
        console.log(this.$store.state.circles);
    }
}
</script>