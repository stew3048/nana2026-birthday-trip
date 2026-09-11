import { BirthdayTripData } from './types';
import { DEFAULT_TAINAN_SNACKS } from './lib/firebase';

// Preset 1: 晴寶專屬生日 10/16~10/18 台南煙波大飯店 浪漫3天2夜之旅
export const tainanBirthdayPreset: BirthdayTripData = {
  version: '1.0.0',
  settings: {
    id: 'tainan-qingbao-birthday',
    tripTitle: '⭐ 晴寶2026生日專屬之旅',
    girlfriendName: '晴寶 ⭐',
    boyfriendName: '蔡寶 🙋‍♂️',
    destination: '台南 Tainan',
    startDate: '2026-10-16',
    endDate: '2026-10-18',
    coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    romanticThemeColor: 'rose',
    secretModePassword: '1017',
    boyfriendEmail: 'stew3048@gmail.com',
    girlfriendEmail: 'sng828388@gmail.com',
    customNotes: '親愛的晴寶，祝妳 10/17 生日快樂！這次 3 天 2 夜台南之旅全程為妳量身打造，蔡寶專屬司機＋攝影師＋專屬密醫為您服務～'
  },
  itinerary: [
    {
      id: 'day-1',
      dayNumber: 1,
      date: '2026-10-16',
      themeTitle: 'Day 1 (五): 奔向府城的浪漫序曲 · 煙波入住與極致三溫暖放鬆夜',
      dayDescription: '蔡寶週五請半天假，開車載著晴寶從台中出發！入住台南煙波大飯店，享用精緻晚餐，晚上運動泡三溫暖，還有深夜的甜蜜專屬互動～',
      weatherForecast: '晴朗微風 26°C / 舒適宜人',
      todayOutfitTip: '休閒舒適車程穿搭，晚上可換上自在輕便服裝享受飯店三溫暖與健身房。',
      activities: [
        {
          id: 'act-1-1',
          time: '15:00 - 17:00',
          title: '🚗 蔡寶請半天假！台中公司甜蜜出發直奔台南',
          category: 'transit',
          location: '台中出發 ➡️ 國道一號南下 ➡️ 台南',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Lakeshore+Hotel+Tainan',
          description: '放好晴寶的行李，播放晴寶專屬歌單，蔡寶專屬司機一路穩穩載著最愛的寶貝南下。',
          notes: '車上備妥晴寶喜歡的零食與無糖茶飲 🥤'
        },
        {
          id: 'act-1-2',
          time: '17:00 - 18:00',
          title: '🏨 抵達「台南煙波大飯店」辦理入住 Check-in',
          category: 'hotel',
          location: '台南市中西區永華路一段268號',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Lakeshore+Hotel+Tainan',
          description: '入住台南煙波大飯店高質感客房，地處中西區核心，擁有頂級水療三溫暖與戶外露天泳池。',
          notes: '已預約 2 晚尊榮客房，備註壽星慶生佈置與貼心備品 🎁'
        },
        {
          id: 'act-1-3',
          time: '18:00 - 18:30',
          title: '🔔 [即時通知] 晚餐時間到囉！請準備好最棒的心情享用浪漫晚餐 🍽️💖',
          category: 'birthday_surprise',
          location: '煙波大飯店 房內準備',
          description: '手機彈出專屬通知提示！晴寶稍微補妝整理，與蔡寶牽手前往餐廳。',
          isSecretSurprise: true,
          surpriseHint: '晚上 18:00 專屬系統彈跳浪漫提醒通知 📱'
        },
        {
          id: 'act-1-4',
          time: '18:30 - 20:15',
          title: '🍽️ 煙波大飯店「隱糧義式餐酒館」浪漫精緻晚餐',
          category: 'dining',
          location: '煙波大飯店 1F 隱糧義式餐酒館',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Secret+and+Senses+Restaurant+Tainan',
          description: '品嚐主廚特製手工義大利麵、窯烤披薩與炭烤嫩煎排餐，在溫馨氣氛下享受第一晚的愜意時光。',
          notes: '已訂位 18:30 雙人用餐，悠閒享用美食'
        },
        {
          id: 'act-1-5',
          time: '20:30 - 22:30',
          title: '🧖‍♀️ 煙波男女三溫暖水療放鬆 (可先至健身房運動動一動)',
          category: 'relax',
          location: '煙波大飯店 俱樂部設施',
          description: '享受煙波著名的冷熱水療池、蒸氣室與烤箱，洗淨一週的工作疲倦，全身舒暢暖呼呼。',
          notes: '飯店設施開放至 22:30，三溫暖設施男女分開，純放鬆享受'
        },
        {
          id: 'act-1-6',
          time: '23:00 - 24:00',
          title: '🩺💖 [專屬深夜情趣提醒] 洗完澡了～進入「密醫看診時間」！',
          category: 'birthday_surprise',
          location: '煙波大飯店 浪漫客房',
          description: '洗完澡後，專屬蔡醫師準備就緒！為晴寶量身定制全身筋骨推拿＋甜蜜舒壓身心靈療程 🩺💊💖',
          isSecretSurprise: true,
          surpriseHint: '深夜 23:00 專屬甜蜜看診通知彈出，蔡醫師甜蜜特診中 🩺'
        }
      ]
    },
    {
      id: 'day-2',
      dayNumber: 2,
      date: '2026-10-17',
      themeTitle: 'Day 2 (六): 🎂 晴寶專屬生日大日子！水療手作、密室逃脫與法式奢華盛宴',
      dayDescription: '晴寶生日當天！享用煙波豐盛早餐、水療泳池玩水放鬆、手作皮革敲下專屬姓名紀念、密室逃脫默契挑戰，晚上享用頂級法式慶生大餐！',
      weatherForecast: '陽光明媚 27°C / 最適合慶生拍照',
      todayOutfitTip: '早上泳裝玩水，午後換上晴寶最仙氣的生日小禮服/氣質洋裝，今晚是妳最美的主場！',
      activities: [
        {
          id: 'act-2-1',
          time: '08:30 - 09:45',
          title: '🥐 煙波大飯店「隱糧」超豐盛自助早餐',
          category: 'dining',
          location: '煙波大飯店 1F',
          description: '全台著名的煙波早堂！品嚐現煮台南牛肉湯、府城鹹粥、現煎歐姆蛋與豐富烘焙甜點。',
          notes: '早餐憑房卡入座，補滿活力一整天！'
        },
        {
          id: 'act-2-2',
          time: '10:00 - 12:00',
          title: '🏊‍♀️ 煙波戶外水療露天泳池 玩水放鬆 & 拍美照',
          category: 'relax',
          location: '煙波大飯店 露天泳池水療區',
          description: '在台南暖陽下游泳戲水、躺在躺椅上吹微風放空，蔡寶負責幫晴寶拍仙氣美照～',
          notes: '12:00 回房梳洗吹整，換上美美的生日慶生穿搭 ✨'
        },
        {
          id: 'act-2-3',
          time: '13:00 - 14:30',
          title: '🔨 台南質感手作皮革體驗 · 親手敲印專屬紀念',
          category: 'sightseeing',
          location: '台南文創手作工坊 / 藍晒圖文創園區',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Tainan+Leather+Craft+Studio',
          description: '蔡寶與晴寶一起親手裁切、打孔、縫線，並敲印下兩人的專屬姓名縮寫與「2026.10.17」紀念皮革鑰匙圈/證件套。',
          notes: '已預約 13:00 雙人手作體驗課程 🎁'
        },
        {
          id: 'act-2-4',
          time: '15:00 - 16:30',
          title: '🗝️ 台南密室逃脫挑戰 · 腦力激盪與默契大考驗',
          category: 'sightseeing',
          location: '台南熱門密室逃脫館 (神不在場 / 笨蛋工作室)',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Tainan+Escape+Room',
          description: '兩人攜手破解謎題、尋找隱藏線索！蔡寶全程當晴寶的智囊團與護花使者，一起成功逃脫！',
          notes: '已預約 15:00 場次主題密室 🕵️‍♂️🕵️‍♀️'
        },
        {
          id: 'act-2-5',
          time: '18:00 - 20:15',
          title: '🎂 晴寶生日法式浪漫奢華晚餐 · 主廚客製寫字盤驚喜',
          category: 'dining',
          location: '台南頂級法式料理 (尼法法式餐廳 / 轉角法式餐廳)',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Nephi+French+Restaurant+Tainan',
          description: '在極致優雅的法式餐廳享用主廚精選無菜單料理，壓軸送上寫著「Happy Birthday 晴寶 💕」的手繪慶生甜點盤與點燃蠟燭許願！',
          isSecretSurprise: true,
          surpriseHint: '預約已備註女友生日、高檔紅酒/香檳開瓶、主廚客製生日祝福盤 🍓🥂'
        },
        {
          id: 'act-2-6',
          time: '20:30 - 22:30',
          title: '✨ 飯後回到煙波飯店享受三溫暖 / 房內香檳微醺慶生夜',
          category: 'relax',
          location: '煙波大飯店 房內 & 三溫暖',
          description: '回到飯店再去泡一次暖呼呼的三溫暖，回到房間開香檳小酌，送上蔡寶準備的生日秘密卡片與禮物。',
          notes: '晴寶生日快樂！今晚妳是全宇宙最幸福的小仙女 💖'
        }
      ]
    },
    {
      id: 'day-3',
      dayNumber: 3,
      date: '2026-10-18',
      themeTitle: 'Day 3 (日): 🍜 晴寶小吃票選巡禮 · 奇美木乃伊VR科技展 · 蔡寶私心燒肉大餐',
      dayDescription: '早上由晴寶在 Web 上即時票選的小吃清單開吃！下午參觀奇美博物館埃及木乃伊展與沉浸式 VR，晚上由蔡寶敲碗已久的頂級燒肉盛宴壓軸，心滿意足回台中！',
      weatherForecast: '秋高氣爽 26°C / 完美出遊日',
      todayOutfitTip: '知性休閒氣質風，適合在奇美博物館戶外阿波羅噴泉與館內拍美照。',
      activities: [
        {
          id: 'act-3-1',
          time: '09:30 - 12:30',
          title: '🍜 晴寶特選：台南在地小吃美食巡禮 (依即時投票清單！)',
          category: 'dining',
          location: '台南國華街 / 正興街 / 保安路商圈',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Guohua+Street+Tainan',
          description: '跟著晴寶在網頁上打勾票選的小吃清單出發！溫體牛肉湯、邱家小卷米粉、矮仔成蝦仁飯、鱔魚意麵、白糖粿、義豐冬瓜茶一路吃透透！',
          notes: '可打開「晴寶小吃心願選單」即時打勾標記！即時連線 Firebase 記錄 🟢'
        },
        {
          id: 'act-3-2',
          time: '13:30 - 16:30',
          title: '🏛️ 奇美博物館 · 埃及木乃伊常設展 ＆ 沉浸式 VR 科技互動體驗',
          category: 'sightseeing',
          location: '台南市仁德區文華路二段66號 (奇美博物館)',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Chimei+Museum',
          description: '漫步如歐洲宮廷般的奇美博物館，參觀珍貴的古埃及木乃伊與世界級樂器兵器展，戴上 VR 眼鏡體驗沉浸式虛擬科技展演！',
          notes: '已預約 13:30 門票＋特展 VR 科技體驗 🥽'
        },
        {
          id: 'act-3-3',
          time: '18:00 - 20:00',
          title: '🥩🔥 蔡寶私心敲碗已久的頂級燒肉盛宴！大口吃和牛慶祝',
          category: 'dining',
          location: '台南頂級燒肉 (碳佐麻里 精品燒肉 / 燒肉同話)',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Tanzuomali+Boutique+Yakiniku+Tainan',
          description: '蔡寶一直心心念念想吃的頂級燒肉！點滿極上 A5 和牛、厚切牛舌、伊比利豬與海鮮拼盤，炭火滋滋作響，大口滿足！',
          notes: '已預約 18:00 雙人座位，作為這趟慶生之旅的最完美壓軸！'
        },
        {
          id: 'act-3-4',
          time: '20:30 - 22:30',
          title: '🏡 滿載回憶與晴寶笑容，開車平安回程溫暖台中',
          category: 'transit',
          location: '台南 ➡️ 國道一號北上 ➡️ 台中溫馨的家',
          description: '車上聊著這三天兩夜的滿滿趣事與回憶，蔡寶把晴寶平安送回家，晴寶生日之旅大圓滿！',
          notes: '回家後記得好好休息，期待下一次的兩人旅行 💕'
        }
      ]
    }
  ],
  surprises: [
    {
      id: 'surp-1',
      title: '煙波大飯店 18:00 專屬晚餐通知 ＆ 隱糧浪漫晚餐',
      timing: 'Day 1 晚上 18:00',
      location: '台南煙波大飯店 1F 隱糧義式餐酒館',
      description: '手機準時彈出浪漫通知，為晴寶拉開台南慶生假期的甜蜜序幕！享用現烤披薩與熟成牛排。',
      isUnlocked: false,
      unlockCode: '1017',
      hint: '第一天傍晚的浪漫驚喜晚餐提醒 🍽️',
      category: 'cake'
    },
    {
      id: 'surp-2',
      title: '深夜 23:00 密醫看診時間 🩺 蔡醫師專屬身心靈放鬆推拿',
      timing: 'Day 1 深夜 23:00',
      location: '煙波大飯店 浪漫客房內',
      description: '洗完澡後準時開診！蔡醫師準備了專屬芳香精油與肩頸推拿手法，為壽星晴寶進行全套舒壓放鬆看診～',
      isUnlocked: false,
      unlockCode: '1017',
      hint: '第一天深夜洗完澡後的專屬情趣互動 🩺💊',
      category: 'activity'
    },
    {
      id: 'surp-3',
      title: '10/17 壽星跨日整點 🎂 蔡寶親手寫的真情告白卡片 ＆ 秘密大禮盒',
      timing: 'Day 2 00:00 (跨日整點)',
      location: '煙波大飯店 客房床頭',
      description: '跨入 10/17 生日大日子的那一刻！蔡寶送上寫滿這一年感謝與愛意的手寫信，以及藏在包包深處的夢幻禮物。',
      isUnlocked: false,
      unlockCode: 'LOVE',
      hint: '10/17 00:00 壽星跨日整點真情告白信與禮物 🎁',
      category: 'gift'
    },
    {
      id: 'surp-4',
      title: '密室逃脫通關特務挑戰 🗝️ 考驗兩人默契的冒險時刻',
      timing: 'Day 2 下午 15:00',
      location: '台南熱門密室逃脫館',
      description: '兩人攜手破解謎題、尋找隱藏線索！蔡寶全程當晴寶的智囊團與護花使者，一起漂亮通關！',
      isUnlocked: false,
      unlockCode: '1017',
      hint: '第二天下午考驗兩人默契與智力的特務冒險 🕵️‍♀️',
      category: 'activity'
    },
    {
      id: 'surp-5',
      title: '法式餐廳 10/17 晴寶生日客製手繪寫字盤 ＆ 點蠟燭許願',
      timing: 'Day 2 晚上 18:00',
      location: '台南頂級法式料理餐廳',
      description: '主廚客製刻有晴寶名字與浪漫祝詞的手工甜點盤，全場燭光下為晴寶唱生日快樂歌並許下願望！',
      isUnlocked: false,
      unlockCode: '1017',
      hint: '生日當晚的法式甜點燭光浪漫時刻 🕯️🎂',
      category: 'cake'
    },
    {
      id: 'surp-6',
      title: '蔡寶私心敲碗已久的頂級燒肉盛宴 🥩 大口吃和牛慶祝',
      timing: 'Day 3 晚上 18:00',
      location: '碳佐麻里 精品燒肉',
      description: '蔡寶一直心心念念想吃的頂級燒肉！極上 A5 和牛、厚切牛舌與炭火香氣，為慶生假期畫下最美味的驚嘆號！',
      isUnlocked: false,
      unlockCode: '1017',
      hint: '第三天晚上的滋滋炭火極上燒肉慶功宴 🥩🔥',
      category: 'activity'
    }
  ],
  dining: [
    {
      id: 'din-1',
      name: '台南煙波大飯店 隱糧義式餐酒館 (Secret and Senses)',
      category: 'restaurant',
      status: 'confirmed',
      dateTime: '2026-10-16 18:30',
      location: '台南市中西區永華路一段268號 (煙波大飯店1F)',
      locationUrl: 'https://www.google.com/maps/search/?api=1&query=Secret+and+Senses+Restaurant+Tainan',
      bookingCode: 'LAKE-1016',
      specialRequest: '靠窗舒適座位，慶生用餐',
      mustEatDishes: '手工松露牛肝菌燉飯、爐烤熟成牛排、窯烤瑪格麗特披薩'
    },
    {
      id: 'din-2',
      name: '煙波大飯店 煙波早堂超豐盛自助早餐',
      category: 'restaurant',
      status: 'confirmed',
      dateTime: '2026-10-17 08:30',
      location: '煙波大飯店 1F 隱糧',
      mustEatDishes: '現沖粉嫩溫體牛肉湯、府城台南鹹粥、現煎歐姆蛋'
    },
    {
      id: 'din-3',
      name: '法式浪漫奢華生日晚餐 (尼法法式料理 / 轉角餐廳)',
      category: 'restaurant',
      status: 'confirmed',
      dateTime: '2026-10-17 18:00',
      location: '台南市東區/北區',
      bookingCode: 'FRENCH-1017',
      specialRequest: '已備註晴寶生日＋客製手繪寫字盤＋香檳慶祝',
      mustEatDishes: '法式嫩煎頂級菲力佐紅酒松露醬、經典法式烤布蕾、主廚特製生日甜點'
    },
    {
      id: 'din-4',
      name: '晴寶特選：台南道地小吃美食巡禮',
      category: 'street_food',
      status: 'confirmed',
      dateTime: '2026-10-18 09:30',
      location: '台南中西區國華街/保安路',
      mustEatDishes: '溫體牛肉湯、邱家小卷米粉、矮仔成蝦仁飯、鱔魚意麵、白糖粿'
    },
    {
      id: 'din-5',
      name: '碳佐麻里 精品燒肉 (蔡寶私心指定燒肉！)',
      category: 'restaurant',
      status: 'confirmed',
      dateTime: '2026-10-18 18:00',
      location: '台南市中華西路二段',
      bookingCode: 'YAKI-1018',
      specialRequest: '雙人景觀包廂坐席',
      mustEatDishes: '極上 A5 日本和牛燒肉盛合、厚切特選牛舌佐蔥鹽、伊比利黑豬肉、蒜香石鍋拌飯'
    }
  ],
  packingList: [
    {
      id: 'pack-1',
      name: '晴寶美美泳裝 & 拍照太陽眼鏡 (煙波泳池玩水必備)',
      category: 'outfits',
      isChecked: true,
      isSweetheartSpecial: true,
      note: 'Day 2 早上水療泳池拍照'
    },
    {
      id: 'pack-2',
      name: '晴寶生日仙氣洋裝 / 小禮服 (Day 2 法式慶生晚餐穿)',
      category: 'outfits',
      isChecked: true,
      isSweetheartSpecial: true,
      note: '壽星專屬最美戰袍 ✨'
    },
    {
      id: 'pack-3',
      name: '貼心暖男隨身包 (止痛藥、防蚊液、隨身面紙、濕紙巾)',
      category: 'sweetheart_care',
      isChecked: true,
      isSweetheartSpecial: true,
      note: '蔡寶隨身背包攜帶，照顧晴寶無微不至'
    },
    {
      id: 'pack-4',
      name: '隨身補光自拍棒 & 拍立得相機 (含兩盒粉彩底片)',
      category: 'electronics',
      isChecked: true,
      isSweetheartSpecial: true,
      note: '隨時捕捉晴寶最可愛的笑容 📸'
    },
    {
      id: 'pack-5',
      name: '20000mAh 快充行動電源 (充飽電兩顆)',
      category: 'electronics',
      isChecked: true,
      isSweetheartSpecial: false,
      note: '整天在奇美博物館跟密室逃脫拍照不怕沒電'
    },
    {
      id: 'pack-6',
      name: '晴寶保濕保養品、面膜 & 護唇膏 (泡完三溫暖敷臉)',
      category: 'cosmetics',
      isChecked: false,
      isSweetheartSpecial: true,
      note: '煙波三溫暖後敷面膜最水嫩'
    },
    {
      id: 'pack-7',
      name: '雙人健保卡 & 身份證件 (蔡寶保管)',
      category: 'documents',
      isChecked: true,
      isSweetheartSpecial: false
    },
    {
      id: 'pack-8',
      name: '舒適好走休閒鞋 (逛國華街吃小吃與奇美博物館漫步)',
      category: 'outfits',
      isChecked: true,
      isSweetheartSpecial: false
    }
  ],
  expenses: [
    {
      id: 'exp-1',
      title: '台南煙波大飯店 尊榮客房 2 晚 (含雙人早餐 & 三溫暖泳池)',
      category: 'hotel',
      amount: 9600,
      currency: 'TWD',
      date: '2026-09-10',
      isPaidByBoyfriend: true,
      notes: '10/16~10/18 兩晚住宿，蔡寶全額支付'
    },
    {
      id: 'exp-2',
      title: '煙波大飯店 隱糧義式雙人晚餐 (Day 1)',
      category: 'food',
      amount: 2200,
      currency: 'TWD',
      date: '2026-10-16',
      isPaidByBoyfriend: true
    },
    {
      id: 'exp-3',
      title: '台南手作皮革體驗 雙人課程費用 (Day 2)',
      category: 'tickets',
      amount: 1800,
      currency: 'TWD',
      date: '2026-09-20',
      isPaidByBoyfriend: true,
      notes: '親手敲製專屬紀念皮革'
    },
    {
      id: 'exp-4',
      title: '台南密室逃脫 雙人挑戰門票 (Day 2)',
      category: 'tickets',
      amount: 1400,
      currency: 'TWD',
      date: '2026-09-22',
      isPaidByBoyfriend: true
    },
    {
      id: 'exp-5',
      title: '晴寶生日法式奢華浪漫雙人晚餐 ＆ 客製蛋糕 (Day 2)',
      category: 'food',
      amount: 5800,
      currency: 'TWD',
      date: '2026-10-17',
      isPaidByBoyfriend: true,
      notes: '10/17 晴寶生日大餐'
    },
    {
      id: 'exp-6',
      title: '奇美博物館 雙人門票 ＆ 埃及特展沉浸式 VR 體驗 (Day 3)',
      category: 'tickets',
      amount: 1200,
      currency: 'TWD',
      date: '2026-09-25',
      isPaidByBoyfriend: true
    },
    {
      id: 'exp-7',
      title: '碳佐麻里 精品燒肉 A5 和牛大餐 (Day 3 蔡寶私心燒肉)',
      category: 'food',
      amount: 4600,
      currency: 'TWD',
      date: '2026-10-18',
      isPaidByBoyfriend: true,
      notes: '旅程完美結尾盛宴'
    },
    {
      id: 'exp-8',
      title: '秘密生日禮物 ＆ 精美手寫卡片',
      category: 'gifts',
      amount: 8800,
      currency: 'TWD',
      date: '2026-10-10',
      isPaidByBoyfriend: true,
      notes: '晴寶夢寐以求的心願禮物 🎁'
    }
  ],
  photos: [
    {
      id: 'photo-1',
      title: '10/17 祝我最愛的晴寶 生日快樂 🎂',
      date: '2026.10.17',
      caption: '看著妳笑得眼睛瞇瞇的樣子，就是蔡寶心裡全世界最美的風景。',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      location: '台南煙波大飯店',
      tag: '生日快樂'
    },
    {
      id: 'photo-2',
      title: '手牽手漫步奇美博物館與府城巷弄',
      date: '2026.10.18',
      caption: '牽著妳的手走過府城街道，吃遍所有美味小吃，有妳在的每一刻都好甜。',
      imageUrl: 'https://images.unsplash.com/photo-1513279922550-250c2129b13a?auto=format&fit=crop&w=800&q=80',
      location: '奇美博物館',
      tag: '甜蜜足跡'
    },
    {
      id: 'photo-3',
      title: '專屬密醫與最可愛病患的日常 🩺💖',
      date: '2026.10.16',
      caption: '蔡醫師保證一輩子給妳 VIP 特等照護，每天都要讓晴寶開開心心！',
      imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      location: '煙波浪漫客房',
      tag: '專屬密醫'
    }
  ],
  loveLetter: {
    recipientName: '我最親愛的小仙女 晴寶 💖',
    authorName: '永遠守護妳、最愛妳的 蔡寶 💌',
    title: 'Happy Birthday My Queen! 給晴寶的專屬生日告白',
    openingText: '親愛的晴寶：',
    bodyParagraphs: [
      '10/17 祝我全世界最可愛的女孩生日快樂！又陪伴妳度過了一年，謝謝妳走進我的生命裡，讓我的每一天都充滿了陽光、歡笑與滿滿的幸福。',
      '我知道妳平常很辛苦、很努力。這趟台南煙波大飯店 3 天 2 夜之旅，是我花了很多心思為妳準備的專屬放鬆假期。從舒適的煙波客房、三溫暖水療、專屬手作皮革、刺激有趣的密室逃脫，到法式慶生大餐與妳愛的小吃美食，全部都打點好了！',
      '妳只要帶著最放鬆的心情和最美的笑容，其他一切都有蔡司機、蔡攝影師與蔡密醫替妳打理妥當！',
      '謝謝妳給我的溫柔與包容，未來的每一年生日，我都想牽著妳的手，一起看更多的風景，吃更多的美食，一直一直寵著妳。'
    ],
    closingText: '祝最棒的晴寶 生日快樂！永遠愛妳 💕',
    musicAutoPlay: true
  },
  snacks: DEFAULT_TAINAN_SNACKS
};

// Preset 2: 東京 & 河口湖富士山 浪漫生日之旅
export const tokyoBirthdayPreset: BirthdayTripData = {
  version: '1.0.0',
  settings: {
    id: 'tokyo-romantic-birthday',
    tripTitle: '🌸 專屬於寶貝的浪漫生日之旅 · 東京＆富士山篇',
    girlfriendName: '晴寶 💖',
    boyfriendName: '蔡寶 🙋‍♂️',
    destination: '日本東京 & 河口湖富士山',
    startDate: '2026-09-18',
    endDate: '2026-09-22',
    coverImageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    romanticThemeColor: 'rose',
    secretModePassword: '1017',
    customNotes: '親愛的，生日快樂！這趟旅行所有細節我都安排好了，妳只要帶著最美的笑容，享受被寵成公主的每一天～'
  },
  itinerary: [
    {
      id: 'day-1',
      dayNumber: 1,
      date: '2026-09-18',
      themeTitle: 'Day 1: 抵達東京 · 漫步銀座與浪漫高空夜景晚餐',
      dayDescription: '降落羽田機場，直奔質感設計飯店辦理入住，接著在銀座手牽手逛街，晚上享用俯瞰全東京夜景的生日法式晚餐。',
      weatherForecast: '晴朗舒適 23°C',
      todayOutfitTip: '優雅氣質洋裝或知性套裝，今晚晚餐環境典雅，適合拍照！',
      activities: [
        {
          id: 'act-1-1',
          time: '09:00 - 13:15',
          title: '搭機啟程：台北松山 ✈️ 東京羽田 (BR192)',
          category: 'transit',
          location: '羽田機場第三航廈',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Haneda+Airport',
          description: '出關後領取JR Pass與Suica，搭乘東京單軌電車直達市區。',
          notes: '已預約行李特急托運服務，直接送到飯店，一身輕便開始約會！'
        },
        {
          id: 'act-1-2',
          time: '14:30 - 15:30',
          title: '入住 Ginza The Celestine Hotel',
          category: 'hotel',
          location: '東京都中央區銀座8-13-1',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+The+Celestine+Ginza',
          description: '頂級景觀高樓層客房，大片落地窗採光超棒。',
          notes: '已備註「慶生佈置」，進房會有驚喜迎賓香檳與花束 🍾'
        },
        {
          id: 'act-1-4',
          time: '19:00 - 21:30',
          title: '🎂 生日法式晚餐：Sky Restaurant 634',
          category: 'dining',
          location: '晴空塔展望台 345M',
          locationUrl: 'https://www.google.com/maps/search/?api=1&query=Sky+Restaurant+634',
          description: '在 345 公尺高的晴空塔上品嚐法日融合料理，一覽百萬璀璨夜景。',
          isSecretSurprise: true,
          surpriseHint: '在全東京最高的景觀餐廳為妳唱生日歌，主廚客製生日祝福甜點盤 🍓',
          notes: '訂位代號: #TYO-9918，已全額結清套餐。'
        }
      ]
    }
  ],
  surprises: [],
  dining: [],
  packingList: [],
  expenses: [],
  photos: [],
  loveLetter: {
    recipientName: '晴寶 💖',
    authorName: '蔡寶 💌',
    title: 'Happy Birthday My Love!',
    openingText: '親愛的小寶貝：',
    bodyParagraphs: ['生日快樂！'],
    closingText: '永遠愛妳 💕'
  }
};
