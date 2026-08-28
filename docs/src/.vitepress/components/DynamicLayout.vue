<script setup>
import { useRoute } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ExampleLayout from "./ExampleLayout.vue";
import FooterLogo from "../components/FooterLogo.vue";
import { h } from "vue";

const route = useRoute();

if (route.path.startsWith("/examples")) {
  DefaultTheme.Layout = ExampleLayout;
} else {
  DefaultTheme.Layout = h(DefaultTheme.Layout, null, {
    "aside-bottom": () => h(FooterLogo),
  });
}
</script>

<template>
  <DefaultTheme.Layout />
</template>
