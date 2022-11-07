<template>
    <main>
        <header>
            <h1>Your Circles</h1>      
        </header>
        <button @click="createNewCircle">New Circle</button>
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


export default {
    name: "CirclesPage",
    components: {CircleComponent},
    methods: {
        createNewCircle(){
            /**
             * Navigates to the create new circle form page.
             */
            this.$router.push('/newCircle');
        }
    },
    beforeCreate() {
        this.$store.commit('refreshCircles');
        console.log(this.$store.state.circles);
    }
}
</script>