import{r as i,R as t}from"./iframe-BrWmImZI.js";import"./preload-helper-PPVm8Dsz.js";function k(e){const l=e.trim().split(`
`).filter(a=>a.trim()),r=[];for(const a of l){if(/^\|[\s:\-|]+\|$/.test(a.trim()))continue;const s=a.trim().replace(/^\||\|$/g,"").split("|").map(o=>o.trim());r.push(s)}return r}function I(e){const l=e.split(`
`),r=[];let a=[],n="",s=!1;for(let o=0;o<l.length;o++)if(l[o].trim().startsWith("|")){if(!s){for(let u=o-1;u>=Math.max(0,o-10);u--){const c=l[u].trim();if(c.startsWith("#")||c.startsWith("**")){n=c.replace(/^#+\s*/,"").replace(/\*\*/g,"").trim();break}}s=!0}a.push(l[o])}else if(s){if(a.length>0){const u=k(a.join(`
`));r.push({header:n,rows:u}),a=[],n=""}s=!1}if(a.length>0){const o=k(a.join(`
`));r.push({header:n,rows:o})}return r}function N(e){return e=e.replace(/<\?xml[^>]*\?>/g,""),e=e.replace(/<!DOCTYPE[^>]*>/gi,""),e=e.replace(/<\/?[ovwx]:[^>]*>/g,""),e=e.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/g,""),e=e.replace(/<!--\[if[^\]]*\]>/g,""),e=e.replace(/<!\[endif\]-->/g,""),e=e.replace(/mso-[^;"]+;?/g,""),e=e.replace(/\s+style\s*=\s*["']\s*["']/g,""),e=e.replace(/\s+class\s*=\s*["']Mso[^"']*["']/g,""),e=e.replace(/<\/?font[^>]*>/gi,""),e=e.replace(/<span[^>]*>\s*<\/span>/g,""),e=e.replace(/[\r\n]+/g,`
`),e}function W(e){return e.includes("mso-")||e.includes("<o:p>")||e.includes('class="Mso')||e.includes("urn:schemas-microsoft-com")}function M(e,l=!1){(l||W(e))&&(e=N(e));const r=[],a=/<table[^>]*>([\s\S]*?)<\/table>/gi,n=/<tr[^>]*>([\s\S]*?)<\/tr>/gi,s=/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;let o,p=0;for(;(o=a.exec(e))!==null;){const u=o[1],c=[];let f;for(;(f=n.exec(u))!==null;){const b=f[1],m=[];let h;for(;(h=s.exec(b))!==null;){let g=h[1].replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#(\d+);/g,(T,E)=>String.fromCharCode(parseInt(E))).replace(/\s+/g," ").trim();m.push(g)}m.length>0&&c.push(m)}c.length>0&&(p++,r.push({header:`Table ${p}`,rows:c}))}return r}function H(e){const l=/<table/i.test(e),r=/^\s*\|.*\|/m.test(e);return l?W(e)?"word":"html":"markdown"}function V(e,l){const r=[];for(const{header:a,rows:n}of e){l&&a&&(r.push(`# ${a}`),r.push(""));for(const s of n)r.push(s.join("	"));r.push("")}return r.join(`
`)}function R(e,l,r){const a=l==="auto"?H(e):l;let n;return a==="html"?n=M(e,!1):a==="word"?n=M(e,!0):n=I(e),{output:V(n,r),tableCount:n.length,detectedFormat:a}}const y=({defaultInput:e=""})=>{const[l,r]=i.useState(e),[a,n]=i.useState(""),[s,o]=i.useState("auto"),[p,u]=i.useState(!0),[c,f]=i.useState(0),[b,m]=i.useState(null),[h,g]=i.useState(!1),T=i.useCallback(()=>{if(!l.trim()){n(""),f(0),m(null);return}const d=R(l,s,p);n(d.output),f(d.tableCount),m(d.detectedFormat)},[l,s,p]),E=i.useCallback(async()=>{if(a)try{await navigator.clipboard.writeText(a),g(!0),setTimeout(()=>g(!1),2e3)}catch(d){console.error("Failed to copy:",d)}},[a]),x=i.useCallback(()=>{r(""),n(""),f(0),m(null)},[]);return t.createElement("div",{className:"table-to-tsv-converter"},t.createElement("div",{className:"converter-header"},t.createElement("h2",null,"Table to TSV Converter"),t.createElement("p",{className:"converter-description"},"Paste Markdown, HTML, or Word tables to convert them to tab-delimited format for InDesign import.")),t.createElement("div",{className:"converter-controls"},t.createElement("div",{className:"control-group"},t.createElement("label",{htmlFor:"format-select"},"Format:"),t.createElement("select",{id:"format-select",value:s,onChange:d=>o(d.target.value)},t.createElement("option",{value:"auto"},"Auto-detect"),t.createElement("option",{value:"markdown"},"Markdown"),t.createElement("option",{value:"html"},"HTML"),t.createElement("option",{value:"word"},"Word (paste from Word)"))),t.createElement("div",{className:"control-group"},t.createElement("label",null,t.createElement("input",{type:"checkbox",checked:p,onChange:d=>u(d.target.checked)}),"Include section headers")),t.createElement("div",{className:"control-buttons"},t.createElement("button",{className:"btn-convert",onClick:T},"Convert to TSV"),t.createElement("button",{className:"btn-clear",onClick:x},"Clear"))),t.createElement("div",{className:"converter-panels"},t.createElement("div",{className:"panel input-panel"},t.createElement("div",{className:"panel-header"},t.createElement("h3",null,"Input"),t.createElement("span",{className:"format-hint"},"Paste Markdown, HTML, or Word table")),t.createElement("textarea",{value:l,onChange:d=>r(d.target.value),placeholder:`Paste your table here...

Markdown example:
| Stat | Value |
|------|-------|
| AC   | 15    |
| HP   | 45    |

HTML/Word: Just copy a table from Word or a webpage and paste it here.
Word tables are auto-detected and cleaned up.`,spellCheck:!1})),t.createElement("div",{className:"panel output-panel"},t.createElement("div",{className:"panel-header"},t.createElement("h3",null,"Output (TSV)"),t.createElement("div",{className:"output-info"},b&&t.createElement("span",{className:"detected-format"},"Detected: ",b),c>0&&t.createElement("span",{className:"table-count"},c," table",c!==1?"s":""," found"))),t.createElement("textarea",{value:a,readOnly:!0,placeholder:"Converted output will appear here..."}),t.createElement("button",{className:`btn-copy ${h?"copied":""}`,onClick:E,disabled:!a},h?"✓ Copied!":"Copy to Clipboard"))))},P={title:"Tools/TableToTSVConverter",component:y,parameters:{layout:"padded"},tags:["autodocs"]},v={args:{}},C={args:{defaultInput:`## Goblin Warrior

| Stat | Value |
|------|-------|
| AC | 16, touch 13, flat-footed 13 |
| HP | 6 (1d10+1) |
| Fort | +3 |
| Ref | +1 |
| Will | -1 |

## Offense

| Attack | Damage |
|--------|--------|
| Short sword | +2 (1d4/19-20) |
| Short bow | +4 (1d4/×3) |`}},w={args:{defaultInput:`<table>
  <tr>
    <th>Stat</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>AC</td>
    <td>16, touch 13, flat-footed 13</td>
  </tr>
  <tr>
    <td>HP</td>
    <td>6 (1d10+1)</td>
  </tr>
  <tr>
    <td>Fort</td>
    <td>+3</td>
  </tr>
  <tr>
    <td>Ref</td>
    <td>+1</td>
  </tr>
  <tr>
    <td>Will</td>
    <td>-1</td>
  </tr>
</table>`}},S={args:{defaultInput:`## Orc Warrior CR 1/3

| Attribute | Value |
|-----------|-------|
| XP | 135 |
| CE Medium humanoid (orc) |  |
| Init | +0 |
| Senses | darkvision 60 ft.; Perception -1 |

### Defense

| Defense | Value |
|---------|-------|
| AC | 13, touch 10, flat-footed 13 (+3 armor) |
| hp | 6 (1d10+1) |
| Fort | +3, Ref +0, Will -1 |
| Defensive Abilities | ferocity |
| Weaknesses | light sensitivity |

### Offense

| Offense | Value |
|---------|-------|
| Speed | 30 ft. |
| Melee | falchion +5 (2d4+4/18-20) |
| Ranged | javelin +1 (1d6+3) |`}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    defaultInput: \`## Goblin Warrior

| Stat | Value |
|------|-------|
| AC | 16, touch 13, flat-footed 13 |
| HP | 6 (1d10+1) |
| Fort | +3 |
| Ref | +1 |
| Will | -1 |

## Offense

| Attack | Damage |
|--------|--------|
| Short sword | +2 (1d4/19-20) |
| Short bow | +4 (1d4/×3) |\`
  }
}`,...C.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    defaultInput: \`<table>
  <tr>
    <th>Stat</th>
    <th>Value</th>
  </tr>
  <tr>
    <td>AC</td>
    <td>16, touch 13, flat-footed 13</td>
  </tr>
  <tr>
    <td>HP</td>
    <td>6 (1d10+1)</td>
  </tr>
  <tr>
    <td>Fort</td>
    <td>+3</td>
  </tr>
  <tr>
    <td>Ref</td>
    <td>+1</td>
  </tr>
  <tr>
    <td>Will</td>
    <td>-1</td>
  </tr>
</table>\`
  }
}`,...w.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    defaultInput: \`## Orc Warrior CR 1/3

| Attribute | Value |
|-----------|-------|
| XP | 135 |
| CE Medium humanoid (orc) |  |
| Init | +0 |
| Senses | darkvision 60 ft.; Perception -1 |

### Defense

| Defense | Value |
|---------|-------|
| AC | 13, touch 10, flat-footed 13 (+3 armor) |
| hp | 6 (1d10+1) |
| Fort | +3, Ref +0, Will -1 |
| Defensive Abilities | ferocity |
| Weaknesses | light sensitivity |

### Offense

| Offense | Value |
|---------|-------|
| Speed | 30 ft. |
| Melee | falchion +5 (2d4+4/18-20) |
| Ranged | javelin +1 (1d6+3) |\`
  }
}`,...S.parameters?.docs?.source}}};const D=["Default","WithMarkdownInput","WithHTMLInput","PathfinderStatblock"];export{v as Default,S as PathfinderStatblock,w as WithHTMLInput,C as WithMarkdownInput,D as __namedExportsOrder,P as default};
