/* SOMNIA — purchase-window product detail (bilingual)
   Based on SOMNIA 구매창 상품정보. Legal-safe wording:
   routine / wind-down language, no medical/insomnia claims. */
window.SOMNIA_PRODUCTS = {
  jelly: {
    position:{ ko:'잠들기 전 30분, 달콤하게 시작하는 나이트 루틴 젤리.',
               en:'A sweet night-routine jelly for the 30 minutes before bed.' },
    oneLiner:{ ko:'잠들기 전 30분, 하루를 차분하게 마무리하는 수면 루틴 젤리.',
               en:'Wind down the 30 minutes before sleep with a calm nightly ritual.' },
    desc:{ ko:'바쁜 하루 끝에 몸과 마음을 천천히 내려놓을 수 있도록 설계한 나이트 루틴 제품입니다. 간편한 개별 섭취 형태로 침대 옆, 파우치, 여행 가방에 두고 매일 밤 같은 시간에 사용할 수 있습니다.',
           en:'Designed to help you set down body and mind at the end of a busy day. The single-serve format fits by your bed, in a pouch, or a travel bag — for the same time every night.' },
    useTime:{ ko:'잠들기 30분 전', en:'30 min before sleep' },
    optionLabel:{ ko:'맛 선택', en:'Choose a flavor' },
    options:[
      { id:'berry', name:{ko:'Moon Berry',en:'Moon Berry'}, color:'#1f4d74',
        mood:{ko:'블루베리 · 라벤더 무드',en:'Blueberry · lavender mood'},
        caption:{ko:'잔잔한 베리 향으로 하루를 천천히 정리하는 밤.',en:'A berry note that gently closes the day.'} },
      { id:'grape', name:{ko:'Deep Night Grape',en:'Deep Night Grape'}, color:'#6E5BCB',
        mood:{ko:'포도 · 캐모마일 무드',en:'Grape · chamomile mood'},
        caption:{ko:'깊은 보랏빛 무드로 잠들기 전 시간을 부드럽게.',en:'A deep violet mood that softens the hour before bed.'} },
      { id:'vanilla', name:{ko:'Vanilla Moon',en:'Vanilla Moon'}, color:'#d9c9a3',
        mood:{ko:'바닐라 · 우유향 무드',en:'Vanilla · milk mood'},
        caption:{ko:'포근한 바닐라 무드로 침실의 온도를 낮추는 젤리.',en:'A warm vanilla mood that lowers the room.'} },
    ],
    features:{ ko:['잠들기 전 같은 시간 루틴화','휴대 간편한 개별 섭취 형태','앱 수면 루틴과 연동 체크'],
               en:['Builds a same-time nightly habit','Portable single-serve format','Syncs with the app sleep routine'] },
    spec:{ ko:'30 젤리 · 1일 1개 기준 약 30일분', en:'30 jellies · ~30 days at 1/day' },
    howto:{ ko:['잠들기 약 30분 전 1개를 섭취합니다.','섭취 후 조명을 낮추고 화면 사용을 줄입니다.','앱에서 오늘의 루틴을 체크합니다.'],
            en:['Take one about 30 min before bed.','Dim the lights and reduce screen time.','Check tonight’s routine in the app.'] },
    bundles:[
      { name:{ko:'Dream Jelly 3 Flavor Set',en:'Dream Jelly 3 Flavor Set'},
        desc:{ko:'세 가지 무드를 번갈아 경험하는 30일 나이트 루틴 세트.',en:'Three moods across a 30-day night routine.'} },
    ],
  },
  spray: {
    position:{ ko:'잠들기 전 침실의 공기를 차분하게 정리하는 아로마 룸 스프레이.',
               en:'An aroma room spray that calms the bedroom air before sleep.' },
    oneLiner:{ ko:'라벤더, 캐모마일, 시더우드가 어우러진 잠들기 전 침실 아로마 스프레이.',
               en:'Lavender, chamomile and cedarwood for the bedroom before bed.' },
    desc:{ ko:'잠들기 전 침실의 분위기를 차분하게 바꾸기 위한 SOMNIA의 나이트 리추얼 제품입니다. 베개, 침구 주변, 커튼, 침실 공간에 가볍게 분사해 하루의 긴장을 낮추고 조용한 밤의 무드를 만들어줍니다.',
           en:'A SOMNIA night ritual to shift the bedroom mood. Mist lightly over pillows, bedding, curtains and the room to ease the day’s tension into a quiet night.' },
    useTime:{ ko:'잠들기 10~20분 전', en:'10–20 min before sleep' },
    optionLabel:{ ko:'향', en:'Scent' },
    options:[
      { id:'sleepwell', name:{ko:'Sleep Well',en:'Sleep Well'}, color:'#6E5BCB',
        mood:{ko:'라벤더 · 캐모마일 · 시더우드',en:'Lavender · chamomile · cedarwood'},
        caption:{ko:'차분하고 부드러운 우디 · 포근한 무드.',en:'Calm, soft, woody and cozy.'} },
    ],
    features:{ ko:['Lavender · Chamomile · Cedarwood','차분한 · 부드러운 · 우디한 무드','침실 · 베개 · 커튼 · 패브릭 주변'],
               en:['Lavender · chamomile · cedarwood','Calm, soft, woody mood','Bedroom · pillow · curtain · fabric'] },
    spec:{ ko:'100ml / 3.38 fl. oz.', en:'100ml / 3.38 fl. oz.' },
    howto:{ ko:['사용 전 가볍게 흔듭니다.','베개·침구에서 20~30cm 떨어져 1~2회 분사합니다.','피부에 직접 분사하지 않고 환기된 공간에서 사용합니다.','5~10분 후 향이 자리 잡으면 취침합니다.','앱에서 “침실 향기 루틴”을 체크합니다.'],
            en:['Shake gently before use.','Mist 1–2 times from 20–30cm above pillow/bedding.','Avoid skin; use in a ventilated space.','Rest 5–10 min as the scent settles.','Check the “bedroom scent routine” in the app.'] },
    cautions:{ ko:['피부나 얼굴에 직접 분사하지 마세요.','눈에 들어가지 않도록 주의하세요.','영유아·반려동물의 손이 닿지 않는 곳에 보관하세요.','가죽·원목·실크·밝은 섬유에는 직접 분사를 피하세요.','화기·고온·직사광선을 피해 보관하세요.'],
               en:['Do not spray directly on skin or face.','Keep away from eyes.','Store out of reach of children and pets.','Avoid leather, wood, silk and light fabrics.','Keep away from flame, heat and direct sun.'] },
    bundles:[
      { name:{ko:'Deep Night Routine Set',en:'Deep Night Routine Set'},
        desc:{ko:'룸 스프레이 + 드림 젤리 1종 + 수면 안대.',en:'Spray + 1 jelly + a sleep mask.'} },
    ],
  },
  mask: {
    position:{ ko:'빛을 완벽히 차단해 깊은 휴식을 돕는 프리미엄 수면 안대.',
               en:'A premium sleep mask that blocks light for deeper rest.' },
    oneLiner:{ ko:'코끝까지 밀착되는 빛 차단 설계와 에어쿠션으로 편안한 나이트 안대.',
               en:'Nose-hugging blackout design with an air-cushion for a comfortable night.' },
    desc:{ ko:'SOMNIA 프리미엄 수면 안대는 인체공학적 코 곡선 설계로 외부 빛을 효과적으로 차단하고, 눈 주변을 부드럽게 감싸는 에어코튼 쿠션으로 눈 압박 없이 편안한 착용감을 제공합니다. 부드러운 벨벳 소재와 메모리폼으로 장시간 착용에도 편안합니다.',
           en:'An ergonomic nose-curve blocks outside light, while an air-cotton cushion wraps the eyes without pressure. Soft velvet and memory foam keep it comfortable through the night.' },
    useTime:{ ko:'취침 시', en:'At bedtime' },
    features:{ ko:['코끝까지 밀착되는 빛 완벽 차단 구조','눈 압박 없는 에어코튼 쿠션 설계','52~68cm 사이즈 조절 밴드','부드러운 벨벳 + 메모리폼 소재','중앙 달 심볼 자수 디테일'],
               en:['Nose-hugging full blackout structure','Pressure-free air-cotton cushion','Adjustable 52–68cm band','Soft velvet with memory foam','Embroidered moon-symbol detail'] },
    spec:{ ko:'가로 22.5 × 세로 10cm · 밴드 52~68cm 조절', en:'22.5 × 10cm · 52–68cm adjustable band' },
    howto:{ ko:['밴드 길이를 머리 둘레에 맞게 조절합니다.','코 부분 곡선을 콧대에 맞춰 빛을 차단합니다.','조명을 끄고 편안하게 휴식합니다.','앱에서 오늘의 나이트 루틴을 체크합니다.'],
            en:['Adjust the band to fit your head.','Align the nose curve to block the light.','Turn off the lights and rest.','Check tonight’s routine in the app.'] },
    cautions:{ ko:['미지근한 물에 중성세제로 가볍게 손세탁을 권장합니다.','표백제는 원단 손상·변색의 원인이 될 수 있어 사용을 금합니다.','직사광선을 피해 그늘에서 자연 건조하세요.','고온 변형·수축이 생길 수 있어 건조기 사용을 금합니다.','세탁기 사용 시 세탁망에 넣어 울코스 또는 약한 코스로 세탁하세요.'],
               en:['Hand-wash gently in lukewarm water with mild detergent.','Do not bleach — it may damage or discolor the fabric.','Dry naturally in the shade, away from direct sun.','Do not tumble-dry; heat may deform or shrink it.','If machine-washing, use a laundry net on a wool/delicate cycle.'] },
    bundles:[
      { name:{ko:'Deep Night Routine Set',en:'Deep Night Routine Set'},
        desc:{ko:'아로마 룸 스프레이 + 드림 젤리 1종 + 수면 안대 구성.',en:'Room spray + 1 jelly + the sleep mask.'} },
    ],
  },
};

/* legal-safe common notice */
window.SOMNIA_NOTICE = {
  ko:['본 제품은 질병의 예방·치료를 위한 의약품이 아닙니다.','개인의 생활 습관과 컨디션에 따라 체감은 달라질 수 있습니다.','임산부·수유부·질환 보유자·의약품 복용자는 구매 전 전문가와 상담을 권장합니다.'],
  en:['This is not a medicine for the prevention or treatment of disease.','Experience may vary with lifestyle and condition.','If pregnant, nursing, with a condition, or on medication, consult a professional before purchase.'],
};
