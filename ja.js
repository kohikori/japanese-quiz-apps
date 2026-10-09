/* Kohikori · Japanese interface (secret)
   Enter the Konami code to switch every page to Japanese, and again to switch back:
     keyboard  ↑ ↑ ↓ ↓ ← → ← → B A
     phone     swipe ↑ ↑ ↓ ↓ ← → ← →, then tap twice
   Only interface text is translated. Quiz content (English meanings, example translations,
   grammar explanations) is left as it is. */
(() => {
const KEY = 'kohikori_lang_v1';
const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
const lsSet = (k,v) => { try { localStorage.setItem(k,v); } catch(e){} };

/* ---------- exact strings ---------- */
const D = {
  // titles & headings
  'Kohikori · Japanese Practice':'Kohikori · 日本語練習', 'Japanese Verb Conjugation Quiz':'動詞活用クイズ', 'Japanese Adjective Conjugation Quiz':'形容詞クイズ',
  'Japanese Counters Quiz':'助数詞クイズ', 'Japanese Vocabulary Quiz':'語彙クイズ',
  '活用 Verb Conjugation Quiz':'動詞活用クイズ', '形容詞 Adjective Quiz':'形容詞クイズ', '助数詞 Counters Quiz':'助数詞クイズ', '語彙 Vocabulary Quiz':'語彙クイズ',
  'Verb Conjugation Quiz':'動詞活用クイズ', 'Adjective Quiz':'形容詞クイズ', 'Counters Quiz':'助数詞クイズ', 'Vocabulary Quiz':'語彙クイズ',
  // home page
  'Free Japanese practice – built by and for learners.':'無料の日本語練習アプリ ― 学習者による、学習者のための。',
  'Conjugate 1,500 verbs into 18 forms, from ます and て to passive and causative. Every mistake comes with the rule that explains it.':'約1,500の動詞を、「ます」「て」から受身・使役まで18の形に活用。間違えると、その理由になるルールを表示します。',
  'Conjugate 370 い- and な-adjectives: negative, past, て-form, "looks…", "too…" and more. Catches the classic traps like きれい and いい.':'約370のい形容詞・な形容詞を、否定・過去・て形・「〜そう」・「〜すぎる」などに活用。「きれい」や「いい」のような定番のひっかけにも対応。',
  'Count pencils, people, cats and cups: 3本 is さんぼん, 6匹 is ろっぴき. Starts with 6 core counters, with charts that highlight the sound changes.':'鉛筆、人、猫、カップを数えよう。3本は「さんぼん」、6匹は「ろっぴき」。まずは基本の6つの助数詞から。音の変化がひと目でわかる表つき。',
  '4,800 JLPT words with example sentences. Type the meaning in English, and small typos are forgiven.':'例文つきのJLPT単語約4,800語。意味を英語で入力します。小さなタイプミスは許容されます。',
  'Verbs':'動詞', 'Adjectives':'形容詞', 'Vocabulary':'語彙', 'Not started':'未開始',
  '18 forms':'18の活用形', '16 forms':'16の形', '14 counters':'14の助数詞', '4,800 words':'約4,800語',
  'Type in romaji':'ローマ字入力', 'Listening mode':'リスニング', 'Example sentences':'例文つき', 'Beginner friendly':'初心者向け', 'Learn tab':'学習タブ', 'Multiple choice':'選択式',
  'Not started yet':'まだ始めていません',
  'Put Kohikori on your home screen':'Kohikoriをホーム画面に追加', 'It opens full-screen like an app and works offline.':'アプリのように全画面で開き、オフラインでも使えます。',
  'Install Kohikori as an app':'Kohikoriをアプリとしてインストール', 'Get a home-screen icon, full-screen quizzes and offline practice.':'ホーム画面にアイコンが追加され、全画面表示とオフライン練習が使えるようになります。',
  'Install':'インストール', 'Dismiss':'閉じる', 'Close':'閉じる', 'All apps':'すべてのアプリ',
  'Backup & sync':'バックアップと同期', 'Sync':'同期', 'Backup & restore':'バックアップ・復元', 'No backup yet':'未バックアップ', 'From this device':'この端末から', 'On your other device':'もう一方の端末で',
  '📤 Share backup':'📤 バックアップを共有', '📋 Copy sync code':'📋 同期コードをコピー', '📥 Restore from file':'📥 ファイルから復元', '📝 Paste a sync code':'📝 同期コードを貼り付け',
  'Paste the code that starts with KOHI…':'KOHIで始まるコードを貼り付け…', 'Restore':'復元',
  'Share backup':'バックアップを共有', 'Copy sync code':'同期コードをコピー', 'Restore from file':'ファイルから復元', 'Paste a sync code':'同期コードを貼り付け',
  "opens your phone's share sheet: AirDrop, Messages, email or Save to Files.":'で共有シートが開きます（AirDrop、メッセージ、メール、「ファイル」に保存など）。',
  'is the same backup as text, handy for pasting into a note or a message to yourself.':'は、同じバックアップをテキストにしたものです。メモや自分宛てのメッセージに貼り付けるのに便利です。',
  'Restored and merged:':'復元して統合しました：', 'Verbs:':'動詞：', 'Adjectives:':'形容詞：', 'Counters:':'助数詞：', 'Vocabulary:':'語彙：',
  "That isn't a Kohikori backup or quiz export.":'Kohikoriのバックアップやクイズの書き出しファイルではありません。',
  "That backup came from this device, so there's nothing new to add. Restore it on your other device.":'このバックアップはこの端末で作ったものなので、追加するものはありません。もう一方の端末で復元してください。',
  'Already up to date. Nothing new in that backup.':'すでに最新です。新しいデータはありません。',
  "That doesn't look like a complete sync code. Make sure you copied all of it (it starts with KOHI).":'同期コードが途中で切れているようです。すべてコピーできているか確認してください（KOHIで始まります）。',
  'Backup shared. On your other device, open Kohikori and tap':'バックアップを共有しました。もう一方の端末でKohikoriを開き、',
  'Backup saved to your downloads. On your other device, open Kohikori and tap':'バックアップをダウンロードに保存しました。もう一方の端末でKohikoriを開き、',
  'there.':'を使ってください。',
  // footer
  "Built by one learner, for others. Found a wrong answer or have an idea? I'd love to hear it.":'一人の学習者が、ほかの学習者のために作りました。間違いを見つけたり、アイデアがあったりしたら、ぜひ教えてください。',
  'Send feedback':'フィードバックを送る', '☕ Donate via PayPal':'☕ PayPalで寄付する',
  // header & toggles
  'Quiz':'クイズ', 'Filters':'フィルター', 'Stats':'成績', 'Word list':'単語リスト', 'Learn':'学習',
  'Furigana':'ふりがな', 'Romaji':'ローマ字', 'Dark mode':'ダークモード', 'Auto-play audio':'音声を自動再生',
  'Show romaji above Japanese words':'日本語の上にローマ字を表示', 'Read the answer aloud as soon as you submit':'答えを送信したらすぐに読み上げる',
  'This browser has no speech support':'このブラウザは音声読み上げに対応していません',
  // quiz controls
  'Session:':'今回：', 'Streak:':'連続正解：',
  'Review weak spots':'苦手を復習', 'Exit review':'復習を終える', 'Wrap up':'まとめに入る', 'Cancel wrap-up':'まとめをやめる',
  '🎧 Listening':'🎧 リスニング', '🎧 Listening: on':'🎧 リスニング：オン', '⇄ Answer in Japanese':'⇄ 日本語で答える', '⇄ Answer in Japanese: on':'⇄ 日本語で答える：オン',
  '☰ Multiple choice':'☰ 選択式', '☰ Multiple choice: on':'☰ 選択式：オン', '💡 Hint':'💡 ヒント',
  'Drill only the items with your worst track record':'苦手な問題だけを集中練習', 'Finish with 5 more questions, then see a summary':'あと5問で終了してまとめを表示',
  'Hear the word instead of reading it':'文字の代わりに音声で出題', 'Hear the verb instead of reading it':'文字の代わりに音声で出題', 'Hear the adjective instead of reading it':'文字の代わりに音声で出題',
  'Listening works in the Japanese → English direction':'リスニングは「日本語→英語」のときに使えます', 'See the English, answer in Japanese':'英語を見て日本語で答える',
  'Show the first sound':'最初の音を表示', 'Pick from 4 answers instead of typing':'入力せずに4択から選ぶ', 'Play again':'もう一度再生', 'Play audio':'音声を再生',
  'Your synonym':'あなたが追加した同義語', 'Remove this synonym':'この同義語を削除',
  'Check':'答え合わせ', 'Show answer':'答えを見る', 'Next →':'次へ →', 'Finish →':'終了 →', 'Convert to':'活用形：',
  'type in romaji…':'ローマ字で入力…', 'type in romaji… (e.g. sanbon)':'ローマ字で入力（例：sanbon）', 'type the English meaning…':'英語の意味を入力…',
  'type in Japanese…':'日本語で入力…', 'search Japanese or English…':'日本語または英語で検索…',
  '✏️ Please check your spelling':'✏️ つづりを確認してください', 'Correct!':'正解！', 'Answer':'答え', 'Correct':'正解', 'I was right':'合っていたことにする', 'Marked correct':'正解にしました',
  '⚑ Report a mistake in this word':'⚑ この単語の誤りを報告', '⚑ Report a mistake in this question':'⚑ この問題の誤りを報告',
  'answer in Japanese':'日本語で答える', 'type what the word means':'意味を入力', 'type the form of the verb you hear':'聞こえた動詞を活用',
  'type the form of the adjective you hear':'聞こえた形容詞を活用',
  'No words match your filters. Enable at least one part of speech and level.':'条件に合う単語がありません。品詞とレベルを1つ以上選んでください。',
  'No questions match your filters. Enable at least one form, level and verb group.':'条件に合う問題がありません。活用形・レベル・グループを1つ以上選んでください。',
  'No questions match your filters. Enable at least one form, level and adjective type.':'条件に合う問題がありません。活用形・レベル・種類を1つ以上選んでください。',
  'No counters selected. Pick at least one on the Filters tab.':'助数詞が選ばれていません。フィルタータブで1つ以上選んでください。',
  "This viewer blocks saving, so lifetime stats won't persist.":'この表示環境では保存できないため、累計成績は残りません。',
  "This viewer blocks saving, so lifetime stats won't persist. Download the file and open it directly in Chrome to save progress.":'この表示環境では保存できないため、累計成績は残りません。ファイルをダウンロードしてChromeで直接開くと保存できます。',
  // kana quiz
  "Kana":"かな",
  "Hiragana & katakana":"ひらがな・カタカナ",
  "Read & write":"読み書き",
  "かな Kana Quiz":"かなクイズ",
  "Hiragana & Katakana Quiz":"ひらがな・カタカナクイズ",
  "Draw":"書く",
  "Mixed":"ミックス",
  "Hiragana":"ひらがな",
  "Katakana":"カタカナ",
  "what sound is this?":"読み方は？",
  "Pick the hiragana":"ひらがなを選ぶ",
  "Pick the katakana":"カタカナを選ぶ",
  "Tap an answer or press 1–4 · Enter = next":"答えをタップ、または1〜4キー ・ Enter＝次へ",
  "✏️ Practice writing":"✏️ 書く練習",
  "Practice writing":"書く練習",
  "Basic sounds":"基本の音（五十音）",
  "Dakuten ゛ (two small marks)":"濁点 ゛",
  "Handakuten ゜ (small circle)":"半濁点 ゜",
  "▶ Watch stroke order":"▶ 書き順を見る",
  "↺ Start over":"↺ やり直す",
  "🙈 From memory":"🙈 見ないで書く",
  "🙈 From memory: on":"🙈 見ないで書く：オン",
  "Trace each stroke in order, starting at the green dot. Stroke-order data from KanjiVG (CC BY-SA 3.0).":"緑の点から、書き順どおりに1画ずつなぞりましょう。書き順データ：KanjiVG（CC BY-SA 3.0）",
  "Right shape, wrong direction. Start at the green dot.":"形は合っていますが、向きが逆です。緑の点から書きましょう。",
  "Start at the green dot and follow the gray stroke.":"緑の点から、灰色の線に沿って書きましょう。",
  "Close! Follow the gray stroke a little more closely.":"おしい！ もう少し灰色の線に沿って書きましょう。",
  "Right shape, wrong direction. Start at the green dot. The stroke is shown in green.":"形は合っていますが、向きが逆です。緑で示した線をなぞりましょう。",
  "Start at the green dot and follow the gray stroke. The stroke is shown in green.":"緑の点から書きましょう。緑で示した線をなぞりましょう。",
  "Close! Follow the gray stroke a little more closely. The stroke is shown in green.":"おしい！ 緑で示した線をなぞりましょう。",
  "✓ Well done!":"✓ よくできました！",
  "Next ›":"次へ ›",
  "Watch the stroke order…":"書き順を見てください…",
  "Script":"文字",
  "Hiragana ひらがな":"ひらがな",
  "Katakana カタカナ":"カタカナ",
  "Both":"両方",
  "Basic rows":"基本の行",
  "More sets":"ほかのセット",
  "Dakuten ゛ (が, ざ, だ, ば)":"濁点 ゛（が・ざ・だ・ば）",
  "Handakuten ゜ (ぱ)":"半濁点 ゜（ぱ）",
  "Combinations (きゃ, しゅ…)":"拗音（きゃ・しゅ…）",
  "New to kana? Start with just the あ and か rows, then add a row at a time.":"かなが初めてなら、まずはあ行とか行だけで始めて、1行ずつ増やしましょう。",
  "— characters you miss come up more often":"― 間違えた文字がよく出題されます",
  "Move on automatically after a correct answer":"正解したら自動で次へ進む",
  "No characters selected. Pick at least one row or set on the Filters tab.":"文字が選ばれていません。フィルタータブで行かセットを1つ以上選んでください。",
  "85%+":"85%以上",
  "60–84%":"60〜84%",
  "under 60%":"60%未満",
  "not seen yet":"未出題",
  "Character":"文字",
  "Writing practice":"書く練習",
  "Read each character aloud after you answer":"答えたあと文字を読み上げる",
  "Direction":"方向",
  // vocab topics
  "People & family":"人・家族",
  "Food & drink":"食べ物・飲み物",
  "Travel & transport":"旅行・交通",
  "Places & the city":"場所・町",
  "Home & daily life":"家・生活",
  "School & study":"学校・勉強",
  "Work & business":"仕事・ビジネス",
  "Money & shopping":"お金・買い物",
  "Time & calendar":"時間・暦",
  "Nature, weather & animals":"自然・天気・動物",
  "Body & health":"体・健康",
  "Feelings":"気持ち",
  "Clothes & fashion":"服・ファッション",
  "Hobbies, sports & fun":"趣味・スポーツ・娯楽",
  "Communication & media":"コミュニケーション・メディア",
  "Society & news":"社会・ニュース",
  "Science & technology":"科学・技術",
  "Colors & shapes":"色・形",
  "Topic":"トピック",
  "clear":"解除",
  "Only words in the selected topics are asked.":"選んだトピックの単語だけが出題されます。",
  "No topic selected, so every word can come up. Pick one or more to focus your practice.":"トピックが選ばれていないので、すべての単語が出題されます。1つ以上選ぶと、そのテーマに絞って練習できます。",
  // parts of speech
  'Nouns':'名詞', 'Verbs (incl. する nouns)':'動詞（する名詞を含む）', 'い-adjectives':'い形容詞', 'な-adjectives':'な形容詞', 'Adverbs':'副詞', 'Pronouns':'代名詞',
  'Grammar patterns (〜ない, より, たびに…)':'文法パターン（〜ない、より、たびに…）', 'Other (pre-noun, expressions, suffixes)':'その他（連体詞・表現・接尾辞）',
  'Noun':'名詞', 'Verb':'動詞', 'い-adjective':'い形容詞', 'な-adjective':'な形容詞', 'Adverb':'副詞', 'Pronoun':'代名詞', 'Grammar pattern':'文法パターン', 'Other':'その他',
  // filters
  'Part of speech':'品詞', 'all':'すべて', 'none':'なし', 'JLPT level':'JLPTレベル', 'Practice':'練習', 'Level':'レベル', 'Practice mode':'練習モード',
  'Focus on weak spots (spaced repetition)':'苦手を重点的に（間隔反復）', 'Focus on weak spots':'苦手を重点的に',
  'Words with more than one part of speech (e.g. 勉強 = noun + する verb) are included if any of them is checked.':'複数の品詞を持つ単語（例：勉強＝名詞＋する動詞）は、どれか1つがチェックされていれば出題されます。',
  "Missed words come back more often; ones you know well show up less. Within a session, a correct word won't repeat, and a missed one returns at most once.":'間違えた単語はよく出題され、よく覚えた単語はあまり出なくなります。1回のセッションでは、正解した単語は繰り返されず、間違えた単語の再出題も1回までです。',
  "— verbs/forms you've missed show up more often; ones you know show up less":'― 間違えた動詞や活用形がよく出題され、覚えたものはあまり出なくなります',
  "— adjectives/forms you've missed show up more often; ones you know show up less":'― 間違えた形容詞や活用形がよく出題され、覚えたものはあまり出なくなります',
  '— ones you miss come up more often':'― 間違えたものがよく出題されます',
  'Conjugations':'活用形', 'Polite':'丁寧', 'Casual':'普通', 'N4 forms':'N4の形', 'Verb group':'動詞のグループ', 'Adjective type':'形容詞の種類',
  'う-verbs (godan)':'う動詞（五段）', 'る-verbs (ichidan)':'る動詞（一段）', 'Irregular (する / 来る)':'不規則（する／来る）', 'い-adjectives (incl. いい)':'い形容詞（「いい」を含む）',
  // verb & adjective forms
  'Polite present':'丁寧・現在', 'Polite negative':'丁寧・否定', 'Polite past':'丁寧・過去', 'Polite past negative':'丁寧・過去否定', "Polite volitional (let's)":'丁寧・意向',
  'Casual present':'普通・現在', 'Casual negative':'普通・否定', 'Casual past':'普通・過去', 'Casual past negative':'普通・過去否定',
  'て-form':'て形', 'Want to':'願望', "Volitional (let's / I'll)":'意向形', 'ば-conditional':'ば条件形', 'たら-conditional':'たら条件形',
  'Potential (can)':'可能形', 'Passive':'受身形', 'Causative (make/let)':'使役形', 'Imperative (command)':'命令形', "Prohibitive (don't!)":'禁止形',
  'Before a noun':'名詞の前（連体形）', '〜な + noun':'〜な＋名詞', 'て-form (and…)':'て形', 'Adverb (…ly)':'副詞形', 'Conditional (if…)':'条件形', 'Become…':'〜になる', 'Looks…':'様態（〜そう）', 'Too…':'〜すぎる',
  // stats
  'Session':'今回', 'Lifetime':'累計', 'Review queue:':'復習キュー：', 'to review ·':'件 要復習 ·', 'learning ·':'件 学習中 ·', 'mastered':'件 習得済み',
  'By conjugation (weakest first, lifetime)':'活用形別（苦手順・累計）', 'Form':'活用形', 'Accuracy':'正答率', 'By verb group':'グループ別', 'Group':'グループ',
  'Most-missed verbs (lifetime)':'よく間違える動詞（累計）', 'Missed':'ミス', 'None yet.':'まだありません。', 'By adjective type':'種類別', 'Type':'種類', 'Adjective':'形容詞',
  'Most-missed adjectives (lifetime)':'よく間違える形容詞（累計）', 'By part of speech (weakest first, lifetime)':'品詞別（苦手順・累計）', 'By level':'レベル別',
  'Most-missed words (lifetime)':'よく間違える単語（累計）', 'Word':'単語', 'Meaning':'意味', 'Reading':'読み', 'Lvl':'レベル',
  'Sync between devices':'端末間の同期', 'Tip:':'ヒント：', 'home page':'ホームページ',
  'Export progress':'進捗を書き出す', 'Import progress':'進捗を読み込む', 'Reset lifetime stats':'累計成績をリセット', 'No other devices imported yet':'ほかの端末からの取り込みはまだありません',
  'Exported. Import this file on your other device.':'書き出しました。このファイルをもう一方の端末で読み込んでください。',
  'Already up to date. Nothing new in that file.':'すでに最新です。新しいデータはありません。',
  "That file came from this device, so there's nothing new to add.":'このファイルはこの端末で作ったものなので、追加するものはありません。',
  // summary
  'Session complete':'セッション終了', 'Review complete':'復習完了', 'Start new session':'新しいセッションを始める', 'Keep going':'続ける', 'Score':'スコア',
  'Best streak':'最高連続正解', 'Weak items cleared':'克服した苦手', 'You wrote':'あなたの答え', '(revealed)':'（答えを表示）', 'No misses this session. Nice work.':'今回はミスなし。お見事！',
  'Review mode':'復習モード', 'Wrapping up':'まとめ中', 'Done. Press Finish to see your summary':'終了です。「終了」を押すとまとめが表示されます',
  // word list
  'answers are extra accepted synonyms,':'の答えは追加で認められる同義語、', 'are ones you approved with “I was right” (× removes one), and':'は「合っていたことにする」で承認したもの（×で削除）、',
  'explain tricky meanings.':'は紛らわしい意味の説明です。', 'Italic':'斜体',
  // counters
  'How counters work':'助数詞のしくみ', 'Core counters':'基本の助数詞', 'More things':'その他のもの', 'Times, floors, age, clock':'回数・階・年齢・時刻',
  'Counter:':'助数詞：', 'Counter':'助数詞', 'Counters':'助数詞', 'core only':'基本のみ', 'Numbers':'数', '1–5 (easier)':'1〜5（やさしい）', 'Help':'ヘルプ',
  'Show which counter to use':'使う助数詞を表示', '— turn off to practice choosing the counter yourself':'― オフにすると助数詞選びも練習できます',
  'Include "how many?" questions':'「いくつ？」の問題も出す', '— 何本 (なんぼん), いくつ…':'― 何本（なんぼん）、いくつ…',
  'By counter (weakest first)':'助数詞別（苦手順）', 'By number':'数別', 'Number':'数', 'how many?':'いくつ？', 'Most missed':'よく間違えるもの',
  '= sound change to watch':'＝音が変わるので注意',
  'General things: anything without a special counter (and a safe fallback)':'一般的なもの：専用の助数詞がないもの（迷ったときにも使える）', 'General things':'一般的なもの',
  'People':'人', 'Long, thin things: pens, bottles, umbrellas, trees, bananas':'細長いもの：ペン、瓶、傘、木、バナナ', 'Long, thin things':'細長いもの',
  'Flat, thin things: paper, shirts, plates, tickets, photos':'薄くて平らなもの：紙、シャツ、皿、チケット、写真', 'Flat, thin things':'薄くて平らなもの',
  'Small animals: cats, dogs, fish, insects':'小さな動物：猫、犬、魚、虫', 'Small animals':'小さな動物',
  'Small, compact objects: eggs, apples, balls, candies, boxes':'小さな物：卵、りんご、ボール、あめ、箱', 'Small, compact objects':'小さな物',
  'Books and other bound things: books, notebooks, magazines':'本など綴じたもの：本、ノート、雑誌', 'Books and other bound things':'本など綴じたもの',
  'Machines and vehicles: cars, bikes, computers, TVs':'機械や乗り物：車、自転車、パソコン、テレビ', 'Machines and vehicles':'機械や乗り物',
  'Cups, glasses and bowls (of drinks or food)':'カップ・グラス・お椀に入った飲み物や食べ物', 'Number of times (how often)':'回数',
  'Floors of a building (3階 = 3rd floor)':'建物の階（3階＝3番目の階）', 'Age: years old (also written 才)':'年齢（「才」とも書く）', 'Age':'年齢',
  "Time: o'clock":'時刻（〜時）', 'Time':'時刻', 'Minutes':'分',
};
/* ---------- patterns (text with numbers or the user's own answer in it) ---------- */
const plural = (n, one, many) => n==1 ? one : many;
const P = [
  [/^([\d,]+) answered · (\d+)% correct$/, m=>`${m[1]}問回答 · 正答率${m[2]}%`],
  [/^([\d,]+) answered · (\d+)%$/, m=>`${m[1]}問 · ${m[2]}%`],
  [/^([\d,]+) possible questions with current filters\.$/, m=>`現在の条件で${m[1]}問`],
  [/^([\d,]+) words with current filters\.$/, m=>`現在の条件で${m[1]}語`],
  [/^(N\d) \(([\d,]+) (words|verbs|adjectives)\)$/, m=>`${m[1]}（${m[2]}${m[3]==='words'?'語':m[3]==='verbs'?'動詞':'形容詞'}）`],
  [/^Not quite — you wrote “?(.*?)”?$/, m=>`おしい！ あなたの答え：「${m[1]}」`],
  [/^Correct — close enough to “(.*)”$/, m=>`正解！（「${m[1]}」とみなしました）`],
  [/^Marked correct — “(.*)” saved as a synonym$/, m=>`正解にしました：「${m[1]}」を同義語として保存`],
  [/^The ending looks right, but the start doesn't match (.*)\. Fix it and press Enter\.$/, m=>`語尾は合っていますが、最初の部分が${m[1]==='the word you heard'?'聞こえた単語':'「'+m[1]+'」'}と一致しません。直してEnterを押してください。`],
  [/^Not quite — you picked (.+)$/, m=>`おしい！ あなたの答え：${m[1]}`],
  [/^the (.+)-row one$/, m=>`${m[1]}行のほう`],
  [/^Combinations \(small (.+)\)$/, m=>`拗音（小さい${m[1]}）`],
  [/^([\d,]+) characters with current filters\.$/, m=>`現在の条件で${m[1]}文字`],
  [/^(\d+) characters? traced so far\.$/, m=>`これまでに${m[1]}文字なぞりました。`],
  [/^Also accepted: (.*)$/, m=>`ほかの正解：${m[1]}`],
  [/^Also correct: (.*)$/, m=>`ほかの正解：${m[1]}`],
  [/^Sounds the same: (.*)$/, m=>`同じ発音：${m[1]}`],
  [/^You wrote (.+?)(?: \((.+?)\))?, which also means “(.*)”, so it counts\.$/, m=>`「${m[1]}${m[2]?'（'+m[2]+'）':''}」も「${m[3]}」という意味なので正解です。`],
  [/^That's the meaning of (.+), which sounds the same, so it counts\.$/, m=>`それは「${m[1]}」の意味です。同じ発音なので正解です。`],
  [/^You heard (.+?) \((.*)\), which sounds the same, so that counts\.$/, m=>`「${m[1]}」（${m[2]}）も同じ発音なので正解です。`],
  [/^starts with (.+)… \((\d+) kana\)$/, m=>`「${m[1]}」で始まる（${m[2]}文字）`],
  [/^To review \((\d+)\)$/, m=>`復習（${m[1]}）`],
  [/^missed ×(\d+)$/, m=>`ミス×${m[1]}`],
  [/^Showing ([\d,]+) of ([\d,]+)\. Search to narrow it down\.$/, m=>`${m[2]}件中${m[1]}件を表示中。検索で絞り込めます。`],
  [/^(\d+) of (\d+) weak items left$/, m=>`苦手 残り${m[1]}／${m[2]}`],
  [/^focus: (.*)$/, m=>'重点：'+m[1].split(', ').map(x=>tr(x)??x).join('、')],
  [/^(\d+) questions? left$/, m=>`残り${m[1]}問`],
  [/^This device: ([\d,]+) answers?$/, m=>`この端末：${m[1]}問`],
  [/^(\d+) saved synonyms?$/, m=>`保存した同義語 ${m[1]}件`],
  [/^Imported from (\d+) other devices?: (.*)$/, m=>`ほかの端末${m[1]}台から取り込み：`+m[2].replace(/(\d+) answers \(as of ([^)]+)\)/g,'$1問（$2時点）')],
  [/^Backed up (.*)$/, m=>`${m[1]}にバックアップ`],
  [/^Last backup from this device: (.*)$/, m=>`この端末の最終バックアップ：${m[1]}`],
  [/^results from (\d+) devices?$/, m=>`端末${m[1]}台の結果`],
  [/^(\d+) weak spots?$/, m=>`苦手${m[1]}件`],
  [/^(\d+) synonym changes?$/, m=>`同義語の変更${m[1]}件`],
  [/^(\d+) weak-spot entr(?:y|ies)$/, m=>`苦手${m[1]}件`],
  [/^(\d+) new synonyms?$/, m=>`新しい同義語${m[1]}件`],
  [/^(\d+) removed synonyms?$/, m=>`削除した同義語${m[1]}件`],
  [/^updated results from (\d+) devices? and (\d+) weak-spot entr(?:y|ies)$/, m=>`端末${m[1]}台の結果と苦手${m[2]}件を更新`],
  [/^Imported: (.*)\.$/, m=>'読み込みました：'+m[1].split(', ').map(x=>tr(x)??x).join('、')+'。'],
  [/^That file isn't an? (verb|adjective|counters|vocab|kana) quiz export\.$/, m=>({verb:'動詞',adjective:'形容詞',counters:'助数詞',vocab:'語彙',kana:'かな'})[m[1]]+'クイズの書き出しファイルではありません。'],
  [/^(?:Sync code copied \((\d+) KB of text\)\.|Copy the code in the box below\.) Paste it anywhere .* then use$/, m=>(m[1]?`同期コードをコピーしました（テキスト${m[1]}KB）。`:'下の枠のコードをコピーしてください。')+'もう一方の端末から見られる場所（メモ、自分宛てのメッセージ、メールなど）に貼り付け、そちらで'],
  [/^🔇 Audio couldn't play \((.+?)\)\. (.*)$/, m=>`🔇 音声を再生できませんでした（${m[1]}）。`+({
     'Your browser blocked it. Tap a 🔊 button again.':'ブラウザにブロックされました。もう一度🔊をタップしてください。',
     'No Japanese voice is installed on this device.':'この端末には日本語の音声が入っていません。',
     "Your browser's speech engine reported a problem.":'ブラウザの音声エンジンで問題が起きました。'})[m[2]]??m[2]],
  [/^(.+?) \(([\d,]+)\)$/, m=> D[m[1]] ? `${D[m[1]]}（${m[2]}）` : null],
  [/^(.+?) \(([^()]*[〜ぁ-んァ-ン][^()]*)\)$/, m=> D[m[1]] ? `${D[m[1]]}（${m[2]}）` : null],
];
function tr(t){
  if (t in D) return D[t];
  for (const [re,fn] of P){ const m=t.match(re); if (m){ const r=fn(m); if (r!=null) return r; } }
  for (const sep of [' · ',' / ']){            // e.g. "N3 · Noun · answer in Japanese"
    if (!t.includes(sep)) continue;
    const parts=t.split(sep), out=parts.map(x=>tr(x)), hit=out.some(x=>x!=null);
    if (hit) return parts.map((x,i)=>out[i]??x).join(sep===' · '?' · ':' ／ ');
  }
  return null;
}

/* ---------- blocks that are easier to replace whole ---------- */
const B = [
  ['#drawStatus', t=>/^(Now you try\. )?Stroke \d+ of \d+/.test(t), el=>{ const t=el.textContent, m=t.match(/Stroke (\d+) of (\d+)/);
     return (/^Now you try/.test(t)?'では、書いてみましょう。':'')+`<b>${m[1]}</b>画目（全${m[2]}画）`+(/green dot/.test(t)?' ・ 緑の点から書き始めます':''); }],
  ['.hint', t=>/^Enter = check \/ next · Type/.test(t), el=>{ const ex=(el.querySelector('i')||{}).textContent||'matte', kana=(t=>t.slice(t.lastIndexOf('→')+1).replace(/[)\s]/g,''))(el.textContent);
     return `Enter＝答え合わせ／次へ ・ 「ん」は <b>nn</b> ・ 小さい「っ」は子音を重ねる（例：<i>${ex}</i> → ${kana}）`; }],
  ['.hint', t=>/^Enter = check \/ next · any listed meaning/.test(t), ()=>'Enter＝答え合わせ／次へ ・ 表示されている意味ならどれでも正解 ・ 「to」「a」「the」、小さなタイプミス、文字の抜けや入れ替わりは許容されます'],
  ['.hint', t=>/^Enter = check \/ next · type romaji/.test(t), ()=>'Enter＝答え合わせ／次へ ・ ローマ字（<i>taberu</i> → たべる）または日本語キーボードで入力 ・ 同じ意味の別の単語も正解'],
  ['.intro', t=>/^Japanese counts things/.test(t), ()=>`
    <p>日本語では、ものを<b>数＋助数詞</b>で数えます。助数詞は数えるものによって変わります。鉛筆3本は<b>さんぼん</b>（3本）、紙3枚は<b>さんまい</b>（3枚）。表のマスをタップすると発音が聞けます。</p>
    <p>難しいのは、いくつかの音の変化だけです。一度気づけば、ほかの助数詞でも同じパターンが出てきます。</p>
    <ul><li><b>1・6・8・10は小さい「っ」になりやすい</b>：いっ、ろっ、はっ、じゅっ（いっこ、ろっぽん、はっぴき、じゅっかい）。</li>
    <li><b>は行の助数詞（本・匹・杯・分）はその後でぱ行に</b>：ほん → <b>ぽ</b>ん、ひき → <b>ぴ</b>き。</li>
    <li><b>3（と「何」）の後は濁ることが多い</b>：さん<b>ぼ</b>ん、さん<b>び</b>き、なん<b>ば</b>い。</li></ul>
    <p class="legend"><span class="cell irr mini"></span> ＝音が変わるので注意</p>`],
  ['.sync .sub', ()=>true, ()=>'進捗は端末ごとに保存されます。スマホとパソコンの間で移すには、片方でバックアップして、もう片方で復元してください。復元すると結果は<b>統合</b>されるので、上書きされることはありません。両方向で行えば、どちらの端末にもすべての結果がそろいます。'],
  ['#installIOS ol', ()=>true, el=>`<li>ブラウザのバーにある<b>共有</b>ボタン ${(el.querySelector('svg')||{}).outerHTML||''} をタップ。</li><li>下にスクロールして<b>ホーム画面に追加</b>を選びます。</li>`],
  ['#installIOS .note', ()=>true, ()=>'すでにここで練習していましたか？ インストールしたアプリには成績が別に保存されます。先に上の🔄ボタンから<b>同期コードをコピー</b>し、インストールしたアプリで<b>同期コードを貼り付け</b>てください。'],
  ['#tab-stats > div', t=>/^Tip: the home page backs up/.test(t), ()=>'<b>ヒント：</b><a href="./#sync">ホームページ</a>では、すべてのクイズをまとめてバックアップ・復元できます。ここではこのクイズだけを書き出せます。別のパソコンやスマホでクイズを開いて読み込んでください。結果は重複せずに統合されるので、何度でも同期できます。'],
  ['#tab-list > div', t=>/answers are extra accepted synonyms/.test(t), ()=>'<span class="added">斜体</span>の答えは追加で認められる同義語、<span class="usyn">✱</span>は「合っていたことにする」で承認したもの（×で削除）、⚑は紛らわしい意味の説明です。'],
];

/* ---------- applying it ---------- */
// quiz content stays as it is
const SKIP = '#qWord,#qVerb,#qMeaning,.meanings,.ex,.qlabel,.cex,.lrule,.rule,.note,.usyn,.added,.fixnote,.pill,.rr,.rj,ruby,.choice,.cell .rd,.cell .alt,.correct,.jpans,textarea,script,style,#listBody td:nth-child(3),#ttsNote+x';
let on=false, obs=null, busy=false;
function doText(n){
  const raw=n.nodeValue; if (!raw || !/[A-Za-z]/.test(raw)) return;
  const el=n.parentElement; if (!el || el.closest(SKIP)) return;
  const core=raw.replace(/\s+/g,' ').trim(); if (!core) return;
  const t=tr(core); if (t==null) return;
  const lead=raw.match(/^\s*/)[0], trail=raw.match(/\s*$/)[0];
  n.nodeValue=lead+t+trail;
}
function doAttrs(el){
  for (const a of ['placeholder','title','aria-label']){
    const v=el.getAttribute && el.getAttribute(a); if (!v || !/[A-Za-z]/.test(v)) continue;
    const t=tr(v.trim()); if (t!=null) el.setAttribute(a,t);
  }
}
function apply(root){
  if (!on || busy) return; busy=true;
  try {
    for (const [sel,test,html] of B) (root.querySelectorAll ? root : document).querySelectorAll(sel).forEach(el=>{
      if (el._jaOut!==undefined && el.innerHTML===el._jaOut) return;   // already ours (re-done if the page rewrites it)
      const t=el.textContent.replace(/\s+/g,' ').trim();
      if (test(t)){ el.innerHTML=html(el); el._jaOut=el.innerHTML; }
    });
    if (root.nodeType===3){ doText(root); }
    else {
      const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while (n=w.nextNode()) doText(n);
      if (root.querySelectorAll){ doAttrs(root); root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(doAttrs); }
    }
    const tt=tr(document.title); if (tt) document.title=tt;
  } finally { busy=false; }
}
function start(){
  on=true; document.documentElement.lang='ja'; document.documentElement.classList.add('ja-ui');
  apply(document.body);
  obs=new MutationObserver(ms=>{ if (busy) return;
    for (const m of ms){
      if (m.type==='characterData') apply(m.target);
      else if (m.type==='attributes') doAttrs(m.target);
      else m.addedNodes.forEach(n=>apply(n.nodeType===1||n.nodeType===3 ? n : document.body));
    } });
  obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});
}
const css=document.createElement('style');
css.textContent='.ja-ui .app p.jp{display:none} #khToast{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:100;background:#27336b;color:#fff;padding:10px 18px;border-radius:999px;font-size:15px;white-space:nowrap;max-width:92vw;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:opacity .4s} #khToast.hide{opacity:0}';
document.head.appendChild(css);
function toast(msg){
  let t=document.getElementById('khToast'); if (!t){ t=document.createElement('div'); t.id='khToast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.remove('hide'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.add('hide'),2600);
}
if (lsGet(KEY)==='ja') start();

/* ---------- the Konami code ---------- */
const SEQ=['up','up','down','down','left','right','left','right','b','a'];
let pos=0, saved=null;
function step(k){
  if (k===SEQ[pos]){ pos++; if (pos===8){ const a=document.activeElement; saved = a && a.tagName==='INPUT' ? [a, a.value] : null; } }
  else pos = k===SEQ[0] ? 1 : 0;
  if (pos===SEQ.length){ pos=0; fire(); }
}
function fire(){
  if (saved){ const [el,v]=saved; setTimeout(()=>{ el.value=v; },0); saved=null; }   // undo the "b a" typed into an answer box
  if (!on){ lsSet(KEY,'ja'); start(); toast('🎮 日本語モード ON'); }
  else { lsSet(KEY,'en'); toast('🎮 English mode'); setTimeout(()=>location.reload(), 700); }
}
window.kohikoriToggleJa = fire;
// Typing "konami" in any quiz's answer box also works, however the keyboard spells it:
// konami / KONAMI / ｋｏｎａｍｉ (full-width) / こなみ / コナミ
const isKonami = v => /^(konami|こなみ)$/.test(String(v).normalize('NFKC').trim().toLowerCase()
  .replace(/[ァ-ヶ]/g, c=>String.fromCharCode(c.charCodeAt(0)-0x60)));
window.kohikoriIsKonami = isKonami;
function typedCode(box, e){
  if (!box || box.id!=='answer' || box.readOnly || !isKonami(box.value)) return false;
  e.preventDefault(); e.stopImmediatePropagation(); box.value=''; box.blur(); fire(); return true;
}
document.addEventListener('keydown', e=>{
  if (e.key!=='Enter' || e.isComposing || e.keyCode===229) return;     // Enter that only confirms a Japanese-keyboard word is ignored
  typedCode(e.target, e);
}, true);
document.addEventListener('click', e=>{
  if (e.target.closest && e.target.closest('#submitBtn')) typedCode(document.getElementById('answer'), e);
}, true);   // the vocab quiz calls this when someone types "konami"
const KEYS={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',b:'b',B:'b',a:'a',A:'a'};
document.addEventListener('keydown', e=>{ const k=KEYS[e.key]; if (k) step(k); else pos=0; }, true);
// phone: swipes for the arrows, then two taps for B and A
let sx=0, sy=0, st=0;
document.addEventListener('touchstart', e=>{ const t=e.changedTouches[0]; sx=t.clientX; sy=t.clientY; st=Date.now(); }, {passive:true});
document.addEventListener('touchend', e=>{
  const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy, ax=Math.abs(dx), ay=Math.abs(dy);
  if (ax<12 && ay<12 && Date.now()-st<350){ if (pos>=8) step(pos===8?'b':'a'); else pos=0; return; }
  if (Math.max(ax,ay)<40) return;
  step(ax>ay ? (dx>0?'right':'left') : (dy>0?'down':'up'));
}, {passive:true});
})();
