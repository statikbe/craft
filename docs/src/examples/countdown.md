<form action="#" data-validate>
    <label for="textarea">Maximum length is 140 and has a countdown</label>
    <textarea class="" id="textarea" name="textarea" type="text" maxlength="140" data-countdown="character-counter" required></textarea>
    <div class="flex justify-end text-sm">
        <span class="hidden" id="character-counter" aria-live="polite">Characters left:
            <span class="nr-of-characters" data-countdown-count></span>
        </span>
    </div>
    <div class="mt-4">
        <button type="submit" class="btn">Submit</button>
    </div>
</form>
