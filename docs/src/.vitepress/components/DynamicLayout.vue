<script setup>
import { useRoute } from 'vitepress';
// import Theme from 'vitepress/theme';
import DefaultTheme from 'vitepress/theme';
import ExampleLayout from './ExampleLayout.vue';

const route = useRoute();
if (route.path.startsWith('/craft/examples')) {
  DefaultTheme.Layout = ExampleLayout;
}
</script>

<template>
  <!-- <ExampleLayout v-if="route.path.startsWith('/craft/examples')" />
  <Theme.Layout v-else /> -->
  <DefaultTheme.Layout />
</template>
