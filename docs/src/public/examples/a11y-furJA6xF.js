const s=class s{constructor(){}static keepFocus(l,n=!1){const t=l.querySelectorAll(this.tabbableElements),a=t[0],o=t[t.length-1];n&&a.focus();const i=function(e){(e.which||e.keyCode)===9&&(e.target===o&&!e.shiftKey?(e.preventDefault(),a.focus()):e.target===a&&e.shiftKey&&(e.preventDefault(),o.focus()))};l.addEventListener("keydown",i)}};s.tabbableElements=`a[href]:not(.disabled), area[href], input:not([disabled]),
    select:not([disabled]), textarea:not([disabled]),
    button:not([disabled]), iframe, object, embed, *[tabindex],
    *[contenteditable]`;let b=s;export{b as A};
