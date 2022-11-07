<template>
    <main>
        <header class="username">
            <h3 @click="viewProfile"> @{{user}} </h3>
        </header>
    </main>
</template>


<script>

export default {
    name: "ProfileComponent",
    props: {
        user: {
            type: String,
            required: true
        }
    },
    data(){
        return {
            username: this.user
        }
    },
    methods: {
        viewProfile() {
            /**
             * Changes the router to the profile page of the user that was clicked on.
             */
             this.$router.push(`/profile/${this.username}`);
        }
    }
}
</script>

<style scoped>
.username {
    width: fit-content;
    text-align: center;
    border-radius: 20px;
    padding-left: 10px;
    padding-right: 10px;
    background-color:  #90caf9;
    margin: 0;
}
</style>