<template>
    <main class="circle">

        <header class="circleInfo">
           <h3 class="circleTitle">{{circle.name}}</h3>
           <p  class="mutualsInfo" v-if="circle.name === 'Mutuals'">This circle is auto-generated from users that you follow who also follow you back.</p>
           <!-- <h4>Circle Members</h4> -->
           <section class="circleMembers">
            <ProfileComponent class="circleMember" v-for="member in circle.members" :user="member" :key="member"/>
           </section>

        </header>

        <button class="editButton" @click="editCircle">Edit Circle</button>
    </main>
</template>

<script>
import ProfileComponent from "@/components/Profile/ProfileComponent.vue"
export default {
    name: "CircleComponent",
    components: {ProfileComponent},
    props: {
        circle: {
            type: Object,
            required: true
        }
    }, 
    methods: {
        editCircle(){
            /**
             * Show the modal to edit the circle
             */
        }
    }
}
</script>

<style scoped>

.circle {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.editButton{
    width: 10%;
    font-size: 16px;
    border: none;
    background-color: #D8D2E1;
    border-radius: 20px;
    padding: 10px;
}

.circleMembers{
    display: flex;
    flex-direction: row;
    margin: 0;
}

.circleMember{
    padding: 5px;
}

.circleTitle{
    padding: 5px;
}

.mutualsInfo{
    color: #575757
}
</style>
