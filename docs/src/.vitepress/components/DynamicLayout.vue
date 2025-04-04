<script setup>
import { useRoute } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import ExampleLayout from './ExampleLayout.vue';

const route = useRoute();
if (route.path.startsWith('/craft/examples')) {
  DefaultTheme.Layout = ExampleLayout;
}
</script>

<template>
  <DefaultTheme.Layout />
</template>
