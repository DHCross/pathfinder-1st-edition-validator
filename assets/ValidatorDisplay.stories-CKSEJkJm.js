import{R as i}from"./iframe-BtvG5weS.js";import{V as o}from"./ValidatorDisplay-BLkJSKrV.js";import{v as c,a as l}from"./validateEconomy-6D0WuLcc.js";import"./preload-helper-PPVm8Dsz.js";import"./pf1e-data-tables-BqrvN3By.js";const p={title:"Pathfinder/Validator",component:o},r={name:"Rich Rookie",type:"Humanoid",size:"Medium",cr:"1",xp:400,gearValue:5e3,classLevels:[{className:"Fighter",level:1}],racialHD:0,treasureType:"NPC Gear",str:14,dex:12,con:14,int:10,wis:10,cha:8,feats:["Power Attack","Cleave","Weapon Focus (Longsword)"],hp:12,ac:16,fort:4,ref:1,will:0,bab:1},t={render:e=>{const a=c(e.statBlock),s=l(e.statBlock),n={valid:a.valid&&s.valid,status:a.status==="FAIL"||s.status==="FAIL"?"FAIL":a.status==="WARN"||s.status==="WARN"?"WARN":"PASS",messages:[...a.messages,...s.messages]};return i.createElement(o,{statBlock:e.statBlock,validation:n})},args:{statBlock:r,validation:{valid:!0,status:"PASS",messages:[]}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: (args: {
    statBlock: PF1eStatBlock;
    validation: ValidationResult;
  }) => {
    const basics = validateBasics(args.statBlock);
    const economy = validateEconomy(args.statBlock);
    const combinedResult: ValidationResult = {
      valid: basics.valid && economy.valid,
      status: basics.status === 'FAIL' || economy.status === 'FAIL' ? 'FAIL' : basics.status === 'WARN' || economy.status === 'WARN' ? 'WARN' : 'PASS',
      messages: [...basics.messages, ...economy.messages]
    };
    return <ValidatorDisplay statBlock={args.statBlock} validation={combinedResult} />;
  },
  args: {
    statBlock: OvergearedFighter,
    validation: {
      valid: true,
      status: 'PASS',
      messages: []
    }
  }
}`,...t.parameters?.docs?.source}}};const A=["Full_Validation_Check"];export{t as Full_Validation_Check,A as __namedExportsOrder,p as default};
