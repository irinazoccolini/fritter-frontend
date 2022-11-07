<template>
    <vue-modal transitionName="slide-in-top" title="Edit Circle" :name='`edit-circle-modal-${circle._id}`'>
        <h1>Delete Circle</h1>
        <p>Are you sure you want to delete this circle? Once it's deleted, all freets posted to it will become private. Only you will be
            able to see them. Users who were in the circle will no longer have access to them.
        </p>
        <button>Yes, delete</button>
        <button>No, go back</button>
    </vue-modal>
</template>


<script>

export default {
    name: "DeleteCircleModal"
}
</script>