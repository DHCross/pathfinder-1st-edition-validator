import{r as m,R as e}from"./iframe-B8e6Fyvt.js";import{s as A,f as E}from"./pf1e-formatter-BViDTO6Q.js";import{a as N,v as L}from"./validateBenchmarks-Q5KBnCxV.js";import{X as k}from"./pf1e-data-tables-BqrvN3By.js";import{v as C,a as W,V as z}from"./validateEconomy-Mk1nyWUe.js";import"./preload-helper-PPVm8Dsz.js";const R={"Fire Beetle":{name:"Fire Beetle",cr:"1",xp:400,size:"Small",type:"Vermin",racialHD:1,hp:50,str:10,dex:11,con:11,ac:12,bab:0,fort:2,ref:0,will:0},"Chaos-Mutated Toad":{name:"Chaos-Mutated Toad",cr:"1",xp:400,size:"Medium",type:"Animal",racialHD:6,hp:120,str:14,dex:12,con:14,ac:12,bab:3,fort:6,ref:2,will:2}},D=()=>{const[i,o]=m.useState(1),[u,v]=m.useState("Fire Beetle"),[c,T]=m.useState(1),[l,g]=m.useState("enforce_cr"),n=R[u]||{},[a,f]=m.useState({}),s=m.useMemo(()=>{const t=a.cr??n.cr??"1",b=k[c.toString()]||n.xp||400;return{name:a.name||n.name||"New Creature",cr:t,xp:b,size:a.size||n.size||"Medium",type:a.type||n.type||"Outsider",racialHD:a.racialHD||n.racialHD||1,hp:a.hp||n.hp||10,str:a.str||n.str||10,dex:a.dex||n.dex||10,con:a.con||n.con||10,ac:a.ac||n.ac||10,bab:a.bab||n.bab||0,fort:a.fort||n.fort||0,ref:a.ref||n.ref||0,will:a.will||n.will||0,int:a.int||n.int||10,wis:a.wis||n.wis||10,cha:a.cha||n.cha||10}},[u,a,c,n]),{block:S}=A(s,k[c.toString()]||s.xp||400),{block:d}=N(S,l),M=C(s),y=l==="enforce_cr"?d:s,_=C(y),F=L(y),I=W(y),h=[...M.messages.filter(t=>t.category==="structure"),..._.messages,...F.messages,...I.messages],H={valid:!h.some(t=>t.severity==="critical"),status:h.some(t=>t.severity==="critical")?"FAIL":h.some(t=>t.severity==="warning")?"WARN":"PASS",messages:h};return e.createElement("div",{style:{padding:12}},e.createElement("h2",null,"Monster Builder Wizard"),e.createElement("div",{style:{display:"flex",gap:12}},e.createElement("div",{style:{width:360,borderRight:"1px solid #e5e7eb",paddingRight:12}},e.createElement("div",{style:{marginBottom:8}},e.createElement("strong",null,"Step ",i," / 3")),i===1&&e.createElement("div",null,e.createElement("label",{style:{display:"block",fontWeight:600}},"Choose Template"),e.createElement("select",{value:u,onChange:t=>v(t.target.value),style:{width:"100%",marginTop:8}},Object.keys(R).map(t=>e.createElement("option",{key:t,value:t},t))),e.createElement("div",{style:{marginTop:12}},e.createElement("label",{style:{display:"block",fontWeight:600}},"Creature Name"),e.createElement("input",{value:a.name??"",onChange:t=>f({...a,name:t.target.value}),style:{width:"100%",marginTop:6}}))),i===2&&e.createElement("div",null,e.createElement("label",{style:{display:"block",fontWeight:600}},"Target CR: ",c),e.createElement("input",{type:"range",min:1,max:20,value:c,onChange:t=>T(parseInt(t.target.value))}),e.createElement("div",{style:{marginTop:8}},e.createElement("label",{style:{display:"block",fontWeight:600}},"Racial HD"),e.createElement("input",{type:"number",value:a.racialHD??s.racialHD,onChange:t=>f({...a,racialHD:parseInt(t.target.value)}),style:{width:"100%"}})),e.createElement("div",{style:{marginTop:8}},e.createElement("label",{style:{display:"block",fontWeight:600}},"HP"),e.createElement("input",{type:"number",value:a.hp??s.hp,onChange:t=>f({...a,hp:parseInt(t.target.value)}),style:{width:"100%"}}))),i===3&&e.createElement("div",null,e.createElement("label",{style:{display:"block",fontWeight:600}},"Fix Mode"),e.createElement("div",{style:{display:"flex",gap:8,marginTop:8}},e.createElement("button",{onClick:()=>g("enforce_cr"),style:{backgroundColor:l==="enforce_cr"?"#111827":"#f3f4f6",color:l==="enforce_cr"?"white":"black",padding:"6px 10px",border:"none"}},"Design (Enforce CR)"),e.createElement("button",{onClick:()=>g("fix_math"),style:{backgroundColor:l==="fix_math"?"#111827":"#f3f4f6",color:l==="fix_math"?"white":"black",padding:"6px 10px",border:"none"}},"Audit (Fix Math)")),e.createElement("div",{style:{marginTop:12,display:"flex",gap:8}},e.createElement("button",{onClick:()=>{navigator.clipboard.writeText(E(d))},style:{padding:"6px 10px"}},"Copy Fixed Block"),e.createElement("button",{onClick:async()=>{const t=JSON.stringify(d,null,2);try{const b=new Blob([t],{type:"application/json"}),x=URL.createObjectURL(b),p=document.createElement("a"),O=(d.name||"creature").replace(/[^a-z0-9\-_]/gi,"_").toLowerCase();p.href=x,p.download=`${O}-cr-${d.cr||"0"}.json`,document.body.appendChild(p),p.click(),p.remove(),setTimeout(()=>URL.revokeObjectURL(x),1e3);try{await navigator.clipboard.writeText(t)}catch{}}catch{try{await navigator.clipboard.writeText(t)}catch{}}},style:{padding:"6px 10px"}},"Download JSON"))),e.createElement("div",{style:{marginTop:12,display:"flex",gap:8}},e.createElement("button",{disabled:i===1,onClick:()=>o(t=>Math.max(1,t-1))},"Back"),e.createElement("button",{onClick:()=>o(t=>Math.min(3,t+1))},i===3?"Finish":"Next"))),e.createElement("div",{style:{flex:1,paddingLeft:12}},e.createElement("h4",null,"Raw Preview"),e.createElement("pre",{style:{background:"#f9fafb",padding:10,borderRadius:6}},E(s)),e.createElement("h4",{style:{marginTop:12}},"Auto-Fixed Preview"),e.createElement("pre",{style:{background:"#f9fafb",padding:10,borderRadius:6}},E(d)),e.createElement("div",{style:{marginTop:12}},e.createElement("h4",null,"Validation"),e.createElement(z,{statBlock:y,validation:H,validationTarget:l==="enforce_cr"?"fixed":"raw"})))))};D.__docgenInfo={description:"",methods:[],displayName:"MonsterBuilderWizard"};const{within:j,userEvent:r,expect:B}=__STORYBOOK_MODULE_TEST__,q={title:"Tools/Monster Builder Wizard",component:D,parameters:{layout:"padded"}},w={play:async({canvasElement:i})=>{const o=j(i),v=(await o.getAllByRole("combobox"))[0];await r.selectOptions(v,"Chaos-Mutated Toad");const c=await o.getByRole("button",{name:/Next/i});await r.click(c);const l=(await o.getAllByRole("spinbutton"))[0];await r.clear(l),await r.type(l,"7"),await r.click(c);const g=await o.getByRole("button",{name:/Design \(Enforce CR\)/i});await r.click(g),await B(o.getByText(/HD\/CR Mismatch/i)).toBeInTheDocument(),await B(o.getByText(/FAIL.*Fixed/i)).toBeInTheDocument();const n=await o.getByRole("button",{name:/Download JSON/i});await r.click(n),await B(n).toBeInTheDocument()}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Select the Chaos-Mutated Toad template which is intentionally high HD
    const selects = await canvas.getAllByRole('combobox');
    const select = selects[0];
    await userEvent.selectOptions(select, 'Chaos-Mutated Toad');

    // Move to Step 2 to adjust Racial HD so we exceed the structural threshold
    const nextBtn = await canvas.getByRole('button', {
      name: /Next/i
    });
    await userEvent.click(nextBtn);

    // Racial HD input is the first numeric input (spinbutton) on step 2
    const spinbuttons = await canvas.getAllByRole('spinbutton');
    const racialInput = spinbuttons[0];
    await userEvent.clear(racialInput);
    await userEvent.type(racialInput, '7');

    // Continue to Step 3 and enable Design Mode
    await userEvent.click(nextBtn);
    const designBtn = await canvas.getByRole('button', {
      name: /Design \\(Enforce CR\\)/i
    });
    await userEvent.click(designBtn);

    // The ValidatorDisplay should show a structural critical message for HD/CR mismatch
    await expect(canvas.getByText(/HD\\/CR Mismatch/i)).toBeInTheDocument();

    // And the overall badge should indicate FAIL for the validated (fixed) version
    await expect(canvas.getByText(/FAIL.*Fixed/i)).toBeInTheDocument();

    // Finally, click the Download JSON button (verifies presence and clickability)
    const downloadBtn = await canvas.getByRole('button', {
      name: /Download JSON/i
    });
    await userEvent.click(downloadBtn);
    await expect(downloadBtn).toBeInTheDocument();
  }
}`,...w.parameters?.docs?.source}}};const G=["Default"];export{w as Default,G as __namedExportsOrder,q as default};
