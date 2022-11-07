<template>
    <main>
        <header>
           <h3>{{circle.name}}</h3>
        </header>
        <h4>Circle Members</h4>
        <p> {{circle.members}}</p>
    </main>
</template>

<script>

export default {
    name: "CircleComponent",
    props: {
        circle: {
            type: Object,
            required: true
        }
    }
}
</script>