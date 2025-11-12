<div class="flex justify-end">
    <button type="button" class="text-3xl md:hidden ie-hidden print:hidden" data-flyout="flyout">
        <span class="sr-only">Menu</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"/></svg>
    </button>
</div>

<div class="invisible fixed top-0 right-0 bottom-0 w-full z-50 overflow-x-hidden overflow-y-auto bg-white max-w-flyout" 
    id="flyout" 
    data-flyout-inactive-class="transition-transform duration-200 ease-in-out translate-x-full" 
    data-flyout-active-class="transition-transform duration-200 ease-in-out translate-x-0" 
    data-flyout-body-active-class="h-screen overflow-hidden">
	<div class="container">
		<div class="absolute top-0 right-0 mt-4 mr-4">
			<button type="button" class="text-2xl cursor-pointer" tabindex="0" data-flyout-close="flyout">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/></svg>
				<span class="sr-only">Close menu</span>
			</button>
		</div>
		<div class="mt-12">
			Flyout content here
		</div>
	</div>
</div>
<button type="button" 
    class="fixed block inset-0 z-40 cursor-pointer bg-pitch-black/50 transitions duration-300 ease-in-out" 
    data-flyout-close="flyout" 
    data-flyout-close-inactive-class="opacity-0 pointer-events-none" 
    data-flyout-close-active-class="opacity-100">
    <span class="sr-only">Close flyout</span>
</button>
