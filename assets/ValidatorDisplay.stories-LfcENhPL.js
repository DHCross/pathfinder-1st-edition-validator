import{R as n}from"./iframe-DliMOVAR.js";import{V as o,v as r,a as i}from"./validateEconomy-B_7-Ymca.js";import"./preload-helper-PPVm8Dsz.js";import"./pf1e-data-tables-BqrvN3By.js";const p={title:"Pathfinder/Validator",component:o},l={name:"Rich Rookie",creature_type:"Humanoid",size:"Medium",cr:1,xp:400,total_wealth_gp:5e3,class_levels:[{class_name:"Fighter",level_count:1}],racial_hd_count:0,treasure_code:"NPC gear",ability_scores:{str:14,dex:12,con:14,int:10,wis:10,cha:8},feats:["Power Attack","Cleave","Weapon Focus (Longsword)"]},s={render:a=>{const t=r(a.statBlock),e=i(a.statBlock),c={status:t.status==="FAIL"||e.status==="FAIL"?"FAIL":t.status==="WARN"||e.status==="WARN"?"WARN":"PASS",messages:[...t.messages,...e.messages]};return n.createElement(o,{statBlock:a.statBlock,validation:c})},args:{statBlock:l,validation:{status:"PASS",messages:[]}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => {
    const basics = validateBasics(args.statBlock);
    const economy = validateEconomy(args.statBlock);
    const combinedResult = {
      status: basics.status === 'FAIL' || economy.status === 'FAIL' ? 'FAIL' : basics.status === 'WARN' || economy.status === 'WARN' ? 'WARN' : 'PASS',
      messages: [...basics.messages, ...economy.messages]
    };
    return <ValidatorDisplay statBlock={args.statBlock} validation={combinedResult} />;
  },
  args: {
    statBlock: OvergearedFighter,
    validation: {
      status: 'PASS',
      messages: []
    }
  }
}`,...s.parameters?.docs?.source}}};const A=["Full_Validation_Check"];export{s as Full_Validation_Check,A as __namedExportsOrder,p as default};
