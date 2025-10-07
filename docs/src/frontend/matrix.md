# Matrix

The matrix component is made to add additional elements to a form. Typical examples are adding extra users or email addresses.

## Example

<iframe src="../examples/matrix.html" height="800"></iframe>

```HTML
<form action="" data-validate>
    <div>
        <div>
            <div class="form__field">
                <label class="form__label" for="name">Name</label>
                <input class="form__input" type="text" id="name" name="name[0]" value="" required>
            </div>
            <div class="form__field">
                <label class="form__label" for="email">E-mailaddress</label>
                <input class="form__input" type="email" id="email" name="email[0]" value="" required>
            </div>
        </div>
    </div>
    <div id="matrixWrapper"></div>
    <div class="hidden open:block form__field mt-10" id="showWhenExtraBlocks" data-validate-wrapper>
        <label class="flex" >
            <input class="mt-1 mr-2" type="checkbox" value="1" disabled="disabled" data-has-required="true"/>
            We like you to check this checkbox if you add input fields
        </label>
    </div>
    <div class="hidden open:block form__field mt-10" id="hideWhenExtraBlocks" open data-validate-wrapper>
        <label class="flex">
            <input class="mt-1 mr-2" type="checkbox" value="1" required/>
            This option can be hidden when there are multiple input fields
        </label>
    </div>
    <div class="mt-10">
        <button type="button" class="btn disabled:opacity-30"
            data-matrix-add="extraRow"
            data-matrix-destination="matrixWrapper"
            data-matrix-show="showWhenExtraBlocks"
            data-matrix-hide="hideWhenExtraBlocks"
            data-matrix-max="3">Add inputs</button>
        <button type="submit" class="btn btn--primary">Send form</button>
    </div>
</form>
<template id="extraRow">
    <div class="relative mt-10">
        <div class="form__field">
            <label class="form__label" for="name${index}">Name</label>
            <input class="form__input" type="text" id="name${index}" name="name[${index}]" value="" required>
        </div>
        <div class="form__field">
            <label class="form__label" for="email${index}">E-mailaddress</label>
            <input class="form__input" type="email" id="email${index}" name="email[${index}]" value="" required>
        </div>
        <div class="absolute top-0 right-0 mt-1 mr-2">
            <button type="button" data-remove-row>
                Remove row
            </button>
        </div>
    </div>
</template>
```

All settings are provided on the trigger button. The attribute to trigger the component is `data-matrix-add`.
All values of the parameters need to be ID references to elements.

## Attributes

Below is a table describing the attributes you can use with the matrix component.

| Attribute                 | Description                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `data-matrix-add`         | The value is the id of the template                                                                         |
| `data-matrix-destination` | Id of the element where the extra rows will be added                                                        |
| `data-matrix-show`        | Optional elements that will be shown when extra rows are added. This can be a comma separated list of ID's  |
| `data-matrix-hide`        | Optional elements that will be hidden when extra rows are added. This can be a comma separated list of ID's |
| `data-matrix-max`         | The maximum of extra rows that can be added. When omitted there is no limit.                                |
| `data-matrix-index`       | The initial index for the first element. When omitted the first one will have index=1                       |

## Events

The events will be thrown on the button.

| Event                   | Description                         |
| ----------------------- | ----------------------------------- |
| `matrix.rowAdded`       | When a row is added                 |
| `matrix.rowRemoved`     | When a row is removed               |
| `matrix.showElement`    | When an element is shown            |
| `matrix.hideElement`    | When an element is hidden           |
| `matrix.maxRowsReached` | When the maximum of rows is reached |
