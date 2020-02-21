<template>
  <div>
    This is the message of test 2: {{ msg }} count: {{ $store.state.count }}
  </div>
</template>

<script>
export default {
  props: {
    msg: String
  },
  watch: {
    "$store.state.count": function(newValue, oldValue) {
      console.log("new: ", newValue);
    }
  },
  created() {
    this.$eventBus.$on("send-data", data => {
      console.log(data);
    });
  }
};
</script>
