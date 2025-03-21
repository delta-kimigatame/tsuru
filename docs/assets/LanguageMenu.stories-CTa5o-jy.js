import{j as o}from"./jsx-runtime-D_zvdyIk.js";import{R as e}from"./index-iNOV5qWA.js";import{i as u}from"./configs-Bv5Ugt3f.js";import{L as m}from"./LanguageMenu-CZsJvc0q.js";import"./useTranslation-C2ldOi4s.js";import"./HeaderMenuItemBase-bxrIR3ky.js";import"./MenuItem-B9tsOG0D.js";import"./generateUtilityClasses-DXwt_ASJ.js";import"./resolveProps-BxfXLv92.js";import"./DefaultPropsProvider-C7n-yi0g.js";import"./createTheme-B5w4ml5n.js";import"./ListContext-C7gjrrzQ.js";import"./useEnhancedEffect-DCkc7bGx.js";import"./useForkRef-Dv2UJ9DH.js";import"./ButtonBase-WT7DZmCb.js";import"./TransitionGroupContext-BoJwzo5i.js";import"./isFocusVisible-B8k4qzLc.js";import"./dividerClasses-DUoTRvux.js";import"./ListItemText-C2V2I13E.js";import"./useSlot-C8kuGgOa.js";import"./resolveComponentProps-C157xaDk.js";import"./Typography--QOf8yBx.js";import"./index-BY9WgCjw.js";import"./extendSxProp-C28V3_VZ.js";import"./useTheme-BMUBEho4.js";import"./useThemeWithoutDefault-CG-nTen1.js";import"./GlobalStyles-cbKtrZEy.js";import"./createSimplePaletteValueFilter-bm0fmN_7.js";import"./Avatar-D_CHx1-x.js";import"./createSvgIcon-j8Re0J7b.js";import"./Logging-BGLwk1OE.js";import"./cookieStore-BsTWuq-c.js";import"./note-PQ4Q7K1Q.js";import"./react-D0diZGQB.js";import"./Menu-CHprHwiX.js";import"./index-BOiXDGkM.js";import"./useSlotProps-DHT1LlLc.js";import"./isHostComponent-DVu5iVWx.js";import"./Paper-Me1pdxeg.js";import"./useTheme-CBx8ayXt.js";import"./Grow-BZpI6Oyo.js";import"./index-BRkj21M-.js";import"./index-BGdoMgps.js";import"./ownerWindow-D3NkLV-w.js";const er={title:"01_ヘッダ/ヘッダ部品/言語メニュー",component:m,argTypes:{}};u.changeLanguage("ja");const l=p=>{const t=e.useRef(null),[s,c]=e.useState(null);return e.useEffect(()=>{t.current&&c(t.current)},[]),o.jsxs("div",{children:[o.jsx("div",{ref:t,style:{display:"inline-block",padding:"8px",background:"#eee",marginBottom:"16px"},children:"アンカー要素"}),o.jsx(m,{...p,anchor:s})]})},r=l.bind({});r.args={onMenuClose:()=>{console.log("Menu closed")}};r.storyName="LanguageMenu のデフォルト表示";var n,i,a;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`args => {
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
      <LanguageMenu {...args} anchor={anchorEl} />
    </div>;
}`,...(a=(i=r.parameters)==null?void 0:i.docs)==null?void 0:a.source}}};const nr=["Default"];export{r as Default,nr as __namedExportsOrder,er as default};
