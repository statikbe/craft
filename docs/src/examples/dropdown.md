---
layout: example
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  import('../assets/examples/.vite/manifest.json').then((manifest) => {
    // use code
    const linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = '../assets/examples/' + manifest.default['tailoff/js/docs.ts'].css;
    document.head.insertAdjacentElement('beforeend', linkTag);

    const scriptTag = document.createElement('script');
    scriptTag.src = '../assets/examples/' + manifest.default['tailoff/js/docs.ts'].file;
    scriptTag.type = 'module';
    document.head.insertAdjacentElement('beforeend', scriptTag);
  })
})
</script>

<div class="w-full p-10">
  <div class="text-white bg-center bg-cover hero js-bg-target">
    <div class="mb-10 text-black js-dropdown">
        <button type="button" class="btn btn--primary btn--ext js-dropdown-toggle">Toggle the dropdown</button>
        <ul class="p-4 bg-white shadow js-dropdown-menu">
            <li><a href="#">Item 1</a></li>
            <li><a href="#">Item 2</a></li>
            <li><a href="#">Item 3</a></li>
        </ul>
    </div>
  </div>
</div>
