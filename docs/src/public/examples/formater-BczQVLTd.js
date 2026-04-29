class f{constructor(){}static sprintf(t,r){if(typeof r=="object"){for(var e in r)t=this.sprintf(t,r[e]);return t}return typeof t=="string"?t.replace(/%s/i,r):""}static parseTemplate(t,r,e="%%"){const n=new RegExp(e+"([a-zA-z0-9.]+)"+e,"gi"),i=new RegExp(e,"gi"),o=t.match(n);return o&&o.forEach(a=>{const s=a.replace(i,"");let c=r;s.split(".").forEach(p=>{c&&(c=c[p])}),c&&(t=t.replace(a,c.toString()))}),t}static evaluateJSTemplate(t,r){try{const e=`
        with (data) {
          return \`${t.replace(/&gt;/g,">")}\`;
        }
      `;return new Function("data",e)(r)}catch(e){return console.error("Error evaluating JS template:",e),""}}}export{f as F};
