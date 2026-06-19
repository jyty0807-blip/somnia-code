/* SOMNIA Sleep Gear Trio — Tweaks */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fontScale": 100,
  "accent": "#9a7b4f",
  "showStickyBar": true,
  "imageRadius": 24
}/*EDITMODE-END*/;

function SleepGearTweaks(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(()=>{ document.documentElement.style.fontSize = t.fontScale + '%'; },[t.fontScale]);
  React.useEffect(()=>{ document.documentElement.style.setProperty('--accent', t.accent); },[t.accent]);
  React.useEffect(()=>{
    document.querySelectorAll('.shot').forEach(el=>{ el.style.borderRadius = t.imageRadius + 'px'; });
  },[t.imageRadius]);
  React.useEffect(()=>{
    const bar = document.getElementById('stickybar');
    if(bar) bar.style.display = t.showStickyBar ? '' : 'none';
  },[t.showStickyBar]);

  return (
    <TweaksPanel>
      <TweakSection label="타이포그래피" />
      <TweakSlider label="폰트 크기" value={t.fontScale} min={85} max={125} step={5} unit="%"
                   onChange={(v)=>setTweak('fontScale', v)} />
      <TweakSection label="스타일" />
      <TweakColor label="강조색" value={t.accent}
                  options={['#9a7b4f','#6f5b9e','#195B82','#b09b78']}
                  onChange={(v)=>setTweak('accent', v)} />
      <TweakSlider label="이미지 모서리" value={t.imageRadius} min={0} max={36} step={2} unit="px"
                   onChange={(v)=>setTweak('imageRadius', v)} />
      <TweakSection label="레이아웃" />
      <TweakToggle label="하단 구매바" value={t.showStickyBar}
                   onChange={(v)=>setTweak('showStickyBar', v)} />
    </TweaksPanel>
  );
}

(function mount(){
  const root = document.getElementById('tweaks-root');
  if(root && window.ReactDOM && window.useTweaks){
    ReactDOM.createRoot(root).render(<SleepGearTweaks/>);
  } else { setTimeout(mount, 80); }
})();
