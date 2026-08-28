<div class="flex flex-col gap-10">
    <textarea data-ck-editor></textarea>
    <textarea data-ck-editor data-ck-editor-style="compact"></textarea>
    <textarea data-ck-editor data-ck-editor-toolbar="bold,italic"></textarea>
    <div>
        <textarea
            name="message"
            rows="8"
            class="form__input"
            data-ck-editor
            data-ck-editor-link-open-new-tab="false"
            data-ck-editor-link-nofollow
            data-ck-editor-toolbar="bulletedList,link"
            data-ck-editor-wordcount="wordcount"
            data-ck-editor-limit="1000"
        ></textarea>
        <div class="flex justify-between mt-1">
            <div class="mt-1 text-xs italic opacity-30">Maximum 1000 characters</div>
            <div id="wordcount" class="mt-1 text-xs italic opacity-75" data-template="wordcount-template"></div>
            <template id="wordcount-template">Character count: ${characters}/${limit}</template>
        </div>
    </div>
</div>
