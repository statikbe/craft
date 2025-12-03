---
layout: false
---

<div>
  <div class="container">
    <h2>News 1</h2>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3"
        data-load-more="newsCards"
        data-load-more-pagination="pagination"
        data-load-more-loader="paginationLoader"
        data-load-more-trigger="loadMoreTrigger"
        data-load-more-infinite-scroll="false">
      <div class="flex w-full">
        <div class="relative flex flex-col w-full min-h-full overflow-hidden transition duration-300 ease-in-out shadow hover:shadow-lg cursor-pointer card bg-white group">
          <div class="">
            <picture class="">
              <img
                src="https://unsplash.it/660/495?random&gravity=center"
                width="660"
                height="495"
                alt=""
                class="w-full aspect-[4/3] object-cover object-center"
                loading="lazy"
              />
            </picture>
          </div>
          <div class="w-full flex flex-col flex-auto p-4 md:p-6 xl:p-8">
            <h3 class="mb-1">
              <a class="hover-underline link--extended" href="#">News 1 - Card 1</a>
            </h3>
            <div class="py-1 text-sm font-semibold text-gray-700">7 april 1982</div>
            <div class="my-4 text-editor">
              Aliquip aliquip velit et amet nulla ea id. Sit ea nisi dolor voluptate qui excepteur aliquip est
              exercitation enim adipisicing excepteur.…
            </div>
            <div class="mt-auto link link--ext group-hover:no-underline group-hover:text-primary">Meer lezen</div>
          </div>
        </div>
      </div>
      <div class="flex w-full">
        <div class="relative flex flex-col w-full min-h-full overflow-hidden transition duration-300 ease-in-out shadow hover:shadow-lg cursor-pointer card bg-white group">
          <div class="">
            <picture class="">
              <img
                src="https://unsplash.it/660/495?random&gravity=center"
                width="660"
                height="495"
                alt=""
                class="w-full aspect-[4/3] object-cover object-center"
                loading="lazy"
              />
            </picture>
          </div>
          <div class="w-full flex flex-col flex-auto p-4 md:p-6 xl:p-8">
            <h3 class="mb-1">
              <a class="hover-underline link--extended" href="#">News 1 - Card 2</a>
            </h3>
            <div class="py-1 text-sm font-semibold text-gray-700">7 april 1982</div>
            <div class="my-4 text-editor">
              Aliquip aliquip velit et amet nulla ea id. Sit ea nisi dolor voluptate qui excepteur aliquip est
              exercitation enim adipisicing excepteur.…
            </div>
            <div class="mt-auto link link--ext group-hover:no-underline group-hover:text-primary">Meer lezen</div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center mt-8" id="pagination">
      <div class="hidden" id="paginationLoader">
        <div class="mt-2 italic opacity-50">Meer nieuws aan het laden</div>
      </div>
      <a href="./loadmore_page2.html" class="btn btn--ghost" id="loadMoreTrigger">Bekijk meer nieuws</a>
    </div>
  </div>
  <div class="container">
    <h2>News 2</h2>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3"
        data-load-more="newsCardsInfinite"
        data-load-more-pagination="paginationInfinite"
        data-load-more-loader="paginationLoaderInfinite"
        data-load-more-trigger="loadMoreTriggerInfinite"
        data-load-more-infinite-scroll="true">
      <div class="flex w-full">
        <div class="relative flex flex-col w-full min-h-full overflow-hidden transition duration-300 ease-in-out shadow hover:shadow-lg cursor-pointer card bg-white group">
          <div class="">
            <picture class="">
              <img
                src="https://unsplash.it/660/495?random&gravity=center"
                width="660"
                height="495"
                alt=""
                class="w-full aspect-[4/3] object-cover object-center"
                loading="lazy"
              />
            </picture>
          </div>
          <div class="w-full flex flex-col flex-auto p-4 md:p-6 xl:p-8">
            <h3 class="mb-1">
              <a class="hover-underline link--extended" href="#">News 2 - Card 1</a>
            </h3>
            <div class="py-1 text-sm font-semibold text-gray-700">7 april 1982</div>
            <div class="my-4 text-editor">
              Aliquip aliquip velit et amet nulla ea id. Sit ea nisi dolor voluptate qui excepteur aliquip est
              exercitation enim adipisicing excepteur.…
            </div>
            <div class="mt-auto link link--ext group-hover:no-underline group-hover:text-primary">Meer lezen</div>
          </div>
        </div>
      </div>
      <div class="flex w-full">
        <div class="relative flex flex-col w-full min-h-full overflow-hidden transition duration-300 ease-in-out shadow hover:shadow-lg cursor-pointer card bg-white group">
          <div class="">
            <picture class="">
              <img
                src="https://unsplash.it/660/495?random&gravity=center"
                width="660"
                height="495"
                alt=""
                class="w-full aspect-[4/3] object-cover object-center"
                loading="lazy"
              />
            </picture>
          </div>
          <div class="w-full flex flex-col flex-auto p-4 md:p-6 xl:p-8">
            <h3 class="mb-1">
              <a class="hover-underline link--extended" href="#">News 2 - Card 2</a>
            </h3>
            <div class="py-1 text-sm font-semibold text-gray-700">7 april 1982</div>
            <div class="my-4 text-editor">
              Aliquip aliquip velit et amet nulla ea id. Sit ea nisi dolor voluptate qui excepteur aliquip est
              exercitation enim adipisicing excepteur.…
            </div>
            <div class="mt-auto link link--ext group-hover:no-underline group-hover:text-primary">Meer lezen</div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-center mt-8" id="paginationInfinite">
      <div class="hidden" id="paginationLoaderInfinite">
        <div class="mt-2 italic opacity-50">Meer nieuws aan het laden</div>
      </div>
      <a href="./loadmore_page2.html" class="btn btn--ghost" id="loadMoreTriggerInfinite">Bekijk meer nieuws</a>
    </div>
  </div>
</div>
