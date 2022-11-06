<template>
    <main>
        <header >
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
            console.log(this.username);
            // console.log(props);
             this.$router.push(`/profile/${this.username}`);
        }
    }
}
</script>
