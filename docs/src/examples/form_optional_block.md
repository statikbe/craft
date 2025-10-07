<form action="">
    <ul>
        <li>
            <input type="radio" id="extraContentRadio1" name="extraContentRadio" value="1"/>
            <label for="extraContentRadio1">Show extra content</label>
        </li>
        <li>
            <input type="radio" id="extraContentRadio2" name="extraContentRadio" value="2"/>
            <label for="extraContentRadio2">Show extra content</label>
        </li>
        <li>
            <input type="radio" id="extraContentRadio3" name="extraContentRadio" value="3"/>
            <label for="extraContentRadio3">Don't show extra content</label>
        </li>
    </ul>
    <div class="mt-4">
        <input type="checkbox" id="extraContent" name="extraContent" value="1"/>
        <label for="extraContent">Show extra content</label>
    </div>
    <div class="hidden open:block mt-6" data-optional-block="{&quot;extraContentRadio&quot;:[1,2],&quot;extraContent&quot;:1}">
        <label class="form__label" for="optionalContent3">Optional input</label>
        <input class="form__input" name="optionalContent3" id="optionalContent3" type="text" data-clear-on-hide required/>
        <fieldset class="mt-6">
            <legend>Extra nested optional blocks</legend>
            <div class="mt-4">
                <input type="checkbox" id="extraContentOnSubLevel" name="extraSubContent" value="1"/>
                <label for="extraContentOnSubLevel">Show extra sub content</label>
            </div>
            <div class="hidden my-4 open:block" data-optional-block="{&quot;extraSubContent&quot;: 1}" data-clear-all-on-hide="true">
                <label class="form__label" for="optionalContent3">Optional input for sub checkbox</label>
                <input class="form__input" name="optionalContent3" id="optionalSubContent" type="text" required/>
            </div>
        </fieldset>
    </div>
</form>
