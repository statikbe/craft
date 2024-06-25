<script setup>
import { useRoute } from 'vitepress';
import Theme from 'vitepress/theme';
// the default layout we'll create next
import Test from './Test.vue';

const route = useRoute();
</script>

<template>
  <!--
    replace with the layout entirely for `/frames/default`
    so we don't inherit from `Theme.Layout`
  -->
  <Test v-if="route.path.startsWith('/craft/examples')" />
  <Theme.Layout v-else />
</template>
