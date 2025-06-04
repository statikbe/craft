# Indeterminate checkboxes

When you have a list of checkboxes with nested lists of checkboxes you will need this component. When you click a parent checkbox, you want to check all children. And when a child is selected you want to indicated this on the parent.

## Example

<iframe src="../examples/indeterminate_simple.html" height="350"></iframe>

```HTML
<ul data-indeterminate>
    <li>
        <input type="checkbox" name="category[]" id="p1"/>
        <label for="p1" class="cursor-pointer">Checkbox 1</label>
        <ul class="pl-6">
            <li>
                <input type="checkbox" name="category[]" id="p1-1"/>
                <label for="p1-1" class="cursor-pointer">Checkbox 1.1</label>
            </li>
            <li>
                <input type="checkbox" name="category[]" id="p1-2"/>
                <label for="p1-2" class="cursor-pointer">Checkbox 1.2</label>
            </li>
            <li>
                <input type="checkbox" name="category[]" id="p1-3"/>
                <label for="p1-3" class="cursor-pointer">Checkbox 1.3</label>
                <ul class="pl-6">
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
    <li>
        <input type="checkbox" name="category[]" id="p2"/>
        <label for="p2" class="cursor-pointer">Checkbox 2</label>
        <ul class="pl-6">
            <li>
                <input type="checkbox" name="category[]" id="p2-1"/>
                <label for="p2-1" class="cursor-pointer">Checkbox 2.1</label>
            </li>
            <li>
                <input type="checkbox" name="category[]" id="p2-2"/>
                <label for="p2-2" class="cursor-pointer">Checkbox 2.2</label>
            </li>
            <li>
                <input type="checkbox" name="category[]" id="p2-3"/>
                <label for="p2-3" class="cursor-pointer">Checkbox 2.3</label>
            </li>
        </ul>
    </li>
</ul>
```

## Example combination with the toggle component

<iframe src="../examples/indeterminate_toggle.html" height="250"></iframe>

[More about the toggle component](/frontend/toggle)

```HTML
<ul data-indeterminate>
    <li>
        <div class="flex justify-between">
            <div class="flex justify-between">
                <input type="checkbox" name="category[]" id="p1"/>
                <label for="p1" class="cursor-pointer">Checkbox 1</label>
            </div>
            <button type="button" data-toggle="subMenu1">toggle</button>
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
                <div class="flex justify-between">
                    <div>
                        <input type="checkbox" name="category[]" id="p1-3"/>
                        <label for="p1-3" class="cursor-pointer">Checkbox 1.3</label>
                    </div>
                    <button type="button" data-toggle="subMenu2">toggle</button>
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
```
