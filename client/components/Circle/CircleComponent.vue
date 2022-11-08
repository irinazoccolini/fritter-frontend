<template>
    <main class="circle">

        <header class="circleInfo">
           <h2 class="circleTitle">{{circle.name}}</h2>
           <p  class="mutualsInfo" v-if="circle.name === 'Mutuals'">This circle is auto-generated from users that you follow who also follow you back.</p>
           <!-- <h4>Circle Members</h4> -->
           <section class="circleMembers">
            <ProfileComponent class="circleMember" v-for="member in circle.members" :user="member" :key="member"/>
           </section>

        </header>
        <section class="circleButtons" v-if="circle.name !== 'Mutuals'">
            <button @click="editCircle(circle._id)">✏️ Edit</button>
            <EditCircleModal :circle='circle'/>
            <button class="delete" @click="deleteCircle(circle._id)">🗑️ Delete</button>
            <DeleteCircleModal :circle="circle"/>
        </section>

    </main>
</template>

<script>
import ProfileComponent from "@/components/Profile/ProfileComponent.vue";
import EditCircleModal from '@/components/Circle/EditCircleModal.vue';
import DeleteCircleModal from '@/components/Circle/DeleteCircleModal.vue';
export default {
    name: "CircleComponent",
    components: {ProfileComponent, EditCircleModal, DeleteCircleModal},
    props: {
        circle: {
            type: Object,
            required: true
        }
    }, 
    methods: {
        editCircle(circleId){
            /**
             * Show the modal to edit the circle
             */
            this.$modals.show(`edit-circle-modal-${circleId}`)
        },
        deleteCircle(circleId){
            /**
             * Show the modal to delete the circle
             */
            this.$modals.show(`delete-circle-modal-${circleId}`)
        },
    }
}
</script>

<style scoped>

.circle {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.circleButtons {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

button{
    width: 100%;
    font-size: 16px;
    border: none;
    background-color: #1e88e5;
    margin: 5px;
    border-radius: 20px;
    padding: 10px;
    cursor:pointer;
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
.delete{
    background-color: #830700;
}

</style>
