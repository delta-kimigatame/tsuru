import{j as o}from"./jsx-runtime-D_zvdyIk.js";import{R as a}from"./index-iNOV5qWA.js";import{g as d,T as u}from"./theme-6pAN8qG3.js";import{i as x}from"./configs-Bv5Ugt3f.js";import{F as h}from"./FooterZoomMenu-_WMcfIDB.js";import{c as f}from"./createTheme-B5w4ml5n.js";import"./resolveProps-BxfXLv92.js";import"./index-BOiXDGkM.js";import"./useThemeWithoutDefault-CG-nTen1.js";import"./DefaultPropsProvider-C7n-yi0g.js";import"./generateUtilityClasses-DXwt_ASJ.js";import"./useEnhancedEffect-DCkc7bGx.js";import"./GlobalStyles-cbKtrZEy.js";import"./useTranslation-C2ldOi4s.js";import"./createSvgIcon-j8Re0J7b.js";import"./Logging-BGLwk1OE.js";import"./cookieStore-BsTWuq-c.js";import"./note-PQ4Q7K1Q.js";import"./react-D0diZGQB.js";import"./array-CrYMH4lO.js";import"./Menu-CHprHwiX.js";import"./useSlotProps-DHT1LlLc.js";import"./resolveComponentProps-C157xaDk.js";import"./useForkRef-Dv2UJ9DH.js";import"./isHostComponent-DVu5iVWx.js";import"./useSlot-C8kuGgOa.js";import"./Paper-Me1pdxeg.js";import"./useTheme-CBx8ayXt.js";import"./useTheme-BMUBEho4.js";import"./Grow-BZpI6Oyo.js";import"./TransitionGroupContext-BoJwzo5i.js";import"./index-BRkj21M-.js";import"./index-BGdoMgps.js";import"./ownerWindow-D3NkLV-w.js";import"./ListContext-C7gjrrzQ.js";import"./MenuItem-B9tsOG0D.js";import"./ButtonBase-WT7DZmCb.js";import"./isFocusVisible-B8k4qzLc.js";import"./dividerClasses-DUoTRvux.js";import"./ListItemText-C2V2I13E.js";import"./Typography--QOf8yBx.js";import"./index-BY9WgCjw.js";import"./extendSxProp-C28V3_VZ.js";import"./createSimplePaletteValueFilter-bm0fmN_7.js";const de={title:"03_1_エディタ下部メニュー/部品/拡大縮小メニュー",component:h,argTypes:{}};x.changeLanguage("ja");const v=f(d("light")),M=f(d("dark")),g=n=>{const t=a.useRef(null),[R,E]=a.useState(null);return a.useEffect(()=>{t.current&&E(t.current)},[]),o.jsxs("div",{children:[o.jsx("div",{ref:t,style:{display:"inline-block",padding:"8px",background:"#eee",marginBottom:"16px"},children:"アンカー要素"}),o.jsx(h,{...n,anchor:R,handleClose:()=>{}})]})},e=g.bind({});e.args={};e.decorators=[n=>o.jsx(u,{theme:v,children:o.jsx(n,{})})];e.storyName="ライトモード";const r=g.bind({});r.args={};r.decorators=[n=>o.jsx(u,{theme:M,children:o.jsx(n,{})})];r.storyName="ダークモード";var i,s,c;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`args => {
  // useRef でアンカー用の div を参照する
  const anchorRef = React.useRef<HTMLDivElement>(null);
  // アンカーエレメントを state で管理
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // コンポーネントのマウント時に、anchorRef.current を state に設定する
  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);
  return <div>
      <div ref={anchorRef} style={{
      display: "inline-block",
      padding: "8px",
      background: "#eee",
      marginBottom: "16px"
    }}>
        アンカー要素
      </div>
      <FooterZoomMenu {...args} anchor={anchorEl} handleClose={() => {}} />
    </div>;
}`,...(c=(s=e.parameters)==null?void 0:s.docs)==null?void 0:c.source}}};var m,p,l;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`args => {
  // useRef でアンカー用の div を参照する
  const anchorRef = React.useRef<HTMLDivElement>(null);
  // アンカーエレメントを state で管理
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  // コンポーネントのマウント時に、anchorRef.current を state に設定する
  React.useEffect(() => {
    if (anchorRef.current) {
      setAnchorEl(anchorRef.current);
    }
  }, []);
  return <div>
      <div ref={anchorRef} style={{
      display: "inline-block",
      padding: "8px",
      background: "#eee",
      marginBottom: "16px"
    }}>
        アンカー要素
      </div>
      <FooterZoomMenu {...args} anchor={anchorEl} handleClose={() => {}} />
    </div>;
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};const ue=["LightMode","DarkMode"];export{r as DarkMode,e as LightMode,ue as __namedExportsOrder,de as default};
