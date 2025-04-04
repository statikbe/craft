<script setup>
import { onMounted, ref } from 'vue';

const el = ref();

onMounted(() => {
  document.querySelectorAll('head style, head link, head script').forEach((extra) => {
    extra.remove();
  });
  import('../../public/examples/.vite/manifest.json').then((manifest) => {
    // use code
    const linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = '../examples/' + manifest.default['tailoff/js/site.ts'].css;
    document.head.insertAdjacentElement('beforeend', linkTag);

    const scriptTag = document.createElement('script');
    scriptTag.src = '../examples/' + manifest.default['tailoff/js/site.ts'].file;
    scriptTag.type = 'module';
    document.head.insertAdjacentElement('beforeend', scriptTag);
  });
});
</script>

<template>
  <div ref="el" class="w-full p-6"><Content /></div>
</template>
