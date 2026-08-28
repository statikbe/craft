<form action="">
    <div class="relative">
        <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="fromSlider" name="amount" type="range" value="10" min="0" max="100" data-sync="minSync" list="values"/>
        <input class="w-full text-primary-300 [--slider-color:var(--color-light)] [--slider-thumb-hover-color:var(--color-primary)]" id="toSlider" name="amount" type="range" value="50" min="0" max="100" data-sync="maxSync" list="values"/>
        <datalist id="values" class="text-sm">
            <option value="0" label="0"></option>
            <option value="25" label="25"></option>
            <option value="50" label="50"></option>
            <option value="75" label="75"></option>
            <option value="100" label="100"></option>
        </datalist>
    </div>
    <div class="flex justify-between w-full mt-4">
        <div class="flex">Min: <div id="minSync"></div></div>
        <div class="flex">Max: <div id="maxSync"></div></div>
    </div>
</form>
