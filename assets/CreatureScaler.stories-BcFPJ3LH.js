import{r as l,R as e}from"./iframe-DTY2Nunu.js";import{s as f,f as S}from"./pf1e-formatter-rxhD__3t.js";import{X as x}from"./pf1e-data-tables-BqrvN3By.js";import"./preload-helper-PPVm8Dsz.js";const C=({initialBlock:r})=>{const[s,u]=l.useState(r.xp||400),[m,g]=l.useState(r),[i,h]=l.useState([]);l.useEffect(()=>{const a=f(r,s);g(a.block),h(a.changes)},[s,r]);const o=Object.values(x).sort((a,t)=>a-t),d=o.findIndex(a=>a>=s),E=a=>{const t=parseInt(a.target.value);u(o[t])};return e.createElement("div",{className:"creature-scaler"},e.createElement("div",{className:"scaler-header"},e.createElement("h2",null,"Difficulty Scaler"),e.createElement("div",{className:"scaler-controls"},e.createElement("label",null,e.createElement("strong",null,"Target XP: ",s.toLocaleString())," (CR ",m.cr,")",e.createElement("input",{type:"range",min:"0",max:o.length-1,value:d===-1?0:d,onChange:E,style:{width:"100%"}})))),e.createElement("div",{className:"scaler-content"},e.createElement("div",{className:"scaler-block"},e.createElement("h3",null,"Scaled Stat Block"),e.createElement("pre",{className:"stat-block-display"},S(m))),e.createElement("div",{className:"scaler-changes"},e.createElement("h3",null,"Auto-Adjustments"),i.length===0?e.createElement("p",null,"No changes needed."):e.createElement("ul",null,i.map((a,t)=>e.createElement("li",{key:t},a))))))},y={title:"Components/CreatureScaler",component:C,parameters:{layout:"padded"}},p={name:"Chaos-Mutated Toad",cr:"1",xp:400,size:"Medium",type:"Outsider",subtypes:["Chaotic","Extraplanar"],racialHD:2,hp:15,ac:12,fort:4,ref:4,will:1,bab:2,str:12,dex:12,con:12,int:2,wis:10,cha:6,feats:["Toughness"],melee_line:"Bite +3 (1d6+1 plus grab)",special_attacks_line:"Tongue (Range 10 ft)",speed_line:"Speed 30 ft., swim 30 ft."},n={args:{initialBlock:p}},c={args:{initialBlock:{...p,name:"Greater Chaos Toad",cr:"5",xp:1600,racialHD:6,hp:55,size:"Large"}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    initialBlock: sampleToad
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    initialBlock: {
      ...sampleToad,
      name: "Greater Chaos Toad",
      cr: "5",
      xp: 1600,
      racialHD: 6,
      hp: 55,
      size: "Large"
    }
  }
}`,...c.parameters?.docs?.source}}};const N=["Default","HighLevel"];export{n as Default,c as HighLevel,N as __namedExportsOrder,y as default};
