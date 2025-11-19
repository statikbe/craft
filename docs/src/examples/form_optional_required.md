<form action="" data-validate>
    <div class="form__field">
        <label class="block" for="noOptionRequiredSelect">This field is required unless the checkbox below is checked.</label>
        <div class="form__custom-select">
            <select data-optional-required="{&quot;noOptionField&quot;: 0}" name="optional-required" id="noOptionRequiredSelect" required>
                <option value="">Select an option</option>
                <option value="1">Item 1</option>
                <option value="2">Item 2</option>
                <option value="3">Item 3</option>
            </select>
        </div>
    </div>
    <div class="mt-4">
        <input type="checkbox" id="noOptionField" name="noOptionField" value="1"/>
        <label for="noOptionField">I don't want an option</label>
    </div>
    <div class="mt-4">
        <button class="btn" type="submit">Submit</button>
    </div>
</form>
