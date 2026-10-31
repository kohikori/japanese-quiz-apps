// Family Pick Pool: sign-in, My picks, and Set lines (line-setters and commissioner).
(function () {
  const P = window.POOL;
  if (!P || !document.getElementById('picks')) return;
  const {db, cfg, $, el} = P;
  const SEASON = cfg.defaultSeason;
  const TEAMS = 'ARI ATL BAL BUF CAR CHI CIN CLE DAL DEN DET GB HOU IND JAX KC LAC LAR LV MIA MIN NE NO NYG NYJ PHI PIT SEA SF TB TEN WAS'.split(' ');
  const ESPN_FIX = {WSH: 'WAS'};

  const st = {
    session: null, me: null, linked: false,
    games: [],            // this season's games
    pkWeek: null, lnWeek: null,
    target: null,         // whose picks we're editing
    saved: {},            // game_id -> saved pick
    draft: {},            // game_id -> {w, s, o}
    submitted: {},        // game_id -> [player codes]
    status: {},           // game_id -> {kind, text}
    players: [],
    unlock: {},           // game_id -> true while the commissioner is editing a locked game
    panelOpen: {},        // game_id -> true when everyone's picks are showing (locked games)
    panelRows: {},        // game_id -> pick_scores rows for that panel
  };
  const arrivedFromLink = /access_token|code=/.test(location.hash + location.search);

  // ---------- helpers ----------
  const fmtKick = (iso) => new Date(iso).toLocaleString(undefined, {weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
  const locked = (g) => !g.kickoff || new Date(g.kickoff) <= new Date();
  const dog = (g) => (g.favorite === g.home ? g.away : g.home);
  const n = (v) => (v == null ? '' : String(Number(v)));
  const untilText = (iso) => {
    const ms = new Date(iso) - new Date();
    if (ms <= 0) return 'locked';
    const m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    return 'locks in ' + (d ? d + 'd ' + h + 'h' : h ? h + 'h ' + mm + 'm' : mm + 'm');
  };
  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), p = (x) => String(x).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  };
  const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null);
  const weekLabel = (w) => (st.games.find((g) => g.week === w) || {}).week_label || 'Week ' + w;
  const friendly = (e) => {
    const m = (e && (e.message || e.error_description)) || String(e);
    if (/kicked off|locked/i.test(m)) return 'This game has kicked off, so picks are locked.';
    if (/frozen/i.test(m)) return 'Someone has already picked this game, so its line is frozen. Ask the commissioner if it must change.';
    if (/row-level security|permission/i.test(m)) return 'You don’t have permission to do that.';
    return m;
  };

  // ---------- account ----------
  async function refreshAccount() {
    const {data} = await db.auth.getSession();
    st.session = data.session;
    st.me = null;
    if (st.session) {
      const {data: me, error} = await db.rpc('my_player');
      if (!error && me && me.length) st.me = me[0];
    }
    renderAccount();
    const canSet = !!(st.me && (st.me.is_line_setter || st.me.is_admin));
    document.querySelectorAll('.tab[data-tab="lines"]').forEach((b) => { b.hidden = !canSet; });
    if (st.me) {
      st.target = st.target || st.me.code;
      await loadGames();
      if (st.me.is_admin) await loadPlayers();
    }
    renderPicksPage();
    if (P.state.tab === 'lines' && canSet) renderLines();
  }

  function renderAccount() {
    const box = $('account');
    box.replaceChildren();
    if (st.session) {
      const who = st.me ? st.me.code : (st.session.user && st.session.user.email) || 'Signed in';
      const out = el('button', 'Sign out', 'linkbtn');
      out.type = 'button';
      out.addEventListener('click', async () => { await db.auth.signOut(); st.target = null; refreshAccount(); });
      box.append(el('span', '● ' + who, 'who'), out);
    } else {
      const b = el('button', 'Sign in to pick', 'btn small');
      b.type = 'button';
      b.addEventListener('click', () => P.showTab('picks'));
      box.append(b);
    }
  }

  async function sendLink() {
    const email = $('signin-email').value.trim();
    const msg = $('signin-msg');
    if (!/^\S+@\S+\.\S+$/.test(email)) { msg.textContent = 'Enter your email address.'; return; }
    $('signin-send').disabled = true;
    msg.textContent = 'Checking…';
    try {
      const {data: ok, error: e1} = await db.rpc('is_pool_email', {p_email: email});
      if (e1) throw e1;
      if (!ok) { msg.textContent = 'That email isn’t on the pool list. Use the address the commissioner has for you, or ask them to add it.'; return; }
      const {error} = await db.auth.signInWithOtp({email, options: {emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true}});
      if (error) throw error;
      msg.textContent = 'Check your email (' + email + ') for a sign-in link and open it on this device. It can take a minute; check spam too.';
      st.pendingEmail = email;
      $('signin-code').hidden = false;
    } catch (e) {
      msg.textContent = 'Couldn’t send the link: ' + friendly(e);
    } finally {
      $('signin-send').disabled = false;
    }
  }

  async function verifyCode() {
    const msg = $('signin-msg');
    const token = $('signin-token').value.replace(/\s+/g, '');
    const email = st.pendingEmail || $('signin-email').value.trim();
    if (!email) { msg.textContent = 'Enter your email above first.'; return; }
    if (!/^\d{6,10}$/.test(token)) { msg.textContent = 'Enter the code from the email (numbers only).'; return; }
    $('signin-verify').disabled = true;
    msg.textContent = 'Signing in…';
    const {error} = await db.auth.verifyOtp({email, token, type: 'email'});
    $('signin-verify').disabled = false;
    if (error) { msg.textContent = 'That code didn’t work (' + friendly(error) + '). Codes expire after about an hour; you can send a new email.'; return; }
    msg.textContent = '';
    $('signin-code').hidden = true;
    await refreshAccount();
  }

  // ---------- data ----------
  async function loadGames() {
    const {data, error} = await db.from('games')
      .select('id, season, week, week_label, game_no, away, home, neutral_site, kickoff, favorite, spread, total, home_score, away_score, legacy_winner')
      .eq('season', SEASON).order('week').order('kickoff', {nullsFirst: true}).order('game_no');
    if (error) throw error;
    st.games = data;
  }

  async function loadPlayers() {
    const {data} = await db.from('players_public').select('code, active');
    const order = cfg.players.filter((p) => (data || []).some((d) => d.code === p && d.active));
    st.players = order;
  }

  function defaultWeek() {
    const now = new Date();
    const open = st.games.filter((g) => g.kickoff && new Date(g.kickoff) > now);
    if (open.length) return Math.min(...open.map((g) => g.week));
    const weeks = st.games.map((g) => g.week);
    return weeks.length ? Math.max(...weeks) : 1;
  }

  async function loadWeekPicks() {
    const ids = st.games.filter((g) => g.week === st.pkWeek).map((g) => g.id);
    st.saved = {}; st.draft = {}; st.status = {}; st.submitted = {};
    if (!ids.length) return;
    const [{data: mine, error}, {data: sub}] = await Promise.all([
      db.from('picks').select('game_id, pick_winner, pick_spread, pick_ou').eq('player_code', st.target).in('game_id', ids),
      db.rpc('picks_submitted', {p_season: SEASON, p_week: st.pkWeek}),
    ]);
    if (error) throw error;
    (mine || []).forEach((r) => { st.saved[r.game_id] = r; st.draft[r.game_id] = {w: r.pick_winner, s: r.pick_spread, o: r.pick_ou}; });
    (sub || []).forEach((r) => { (st.submitted[r.game_id] = st.submitted[r.game_id] || []).push(r.player_code); });
  }

  // ---------- My picks page ----------
  async function renderPicksPage() {
    $('signin').hidden = !!st.session;
    $('not-linked').hidden = !(st.session && !st.me);
    $('picks-app').hidden = !st.me;
    if (st.session && !st.me) {
      $('not-linked-msg').textContent = 'You’re signed in as ' + ((st.session.user && st.session.user.email) || 'this email') + ', but that address isn’t linked to a player yet. Ask the commissioner to add it, then refresh this page.';
    }
    if (!st.me) return;
    // week choices
    const weeks = [...new Set(st.games.map((g) => g.week))].sort((a, b) => a - b);
    if (st.pkWeek == null || !weeks.includes(st.pkWeek)) st.pkWeek = defaultWeek();
    const sel = $('pk-week');
    sel.replaceChildren(...weeks.map((w) => new Option(weekLabel(w), String(w))));
    if (!weeks.length) sel.append(new Option('No games yet', ''));
    sel.value = String(st.pkWeek);
    sel.onchange = async () => { st.pkWeek = Number(sel.value); await loadWeekPicks(); drawGames(); };
    // commissioner: picking for
    $('pk-for-wrap').hidden = !st.me.is_admin;
    if (st.me.is_admin) {
      const f = $('pk-for');
      f.replaceChildren(...(st.players.length ? st.players : [st.me.code]).map((p) => new Option(p === st.me.code ? p + ' (me)' : p, p)));
      f.value = st.target;
      f.onchange = async () => { st.target = f.value; await loadWeekPicks(); drawGames(); };
    }
    $('pk-for-note').hidden = !(st.me && st.target !== st.me.code);
    await loadWeekPicks();
    drawGames();
  }

  function weekGames() {
    return st.games.filter((g) => g.week === st.pkWeek);
  }

  function drawGames() {
    const box = $('pk-games');
    const games = weekGames();
    $('pk-for-note').hidden = !(st.me && st.target !== st.me.code);
    const picked = games.filter((g) => st.saved[g.id]).length;
    $('pk-progress').textContent = games.length ? picked + ' of ' + games.length + ' games picked' + (st.target !== st.me.code ? ' for ' + st.target : '') : '';
    if (!games.length) { box.replaceChildren(el('p', 'No games have been added for this week yet. Your line-setters add them on the Set lines tab.', 'note')); return; }
    box.replaceChildren(...games.map(gameCard));
    if (window.PoolExtras) window.PoolExtras.load(games, SEASON, updateNotes);
  }

  // Weather and injury notes (extras.js). Updated in place so nothing jumps while someone is picking.
  function notesFor(g) {
    const box = el('div', null, 'gc-notes');
    box.dataset.notes = g.id;
    const lines = window.PoolExtras ? window.PoolExtras.lines(g) : [];
    box.hidden = !lines.length;
    lines.forEach((t) => box.append(el('div', t, 'gc-note')));
    return box;
  }
  function updateNotes(g) {
    const old = document.querySelector('[data-notes="' + g.id + '"]');
    if (old) old.replaceWith(notesFor(g));
  }

  // Team logos from ESPN's image server. All 32 are fetched once and kept in memory, so cards
  // that get rebuilt (live refresh, notes) reuse them instead of starting new downloads.
  // A logo that fails is retried twice; if it still fails, it leaves a blank space of the same size.
  const ESPN_LOGO = {WAS: 'wsh'};
  const logoUrl = (team, n) => 'https://a.espncdn.com/i/teamlogos/nfl/500/' + (ESPN_LOGO[team] || team.toLowerCase()) + '.png' + (n ? '?r=' + n : '');
  const logoCache = {};
  TEAMS.forEach((t) => { const i = new Image(); i.decoding = 'async'; i.src = logoUrl(t); logoCache[t] = i; });
  function logo(team, cls) {
    const img = document.createElement('img');
    img.alt = ''; img.className = cls || 'logo'; img.decoding = 'async';
    let tries = 0;
    img.onerror = () => {
      if (tries < 2) { tries += 1; setTimeout(() => { img.src = logoUrl(team, tries); }, 600 * tries); }
      else img.style.visibility = 'hidden';
    };
    img.src = (logoCache[team] && logoCache[team].complete && logoCache[team].naturalWidth) ? logoCache[team].src : logoUrl(team);
    return img;
  }

  function tile(label, chosen, disabled, onClick, sub, team) {
    const b = el('button', null, 'pick-tile' + (chosen ? ' on' : ''));
    b.type = 'button';
    const main = el('span', null, 'pt-main');
    if (team) main.append(logo(team));
    main.append(document.createTextNode(label));
    b.append(main);
    if (sub) b.append(el('span', sub, 'pt-sub'));
    b.disabled = disabled;
    b.setAttribute('aria-pressed', String(!!chosen));
    if (!disabled) b.addEventListener('click', onClick);
    return b;
  }

  function gameCard(g) {
    const isLocked = locked(g), hasLine = !!g.favorite;
    const d = st.draft[g.id] || {};
    const card = el('article', null, 'game-card' + (isLocked ? ' is-locked' : '') + (st.saved[g.id] ? ' is-saved' : ''));
    card.dataset.game = g.id;
    // header
    const head = el('div', null, 'gc-head');
    const title = el('div', null, 'gc-title');
    const teams = el('span', null, 'gc-teams');
    teams.append(logo(g.away), document.createTextNode(g.away + ' @ '), logo(g.home), document.createTextNode(g.home));
    title.append(teams);
    const when = el('div', null, 'gc-when');
    when.append(el('span', g.kickoff ? fmtKick(g.kickoff) : '', 'gc-kick'), el('span', g.kickoff ? (isLocked ? '🔒 Locked' : untilText(g.kickoff)) : '🔒 Locked', isLocked ? 'gc-lock' : 'gc-until'));
    head.append(title, when);
    card.append(head);
    card.append(notesFor(g));
    if (!hasLine) {
      card.append(el('p', 'Lines not posted yet.', 'note'));
      return card;
    }
    // Commissioner can reopen a locked game's picks to fix them.
    const isAdmin = !!(st.me && st.me.is_admin);
    const unlocked = isLocked && isAdmin && st.unlock[g.id];
    const dis = isLocked && !unlocked;
    // An underdog that wins outright also covers, and a favorite that covers also wins,
    // so those picks move together. (Favorite to win + underdog to cover is fine: the hedge.)
    const pk = !Number(g.spread);
    const set = (k, v) => {
      const nd = {...(st.draft[g.id] || {}), [k]: v};
      if (k === 'w' && (pk || v !== g.favorite)) nd.s = v;
      if (k === 's' && (pk || v === g.favorite)) nd.w = v;
      st.draft[g.id] = nd; refreshCard(g); maybeSave(g);
    };
    const fill = (kind) => {
      const fav = g.favorite, dg = dog(g);
      const map = {fav: [fav, fav], hedge: [fav, dg], upset: [dg, dg]}[kind];
      st.draft[g.id] = {...(st.draft[g.id] || {}), w: map[0], s: map[1]};
      refreshCard(g); maybeSave(g);
    };
    if (!isLocked) {
      const q = el('div', null, 'gc-quick');
      [['fav', 'Favorite both ways'], ['hedge', 'Hedge my bet'], ['upset', 'Upset']].forEach(([k, label]) => {
        const b = el('button', label, 'chip'); b.type = 'button'; b.addEventListener('click', () => fill(k)); q.append(b);
      });
      card.append(q);
    }
    const spreadLabel = (team) => {
      const sp = Number(g.spread);
      if (!sp) return team + ' PK';
      return team + (team === g.favorite ? ' −' : ' +') + n(sp);
    };
    const row = (label, tiles) => { const r = el('div', null, 'gc-row'); r.append(el('span', label, 'gc-rlabel')); const t = el('div', null, 'gc-tiles'); t.append(...tiles); r.append(t); return r; };
    card.append(
      row('Winner', [g.away, g.home].map((t) => tile(t, d.w === t, dis, () => set('w', t), t === g.favorite ? 'favorite' : 'underdog', t))),
      row('Spread', [g.away, g.home].map((t) => tile(spreadLabel(t), d.s === t, dis, () => set('s', t), null, t))),
      row('Total', ['Over', 'Under'].map((o) => tile(o + ' ' + n(g.total), d.o === o, dis, () => set('o', o)))),
    );
    const foot = el('div', null, 'gc-foot');
    const stt = st.status[g.id];
    let text, kind;
    const impossible = d.w && d.s && d.w !== d.s && (pk || d.w !== g.favorite);
    if (stt && stt.kind !== 'ok') { text = stt.text; kind = stt.kind; }
    else if (impossible) { text = '⚠ ' + d.w + ' can’t win without covering. ' + (!isLocked || unlocked ? 'Tap a pick to fix.' : isAdmin ? 'Use Commissioner edit to fix.' : 'Ask the commissioner to fix.'); kind = 'warn'; }
    else if (unlocked && st.saved[g.id]) { text = 'Commissioner edit: changes save right away'; kind = 'ok'; }
    else if (stt) { text = stt.text; kind = stt.kind; }
    else if (st.saved[g.id]) { text = 'Saved ✓'; kind = 'ok'; }
    else if (isLocked) { text = st.target === st.me.code ? 'No pick made' : 'No pick (or hidden)'; kind = 'muted'; }
    else { const left = ['w', 's', 'o'].filter((k) => !d[k]).length; text = left === 3 ? 'Not picked yet' : 'Pick ' + left + ' more to save'; kind = 'todo'; }
    foot.append(el('span', text, 'gc-status ' + kind));
    if (isLocked && isAdmin && g.favorite) {
      const b = el('button', unlocked ? 'Done' : '🔓 Commissioner edit', 'chip');
      b.type = 'button';
      b.addEventListener('click', () => { st.unlock[g.id] = !unlocked; refreshCard(g); });
      foot.append(b);
    }
    const who = st.submitted[g.id] || [];
    if (isLocked && window.POOL.picksPanel) {
      const open = !!st.panelOpen[g.id];
      const b = el('button', (open ? '▾ Hide picks' : '▸ See everyone’s picks'), 'linkbtn gc-who');
      b.type = 'button';
      b.addEventListener('click', async () => {
        st.panelOpen[g.id] = !open;
        if (!open) await refreshPanel(g); else refreshCard(g);
      });
      foot.append(b);
      card.append(foot);
      if (open) {
        const rows = st.panelRows[g.id];
        const box = el('div', null, 'gc-panel');
        box.append(rows ? window.POOL.picksPanel(rows, st.players.length ? st.players : (window.POOL.state.seasonPlayers || [])) : el('p', 'Couldn’t load picks. Try again.', 'note'));
        card.append(box);
      }
      return card;
    }
    foot.append(el('span', who.length ? 'Picks in: ' + who.join(', ') : 'No picks in yet', 'gc-who'));
    card.append(foot);
    return card;
  }

  // Re-read everyone's picks for an open panel (after a save, or on the regular refresh).
  async function refreshPanel(g) {
    const {data, error} = await db.from('pick_scores').select('*').eq('game_id', g.id);
    if (!error) st.panelRows[g.id] = data || [];
    refreshCard(g);
  }

  function refreshCard(g) {
    const old = document.querySelector('.game-card[data-game="' + g.id + '"]');
    if (old) old.replaceWith(gameCard(g));
    const games = weekGames();
    $('pk-progress').textContent = games.filter((x) => st.saved[x.id]).length + ' of ' + games.length + ' games picked' + (st.target !== st.me.code ? ' for ' + st.target : '');
  }

  const saveTimers = {};
  function maybeSave(g) {
    const d = st.draft[g.id] || {};
    if (!(d.w && d.s && d.o)) { delete st.status[g.id]; refreshCard(g); return; }
    const s = st.saved[g.id];
    if (s && s.pick_winner === d.w && s.pick_spread === d.s && s.pick_ou === d.o) return;
    clearTimeout(saveTimers[g.id]);
    st.status[g.id] = {kind: 'busy', text: 'Saving…'};
    refreshCard(g);
    saveTimers[g.id] = setTimeout(async () => {
      const row = {player_code: st.target, game_id: g.id, pick_winner: d.w, pick_spread: d.s, pick_ou: d.o};
      const {error} = await db.rpc('submit_pick', {p_player: st.target, p_game: g.id, p_winner: d.w, p_spread: d.s, p_ou: d.o});
      if (error) {
        st.status[g.id] = {kind: 'err', text: friendly(error)};
      } else {
        st.saved[g.id] = row;
        delete st.status[g.id];
        P.dirty = true;                 // Weekly results / Dashboard reload next time they're opened
        if (st.panelOpen[g.id]) refreshPanel(g);
        const who = st.submitted[g.id] || (st.submitted[g.id] = []);
        if (!who.includes(st.target)) who.push(st.target);
      }
      refreshCard(g);
    }, 350);
  }



  // ---------- Set lines page ----------
  async function renderLines() {
    if (!st.me || !(st.me.is_line_setter || st.me.is_admin)) return;
    await loadGames();
    const have = [...new Set(st.games.map((g) => g.week))];
    const weeks = [...new Set([...have, ...Array.from({length: 18}, (_, i) => i + 1)])].sort((a, b) => a - b);
    if (st.lnWeek == null) st.lnWeek = defaultWeek();
    const sel = $('ln-week');
    sel.replaceChildren(...weeks.map((w) => new Option(weekLabel(w) + (have.includes(w) ? '' : ' (no games yet)'), String(w))));
    sel.value = String(st.lnWeek);
    sel.onchange = () => { st.lnWeek = Number(sel.value); $('ln-msg').textContent = ''; drawLines(); };
    $('ln-espn').disabled = st.lnWeek > 18;
    drawLines();
  }

  // Rows with an edit still waiting to save (so we can warn before leaving the page).
  const lnPending = {};
  window.addEventListener('beforeunload', (e) => { if (Object.keys(lnPending).length) { e.preventDefault(); e.returnValue = ''; } });

  // Each row's score-lock check; re-run every 30 seconds so boxes open right at kickoff.
  let lnLocks = [];
  setInterval(() => lnLocks.forEach((f) => f()), 30000);

  function drawLines() {
    lnLocks = [];
    const games = st.games.filter((g) => g.week === st.lnWeek);
    const tb = $('ln-table').tBodies[0];
    if (!games.length) { tb.replaceChildren(); const tr = el('tr'); const td = el('td', 'No games this week yet. Use “Load schedule from ESPN” or add them below.', 'note'); td.colSpan = 8; tr.append(td); tb.append(tr); return; }
    tb.replaceChildren(...games.map((g) => {
      const tr = el('tr');
      const history = !g.kickoff && g.legacy_winner;
      const kick = el('input'); kick.type = 'datetime-local'; kick.value = toLocalInput(g.kickoff);
      const fav = el('select'); fav.append(new Option('—', ''), new Option(g.away, g.away), new Option(g.home, g.home)); fav.value = g.favorite || '';
      const num = (v, step) => { const i = el('input'); i.type = 'number'; i.step = step; i.min = '0'; i.inputMode = 'decimal'; i.value = v == null ? '' : Number(v); i.className = 'num-in'; return i; };
      const sp = num(g.spread, '0.5'), tot = num(g.total, '0.5'), as = num(g.away_score, '1'), hs = num(g.home_score, '1');
      const msg = el('span', '', 'row-msg');
      const inputs = [kick, fav, sp, tot, as, hs];
      if (history) inputs.forEach((i) => { i.disabled = true; });
      // Score boxes stay locked until the game kicks off (by its saved kickoff time).
      const scoreLock = () => {
        const before = !history && (!g.kickoff || new Date(g.kickoff) > new Date());
        [as, hs].forEach((i) => {
          if (history) return;
          i.disabled = before;
          i.placeholder = before ? '🔒' : '';
          i.title = before ? 'Scores open at kickoff' : '';
        });
      };
      scoreLock();
      lnLocks.push(scoreLock);
      // Autosave: each row saves itself shortly after you stop typing, like picks do.
      const say = (text, kind) => { msg.textContent = text; msg.className = 'row-msg' + (kind ? ' ' + kind : ''); };
      let timer = null;
      const saveRow = async (leaving) => {
        timer = null; delete lnPending[g.id];
        const editing = !leaving && tr.contains(document.activeElement);
        const remind = (text) => say(editing ? 'Editing…' : text);
        const upd = {
          kickoff: fromLocalInput(kick.value),
          favorite: fav.value || null,
          spread: sp.value === '' ? null : Number(sp.value),
          total: tot.value === '' ? null : Number(tot.value),
          away_score: as.value === '' ? null : Number(as.value),
          home_score: hs.value === '' ? null : Number(hs.value),
        };
        if ((upd.away_score == null) !== (upd.home_score == null)) return remind('Enter both scores to save them.');
        if (upd.favorite && (upd.spread == null || upd.total == null)) return remind('Add the spread and total to save the line.');
        if (!upd.favorite && (upd.spread != null || upd.total != null)) return remind('Pick the favorite to save the line.');
        const norm = (k, v) => (v == null ? '' : k === 'kickoff' ? String(new Date(v).getTime()) : k === 'favorite' ? v : String(Number(v)));
        const changed = Object.fromEntries(Object.entries(upd).filter(([k, v]) => norm(k, v) !== norm(k, g[k])));
        if (!Object.keys(changed).length) return say(msg.textContent === 'Editing…' ? '' : msg.textContent, msg.className.includes('ok') ? 'ok' : '');
        say('Saving…');
        const {error} = await db.from('games').update(changed).eq('id', g.id);
        if (error) return say(friendly(error), 'err');
        Object.assign(g, changed);
        say('Saved ✓', 'ok');
        setTimeout(() => { if (msg.textContent === 'Saved ✓') { msg.classList.add('fade'); setTimeout(() => { if (msg.textContent === 'Saved ✓') say(''); }, 600); } }, 2500);
        if ('kickoff' in changed) scoreLock();
        if ('home_score' in changed || 'away_score' in changed) P.reload(true);
      };
      const schedule = (delay) => { clearTimeout(timer); lnPending[g.id] = true; say('Editing…'); timer = setTimeout(saveRow, delay); };
      inputs.forEach((i) => {
        i.addEventListener('input', () => schedule(900));
        i.addEventListener('change', () => schedule(150));
      });
      // Leaving the row: save now, or explain what's missing.
      tr.addEventListener('focusout', () => setTimeout(() => {
        if (tr.contains(document.activeElement)) return;
        if (timer || msg.textContent === 'Editing…') { clearTimeout(timer); saveRow(true); }
      }, 0));
      const gameTd = el('td', null, 'strong'); gameTd.append(el('div', g.away + ' @ ' + g.home), el('div', history ? 'from the spreadsheet' : '', 'note'));
      const td = (child) => { const c = el('td'); c.append(child); return c; };
      const last = el('td'); last.append(msg);
      tr.append(gameTd, td(kick), td(fav), td(sp), td(tot), td(as), td(hs), last);
      return tr;
    }));
  }

  async function addGame() {
    const away = $('ln-add-away').value, home = $('ln-add-home').value, kick = $('ln-add-kick').value, msg = $('ln-msg');
    if (!away || !home || away === home) { msg.textContent = 'Pick two different teams.'; return; }
    if (!kick) { msg.textContent = 'Add the kickoff time.'; return; }
    const wk = st.games.filter((g) => g.week === st.lnWeek);
    const next = wk.reduce((m, g) => Math.max(m, g.game_no), 0) + 1;
    const {error} = await db.from('games').insert({season: SEASON, week: st.lnWeek, week_label: 'Week ' + st.lnWeek, game_no: next, away, home, kickoff: fromLocalInput(kick)});
    if (error) { msg.textContent = /duplicate/i.test(error.message) ? away + ' @ ' + home + ' is already on this week.' : friendly(error); return; }
    msg.textContent = 'Added ' + away + ' @ ' + home + '.';
    await renderLines();
  }

  async function espnWeek() {
    const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=' + SEASON + '&seasontype=2&week=' + st.lnWeek;
    const r = await fetch(url);
    if (!r.ok) throw new Error('ESPN returned ' + r.status);
    const j = await r.json();
    return (j.events || []).map((ev) => {
      const c = ev.competitions[0];
      const side = (h) => c.competitors.find((x) => x.homeAway === h);
      const code = (x) => { const a = x.team.abbreviation.toUpperCase(); return ESPN_FIX[a] || a; };
      return {away: code(side('away')), home: code(side('home')), kickoff: new Date(c.date || ev.date).toISOString(), neutral: !!c.neutralSite,
        done: !!(c.status && c.status.type && c.status.type.completed), awayScore: Number(side('away').score), homeScore: Number(side('home').score)};
    }).filter((e) => TEAMS.includes(e.away) && TEAMS.includes(e.home)).sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  }

  async function importSchedule() {
    const msg = $('ln-msg');
    msg.textContent = 'Loading ' + weekLabel(st.lnWeek) + ' from ESPN…';
    try {
      const evs = await espnWeek();
      if (!evs.length) { msg.textContent = 'ESPN has no games listed for this week.'; return; }
      await loadGames();
      const wk = st.games.filter((g) => g.week === st.lnWeek);
      let next = wk.reduce((m, g) => Math.max(m, g.game_no), 0) + 1, added = 0, moved = 0;
      for (const e of evs) {
        const ex = wk.find((g) => g.away === e.away && g.home === e.home);
        if (ex) {
          if (!ex.kickoff || new Date(ex.kickoff).getTime() !== new Date(e.kickoff).getTime()) {
            const {error} = await db.from('games').update({kickoff: e.kickoff}).eq('id', ex.id);
            if (!error) moved++;
          }
        } else {
          const {error} = await db.from('games').insert({season: SEASON, week: st.lnWeek, week_label: 'Week ' + st.lnWeek, game_no: next++, away: e.away, home: e.home, neutral_site: e.neutral, kickoff: e.kickoff});
          if (error) throw error;
          added++;
        }
      }
      msg.textContent = 'Added ' + added + ' game' + (added === 1 ? '' : 's') + (moved ? ', updated ' + moved + ' kickoff time' + (moved === 1 ? '' : 's') : '') + '. Now set the lines; each row saves automatically.';
      await renderLines();
    } catch (e) {
      msg.textContent = 'Couldn’t load from ESPN (' + friendly(e) + '). You can add games by hand below.';
    }
  }

  async function importScores() {
    const msg = $('ln-msg');
    msg.textContent = 'Getting final scores from ESPN…';
    try {
      const evs = (await espnWeek()).filter((e) => e.done);
      await loadGames();
      const wk = st.games.filter((g) => g.week === st.lnWeek);
      let n = 0;
      for (const e of evs) {
        const g = wk.find((x) => x.away === e.away && x.home === e.home);
        if (!g || (g.away_score === e.awayScore && g.home_score === e.homeScore)) continue;
        const {error} = await db.from('games').update({away_score: e.awayScore, home_score: e.homeScore}).eq('id', g.id);
        if (error) throw error;
        n++;
      }
      msg.textContent = n ? 'Entered ' + n + ' final score' + (n === 1 ? '' : 's') + '. Standings are updated.' : 'No new final scores yet.';
      await renderLines();
      if (n) P.reload();
    } catch (e) {
      msg.textContent = 'Couldn’t get scores from ESPN (' + friendly(e) + '). You can type them in instead.';
    }
  }

  // ---------- wiring ----------
  $('signin-send').addEventListener('click', sendLink);
  $('signin-email').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendLink(); });
  $('signin-verify').addEventListener('click', verifyCode);
  $('signin-token').addEventListener('keydown', (e) => { if (e.key === 'Enter') verifyCode(); });
  $('ln-add').addEventListener('click', addGame);
  $('ln-espn').addEventListener('click', importSchedule);
  $('ln-scores').addEventListener('click', importScores);
  ['ln-add-away', 'ln-add-home'].forEach((id) => $(id).replaceChildren(new Option('Team', ''), ...TEAMS.map((t) => new Option(t, t))));

  P.onTab = (name) => {
    if (name === 'picks' && st.me) drawGames();
    if (name === 'lines') renderLines();
  };
  // keep countdowns and locks current
  setInterval(() => {
    if (P.state.tab === 'picks' && st.me && !document.activeElement.closest('.game-card')) {
      drawGames();
      weekGames().filter((g) => st.panelOpen[g.id]).forEach(refreshPanel);
    }
  }, 60000);

  db.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setTimeout(refreshAccount, 0);
  });
  refreshAccount().then(() => { if (arrivedFromLink && st.session) P.showTab('picks'); }).catch((e) => console.error(e));
})();
