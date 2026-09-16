<div class="flex flex-col gap-6 pt-16">
    <div>
        <p class="mb-2">Copy a literal value, with toaster feedback:</p>
        <button type="button" class="btn btn--primary cursor-pointer" data-copy="https://www.statik.be" data-copy-feedback="Link copied to clipboard">Copy link</button>
    </div>
    <div>
        <p class="mb-2">Copy the value of a form field:</p>
        <div class="flex items-center gap-2">
            <input type="text" id="shareUrl" class="mb-0 form__input" value="https://www.statik.be/en/contact" readonly>
            <button type="button" class="btn cursor-pointer shrink-0" data-copy="#shareUrl" data-copy-feedback="Link copied">Copy</button>
        </div>
    </div>
    <div>
        <p class="mb-2">Copy the text content of an element:</p>
        <div class="flex items-center gap-2">
            <code id="couponCode" class="px-2 py-1 bg-light">SUMMER-2026</code>
            <button type="button" class="btn cursor-pointer shrink-0" data-copy="#couponCode" data-copy-feedback="Coupon code copied">Copy code</button>
        </div>
    </div>
    <div>
        <p class="mb-2">Copy without feedback (nothing is announced, check your clipboard):</p>
        <button type="button" class="btn cursor-pointer" data-copy="No toaster for this one">Copy silently</button>
    </div>
</div>
