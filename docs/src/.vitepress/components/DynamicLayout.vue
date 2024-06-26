<script setup>
import { useRoute } from 'vitepress';
import Theme from 'vitepress/theme';
import ExampleLayout from './ExampleLayout.vue';

const route = useRoute();
</script>

<template>
  <!--
    replace with the layout entirely for `/frames/default`
    so we don't inherit from `Theme.Layout`
  -->
  <ExampleLayout v-if="route.path.startsWith('/craft/examples')" />
  <Theme.Layout v-else />
</template>
