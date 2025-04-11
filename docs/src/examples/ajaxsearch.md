---
layout: false
---

<div class="container">
    <div class="w-8/12">
        <form action="">
            <h2>Search</h2>
            <div class="relative">
                <input type="text" class="w-full py-2 pl-2 pr-12 rounded border-1" 
                    placeholder="Search for example 'john'" 
                    data-ajax-search="https://67f7d1472466325443eadc3f.mockapi.io/api/data" 
                    data-ajax-search-methode="GET" 
                    data-ajax-search-query="search" 
                    data-ajax-search-result-template="result__template" 
                    data-ajax-search-no-result-template="noresult__template"
                    data-ajax-search-list-element-class="-mt-1 bg-white border-t shadow-lg border-t-light rounded-b-md"
                    data-ajax-search-list-item-class="block px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap hover:text-white aria-selected:text-white hover:bg-primary aria-selected:bg-primary" />
                <span class="absolute top-0 bottom-0 flex items-center block text-xl right-2 text-primary">
                    <svg class="icon" width="24" height="24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"></path></svg> 
                </span>
            </div>
            <template id="result__template">
                <div class="flex justify-between [&_mark]:font-bold [&_mark]:bg-transparent [&_mark]:text-inherit"><span>%%name%%</span> <span>(%%city%%, %%street%%)</span></div>
            </template>
            <template id="typed-text__template">
                <span class="block">
                    {{"Toon resultaten voor persoon: "|t}} %%query%%
                </span>
            </template>
            <template id="noresult__template">
                <span class="block p-2 bg-red-100">Niets gevonden</span>
            </template>
        </form>
    </div>
</div>
<div class="container mt-10">
    <div class="w-8/12">
        <form action="">
            <h2>Coctail search</h2>
            <input type="text" class="w-full p-2 rounded border-1"
                placeholder="Search a coctail"
                data-ajax-search="https://www.thecocktaildb.com/api/json/v1/1/search.php"
                data-ajax-search-methode="GET"
                data-ajax-search-query="s"
                data-ajax-search-data="0.drinks"
                data-ajax-search-result-template="result__templatec"
                data-ajax-search-no-result-template="noresult__templatec"
                data-ajax-search-no-typed-option="true"
                data-ajax-search-clear-on-select="true"
                data-ajax-search-list-element-class="-mt-1 bg-white border-t shadow-lg border-t-light rounded-b-md"
                data-ajax-search-list-item-class="block px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap hover:text-white aria-selected:text-white hover:bg-primary aria-selected:bg-primary" />
            <template id="result__templatec">
                <div class="flex justify-between [&_mark]:font-bold [&_mark]:bg-transparent [&_mark]:text-inherit"><span>%%strDrink%%</span> <span>(%%strAlcoholic%%)</span></div>
            </template>
            <template id="noresult__templatec">
                <span class="block p-2 bg-red-100">Je zal iets anders moeten drinken</span>
            </template>
        </form>
    </div>
</div>
