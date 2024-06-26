<script setup>
import { onMounted, ref } from 'vue';

const el = ref();

onMounted(() => {
  import('../../assets/examples/.vite/manifest.json').then((manifest) => {
    // use code
    const linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = '../assets/examples/' + manifest.default['tailoff/js/docs.ts'].css;
    document.head.insertAdjacentElement('beforeend', linkTag);

    const scriptTag = document.createElement('script');
    scriptTag.src = '../assets/examples/' + manifest.default['tailoff/js/docs.ts'].file;
    scriptTag.type = 'module';
    document.head.insertAdjacentElement('beforeend', scriptTag);
  });
});
</script>

<template>
  <div ref="el" class="w-full p-6"><Content /></div>
</template>
