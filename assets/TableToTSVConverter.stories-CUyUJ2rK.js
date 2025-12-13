import{r as u,R as e}from"./iframe-BtvG5weS.js";import"./preload-helper-PPVm8Dsz.js";function T(r){const a=r.trim().split(`
`).filter(t=>t.trim()),n=[];for(const t of a){if(/^\|[\s:\-|]+\|$/.test(t.trim()))continue;const l=t.trim().replace(/^\||\|$/g,"").split("|").map(s=>s.trim());n.push(l)}return n}function x(r){const a=r.split(`
`),n=[];let t=[],o="",l=!1;for(let s=0;s<a.length;s++)if(a[s].trim().startsWith("|")){if(!l){for(let c=s-1;c>=Math.max(0,s-10);c--){const i=a[c].trim();if(i.startsWith("#")||i.startsWith("**")){o=i.replace(/^#+\s*/,"").replace(/\*\*/g,"").trim();break}}l=!0}t.push(a[s])}else if(l){if(t.length>0){const c=T(t.join(`
`));n.push({header:o,rows:c}),t=[],o=""}l=!1}if(t.length>0){const s=T(t.join(`
`));n.push({header:o,rows:s})}return n}function I(r){const a=[],n=/<table[^>]*>([\s\S]*?)<\/table>/gi,t=/<tr[^>]*>([\s\S]*?)<\/tr>/gi,o=/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;let l,s=0;for(;(l=n.exec(r))!==null;){const m=l[1],c=[];let i;for(;(i=t.exec(m))!==null;){const h=i[1],p=[];let f;for(;(f=o.exec(h))!==null;){let b=f[1].replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#(\d+);/g,(E,w)=>String.fromCharCode(parseInt(w))).replace(/\s+/g," ").trim();p.push(b)}p.length>0&&c.push(p)}c.length>0&&(s++,a.push({header:`Table ${s}`,rows:c}))}return a}function N(r){const a=/<table/i.test(r),n=/^\s*\|.*\|/m.test(r);return a?"html":"markdown"}function W(r,a){const n=[];for(const{header:t,rows:o}of r){a&&t&&(n.push(`# ${t}`),n.push(""));for(const l of o)n.push(l.join("	"));n.push("")}return n.join(`
`)}function V(r,a,n){const t=a==="auto"?N(r):a,o=t==="html"?I(r):x(r);return{output:W(o,n),tableCount:o.length,detectedFormat:t}}const H=({defaultInput:r=""})=>{const[a,n]=u.useState(r),[t,o]=u.useState(""),[l,s]=u.useState("auto"),[m,c]=u.useState(!0),[i,h]=u.useState(0),[p,f]=u.useState(null),[b,E]=u.useState(!1),w=u.useCallback(()=>{if(!a.trim()){o(""),h(0),f(null);return}const d=V(a,l,m);o(d.output),h(d.tableCount),f(d.detectedFormat)},[a,l,m]),k=u.useCallback(async()=>{if(t)try{await navigator.clipboard.writeText(t),E(!0),setTimeout(()=>E(!1),2e3)}catch(d){console.error("Failed to copy:",d)}},[t]),M=u.useCallback(()=>{n(""),o(""),h(0),f(null)},[]);return e.createElement("div",{className:"table-to-tsv-converter"},e.createElement("div",{className:"converter-header"},e.createElement("h2",null,"Table to TSV Converter"),e.createElement("p",{className:"converter-description"},"Paste Markdown or HTML tables to convert them to tab-delimited format for InDesign import.")),e.createElement("div",{className:"converter-controls"},e.createElement("div",{className:"control-group"},e.createElement("label",{htmlFor:"format-select"},"Format:"),e.createElement("select",{id:"format-select",value:l,onChange:d=>s(d.target.value)},e.createElement("option",{value:"auto"},"Auto-detect"),e.createElement("option",{value:"markdown"},"Markdown"),e.createElement("option",{value:"html"},"HTML"))),e.createElement("div",{className:"control-group"},e.createElement("label",null,e.createElement("input",{type:"checkbox",checked:m,onChange:d=>c(d.target.checked)}),"Include section headers")),e.createElement("div",{className:"control-buttons"},e.createElement("button",{className:"btn-convert",onClick:w},"Convert to TSV"),e.createElement("button",{className:"btn-clear",onClick:M},"Clear"))),e.createElement("div",{className:"converter-panels"},e.createElement("div",{className:"panel input-panel"},e.createElement("div",{className:"panel-header"},e.createElement("h3",null,"Input"),e.createElement("span",{className:"format-hint"},"Paste Markdown or HTML table")),e.createElement("textarea",{value:a,onChange:d=>n(d.target.value),placeholder:`Paste your table here...

Markdown example:
| Stat | Value |
|------|-------|
| AC   | 15    |
| HP   | 45    |

HTML example:
<table>
  <tr><td>AC</td><td>15</td></tr>
  <tr><td>HP</td><td>45</td></tr>
</table>`,spellCheck:!1})),e.createElement("div",{className:"panel output-panel"},e.createElement("div",{className:"panel-header"},e.createElement("h3",null,"Output (TSV)"),e.createElement("div",{className:"output-info"},p&&e.createElement("span",{className:"detected-format"},"Detected: ",p),i>0&&e.createElement("span",{className:"table-count"},i," table",i!==1?"s":""," found"))),e.createElement("textarea",{value:t,readOnly:!0,placeholder:"Converted output will appear here..."}),e.createElement("button",{className:`btn-copy ${b?"copied":""}`,onClick:k,disabled:!t},b?"✓ Copied!":"Copy to Clipboard"))))},F={title:"Tools/TableToTSVConverter",component:H,parameters:{layout:"padded"},tags:["autodocs"]},g={args:{}},v={args:{defaultInput:`## Goblin Warrior

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
| Short bow | +4 (1d4/×3) |`}},C={args:{defaultInput:`<table>
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
| Ranged | javelin +1 (1d6+3) |`}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {}
}`,...g.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}};const P=["Default","WithMarkdownInput","WithHTMLInput","PathfinderStatblock"];export{g as Default,S as PathfinderStatblock,C as WithHTMLInput,v as WithMarkdownInput,P as __namedExportsOrder,F as default};
