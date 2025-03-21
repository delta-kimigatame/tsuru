import{j as o}from"./jsx-runtime-D_zvdyIk.js";import{R as i}from"./index-iNOV5qWA.js";import{g as d,T as u}from"./theme-6pAN8qG3.js";import{i as x}from"./configs-ChwAXIEp.js";import{F as h}from"./FooterZoomMenu-CX05PJ9I.js";import{c as f}from"./createTheme-B5w4ml5n.js";import"./resolveProps-BxfXLv92.js";import"./index-BOiXDGkM.js";import"./useThemeWithoutDefault-CG-nTen1.js";import"./DefaultPropsProvider-C7n-yi0g.js";import"./generateUtilityClasses-DXwt_ASJ.js";import"./useEnhancedEffect-DCkc7bGx.js";import"./GlobalStyles-cbKtrZEy.js";import"./useTranslation-C2ldOi4s.js";import"./createSvgIcon-j8Re0J7b.js";import"./Logging-BGLwk1OE.js";import"./cookieStore-BsTWuq-c.js";import"./note-PQ4Q7K1Q.js";import"./react-D0diZGQB.js";import"./array-CrYMH4lO.js";import"./Menu-CPVIqBh5.js";import"./useSlotProps-B_kYJHgD.js";import"./resolveComponentProps-C157xaDk.js";import"./useForkRef-Dv2UJ9DH.js";import"./isHostComponent-DVu5iVWx.js";import"./useSlot-C8kuGgOa.js";import"./Paper-Me1pdxeg.js";import"./useTheme-CBx8ayXt.js";import"./useTheme-BMUBEho4.js";import"./Grow-Cmdnd185.js";import"./utils-BrZ7fP8o.js";import"./TransitionGroupContext-BoJwzo5i.js";import"./index-BRkj21M-.js";import"./index-BGdoMgps.js";import"./ownerDocument-DW-IO8s5.js";import"./ownerWindow-HkKU3E4x.js";import"./debounce-Be36O1Ab.js";import"./Modal-Cd-jXePO.js";import"./ListContext-C7gjrrzQ.js";import"./MenuItem-B9tsOG0D.js";import"./ButtonBase-WT7DZmCb.js";import"./isFocusVisible-B8k4qzLc.js";import"./dividerClasses-DUoTRvux.js";import"./ListItemText-C2V2I13E.js";import"./Typography--QOf8yBx.js";import"./index-BY9WgCjw.js";import"./extendSxProp-C28V3_VZ.js";import"./createSimplePaletteValueFilter-bm0fmN_7.js";const gr={title:"03_1_エディタ下部メニュー/部品/拡大縮小メニュー",component:h,argTypes:{}};x.changeLanguage("ja");const v=f(d("light")),M=f(d("dark")),g=t=>{const n=i.useRef(null),[R,E]=i.useState(null);return i.useEffect(()=>{n.current&&E(n.current)},[]),o.jsxs("div",{children:[o.jsx("div",{ref:n,style:{display:"inline-block",padding:"8px",background:"#eee",marginBottom:"16px"},children:"アンカー要素"}),o.jsx(h,{...t,anchor:R,handleClose:()=>{}})]})},r=g.bind({});r.args={};r.decorators=[t=>o.jsx(u,{theme:v,children:o.jsx(t,{})})];r.storyName="ライトモード";const e=g.bind({});e.args={};e.decorators=[t=>o.jsx(u,{theme:M,children:o.jsx(t,{})})];e.storyName="ダークモード";var a,s,m;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`args => {
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
  return <div>\r
      <div ref={anchorRef} style={{
      display: "inline-block",
      padding: "8px",
      background: "#eee",
      marginBottom: "16px"
    }}>\r
        アンカー要素\r
      </div>\r
      <FooterZoomMenu {...args} anchor={anchorEl} handleClose={() => {}} />\r
    </div>;
}`,...(m=(s=r.parameters)==null?void 0:s.docs)==null?void 0:m.source}}};var c,p,l;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`args => {
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
  return <div>\r
      <div ref={anchorRef} style={{
      display: "inline-block",
      padding: "8px",
      background: "#eee",
      marginBottom: "16px"
    }}>\r
        アンカー要素\r
      </div>\r
      <FooterZoomMenu {...args} anchor={anchorEl} handleClose={() => {}} />\r
    </div>;
}`,...(l=(p=e.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};const Rr=["LightMode","DarkMode"];export{e as DarkMode,r as LightMode,Rr as __namedExportsOrder,gr as default};
