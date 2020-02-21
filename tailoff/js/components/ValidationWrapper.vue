<template>
  <form class="wrapper">
    <slot></slot>
  </form>
</template>

<script>
export default {
  bind(el) {
    console.log(el);
  },
  props: {
    msg: String
  },
  methods: {
    log: function() {
      console.log("This is it!");
    }
  }
};
// import { ValidationProvider, extend } from "vee-validate";
// import * as rules from "vee-validate/dist/rules";

// Object.keys(rules).forEach(rule => {
//   extend(rule, rules[rule]);
// });

// export default {
//   inheritAttrs: false,
//   components: {
//     ValidationProvider
//   },
//   props: {
//     msg: String
//   }
// };
</script>
