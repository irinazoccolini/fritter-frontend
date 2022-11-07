<template>
    <main>
        <header>
            <h1>Your Circles</h1>      
        </header>
        <section class="createCircle">
            <button class="createCircleButton" @click="createNewCircle">New Circle</button>
        </section>

        <CreateCircleModal/>
        <section class="existingCircles" >
            <CircleComponent class="circle" v-for="circle in $store.state.circles"
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
            this.$modals.show("create-circle-modal")
        }
    },
    beforeCreate() {
        this.$store.commit('refreshCircles');
    }
}
</script>

<style scoped>
.circle{
    border: 1px solid #827081;
    padding: 20px;
    position: relative;
    margin: 10px;
    border-radius: 25px;
}

.createCircleButton{
    width: 50%;
    height: 50px;
    font-size: 20px;
    border: none;
    background-color: #D8D2E1;
    border-radius: 20px;
}

.createCircle{
    display: flex;
    justify-content: center;
}
</style>
