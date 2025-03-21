var B=Object.defineProperty;var M=(e,r,o)=>r in e?B(e,r,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[r]=o;var c=(e,r,o)=>M(e,typeof r!="symbol"?r+"":r,o);import{j as s}from"./jsx-runtime-D_zvdyIk.js";import{R as a}from"./index-iNOV5qWA.js";import{g,T as R}from"./theme-6pAN8qG3.js";import{i as P}from"./configs-ChwAXIEp.js";import{B as T}from"./BaseBatchProcess-DuMW4YHa.js";import{F as x}from"./FooterBatchProcessMenu-C4jzYKxd.js";import{c as E}from"./createTheme-B5w4ml5n.js";import"./resolveProps-BxfXLv92.js";import"./index-BOiXDGkM.js";import"./useThemeWithoutDefault-CG-nTen1.js";import"./DefaultPropsProvider-C7n-yi0g.js";import"./generateUtilityClasses-DXwt_ASJ.js";import"./useEnhancedEffect-DCkc7bGx.js";import"./GlobalStyles-cbKtrZEy.js";import"./useTranslation-C2ldOi4s.js";import"./Logging-BGLwk1OE.js";import"./Menu-CPVIqBh5.js";import"./useSlotProps-B_kYJHgD.js";import"./resolveComponentProps-C157xaDk.js";import"./useForkRef-Dv2UJ9DH.js";import"./isHostComponent-DVu5iVWx.js";import"./useSlot-C8kuGgOa.js";import"./Paper-Me1pdxeg.js";import"./useTheme-CBx8ayXt.js";import"./useTheme-BMUBEho4.js";import"./Grow-Cmdnd185.js";import"./utils-BrZ7fP8o.js";import"./TransitionGroupContext-BoJwzo5i.js";import"./index-BRkj21M-.js";import"./index-BGdoMgps.js";import"./ownerDocument-DW-IO8s5.js";import"./ownerWindow-HkKU3E4x.js";import"./debounce-Be36O1Ab.js";import"./Modal-Cd-jXePO.js";import"./ListContext-C7gjrrzQ.js";import"./MenuItem-B9tsOG0D.js";import"./ButtonBase-WT7DZmCb.js";import"./isFocusVisible-B8k4qzLc.js";import"./dividerClasses-DUoTRvux.js";const ue={title:"03_1_エディタ下部メニュー/部品/一括処理メニュー",component:x,argTypes:{}};P.changeLanguage("ja");const k=E(g("light")),b=E(g("dark"));class i extends T{constructor(){super(...arguments);c(this,"title","dummy.process");c(this,"summary","ダミー処理")}_process(o,m){return o}}const y=[{title:"dummy.process",cls:i},{title:"dummy.process",cls:i},{title:"dummy.process",cls:i}],v=e=>{const r=a.useRef(null),[o,m]=a.useState(null);return a.useEffect(()=>{r.current&&m(r.current)},[]),s.jsxs("div",{children:[s.jsx("div",{ref:r,style:{display:"inline-block",padding:"8px",background:"#eee",marginBottom:"16px"},children:"アンカー要素"}),s.jsx(x,{...e,anchor:o,handleClose:()=>{}})]})},t=v.bind({});t.args={batchProcesses:y,process:e=>{console.log("Process called with index",e)}};t.storyName="ライトモード";t.decorators=[e=>s.jsx(R,{theme:k,children:s.jsx(e,{})})];const n=v.bind({});n.args={batchProcesses:y,process:e=>{console.log("Process called with index",e)}};n.decorators=[e=>s.jsx(R,{theme:b,children:s.jsx(e,{})})];n.storyName="ダークモード";var l,p,d;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`args => {
  // アンカー要素用の ref と state
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);
  return <div>\r
      <div ref={anchorRef} style={{
      display: "inline-block",
      padding: "8px",
      background: "#eee",
      marginBottom: "16px"
    }}>\r
        アンカー要素\r
      </div>\r
      <FooterBatchProcessMenu {...args} anchor={anchorEl} handleClose={() => {}} />\r
    </div>;
}`,...(d=(p=t.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var h,u,f;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`args => {
  // アンカー要素用の ref と state
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);
  return <div>\r
      <div ref={anchorRef} style={{
      display: "inline-block",
      padding: "8px",
      background: "#eee",
      marginBottom: "16px"
    }}>\r
        アンカー要素\r
      </div>\r
      <FooterBatchProcessMenu {...args} anchor={anchorEl} handleClose={() => {}} />\r
    </div>;
}`,...(f=(u=n.parameters)==null?void 0:u.docs)==null?void 0:f.source}}};const fe=["LightMode","DarkMode"];export{n as DarkMode,t as LightMode,fe as __namedExportsOrder,ue as default};
