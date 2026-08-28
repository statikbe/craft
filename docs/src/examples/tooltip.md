<div class="flex flex-wrap gap-12 py-20">
    <button type="button" class="btn" data-tippy-content="Tooltip">Text</button>
    <button type="button" class="btn" data-tippy-content="Another Tooltip">Text</button>
    <button type="button" class="btn" data-tippy-content="Tooltip" 
            data-tippy-duration="0"
            data-tippy-arrow="false"
            data-tippy-delay="[1000, 200]">No arrow and delay</button>
    <button type="button" class="btn" data-tippy-content="Tooltip" 
            data-tippy-placement="bottom">Tooltip at the bottom</button>
    <button type="button" class="btn" id="button" data-tippy-template="tooltip">With HTML</button>
    <div class="hidden">
        <div id="tooltip" role="tooltip">My tooltip <strong>With html enabled</strong>.</div>
    </div>
    <button type="button" class="btn" id="button" data-tippy-interactive="true" data-tippy-template="tooltipInteractive">With HTML and a link</button>
    <div class="hidden">
        <div id="tooltipInteractive" role="tooltip">My tooltip <a href="https://www.statik.be">Go to Statik</a>.</div>
    </div>
</div>
