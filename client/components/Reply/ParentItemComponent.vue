<!-- Reusable component representing a single freet and its actions -->
<!-- We've tagged some elements with classes; consider writing CSS using those classes to style them... -->

<template>
    <article
      class="parentItem"
    >
      <header>
        <h3 class="author">
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
  export default {
    name: 'ParentItemComponent',
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
  }
  </style>
  