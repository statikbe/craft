<ul class="w-1/2" data-indeterminate>
    <li>
        <div class="flex justify-between">
            <div class="flex justify-between items-center">
                <input type="checkbox" name="category[]" id="p1"/>
                <label for="p1" class="cursor-pointer">Checkbox 1</label>
            </div>
            <button type="button" class="group" data-toggle="subMenu1"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24" class="group-aria-expanded:rotate-180"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg></button>
        </div>
        <ul class="pl-6 hidden open:block" id="subMenu1">
            <li>
                <input type="checkbox" name="category[]" id="p1-1"/>
                <label for="p1-1" class="cursor-pointer">Checkbox 1.1</label>
            </li>
            <li>
                <input type="checkbox" name="category[]" id="p1-2"/>
                <label for="p1-2" class="cursor-pointer">Checkbox 1.2</label>
            </li>
            <li>
                <div class="flex justify-between items-center">
                    <div>
                        <input type="checkbox" name="category[]" id="p1-3"/>
                        <label for="p1-3" class="cursor-pointer">Checkbox 1.3</label>
                    </div>
                    <button type="button" class="group" data-toggle="subMenu2"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="24" height="24" viewBox="0 0 24 24" class="group-aria-expanded:rotate-180"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" /></svg></button>
                </div>
                <ul class="pl-6 hidden open:block" id="subMenu2">
                    <li>
                        <input type="checkbox" name="category[]" id="p1-3-1"/>
                        <label for="p1-3-1" class="cursor-pointer">Checkbox 1.3.1</label>
                    </li>
                    <li>
                        <input type="checkbox" name="category[]" id="p1-3-2"/>
                        <label for="p1-3-2" class="cursor-pointer">Checkbox 1.3.2</label>
                    </li>
                    <li>
                        <input type="checkbox" name="category[]" id="p1-3-3"/>
                        <label for="p1-3-3" class="cursor-pointer">Checkbox 1.3.3</label>
                    </li>
                </ul>     
            </li>
        </ul>
    </li>
</ul>
