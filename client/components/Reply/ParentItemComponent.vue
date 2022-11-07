<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
    <article
      class="parentItem"
    >
      <header>
        <ProfileComponent class="profile" v-if="!item.anonymous"
          :user="item.author"
        />
        <h3 class="author" v-else>
          @{{ item.author }}
        </h3>
      </header>
      <p
        class="content"
      >
        {{ item.content }}
      </p>
      <p class="info">
        Posted at {{ item.dateModified }}
        <i v-if="!(item.dateModified === item.dateCreated)">(edited)</i>
      </p>
    </article>
  </template>
  
  <script>
  import ProfileComponent from '@/components/Profile/ProfileComponent.vue';

  export default {
    name: 'ParentItemComponent',
    components: {ProfileComponent},
    props: {
      // Data from the stored item
      item: {
        type: Object,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .parentItem {
      border: 1px solid #111;
      padding: 20px;
      position: relative;
      background-color: #fbfaff;
      border-radius: 20px;
      margin-bottom: 5px;
  }

  .profile {
  padding: 0;
  } 

  .info {
  font-size: 14px;
  color: #575757
}
  </style>
  