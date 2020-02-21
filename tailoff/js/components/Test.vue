<template>
  <div @click="increment">This is the message: {{ msg }}</div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    msg: String
  },
  computed: mapGetters(["evenOrOdd"]),
  methods: mapActions([
    "increment",
    "decrement",
    "incrementIfOdd",
    "incrementAsync"
  ])
};
</script>
