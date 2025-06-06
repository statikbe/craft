https://forum.bricksbuilder.io/t/solved-breaking-element-out-of-container-to-one-side-only/12729

This can totally be done with CSS now.

```HTML
<div class="flex flex-wrap">
    <div class="w-full md:w-1/2 flex justify-end">
        <div style="max-width: min(calc(100% + 130px), 50vw); width: calc(100% + ((100vw - 100%) / 2));" class="shrink-0 pr-4">
            <img src="https://unsplash.it/800/600?random" alt="" class="w-full"/>
        </div>
    </div>
    <div class="w-full mt-6 md:w-1/2 md:mt-0">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum dicta maxime, eius voluptate atque consectetur culpa quod tempora sequi, a nesciunt? Vero eum praesentium odio, quo laborum porro eaque consectetur soluta. Reprehenderit necessitatibus corporis, dicta at voluptate nesciunt nobis vitae.</p>
    </div>
</div>
```
