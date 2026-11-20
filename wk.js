/* Kohikori · WaniKani connection (shared by the hub, vocab quiz and kanji quiz)
   - Your API key is kept only in this browser's storage. It is never put in backups or sync codes,
     and requests go straight from your browser to api.wanikani.com.
   - Only progress is used: which kanji and vocabulary you've reached Guru (or higher) on.
     WaniKani's own content (meanings, mnemonics) is not copied or shown.
   - Data is cached and refreshed at most every few hours. */
(function(){
  const API='https://api.wanikani.com/v2/';
  const K_KEY='kohikori_wk_key_v1', K_DATA='kohikori_wk_data_v1', K_SUBJ='kohikori_wk_subj_v1';
  const GURU=5, STALE=4*3600*1000;
  const get=k=>{ try { return localStorage.getItem(k); } catch(e){ return null; } };
  const set=(k,v)=>{ try { localStorage.setItem(k,v); return true; } catch(e){ return false; } };
  const del=k=>{ try { localStorage.removeItem(k); } catch(e){} };
  const jget=k=>{ try { return JSON.parse(get(k)||'null'); } catch(e){ return null; } };
  let inflight=null;

  async function call(url, key){
    const r=await fetch(url.startsWith('http')?url:API+url, {headers:{'Authorization':'Bearer '+key,'Wanikani-Revision':'20170710'}});
    if (r.status===401) throw new Error('WaniKani didn\'t accept that key. Check it on wanikani.com → Settings → API Tokens.');
    if (r.status===429) throw new Error('WaniKani is limiting requests right now. Try again in a minute.');
    if (!r.ok) throw new Error('WaniKani returned an error ('+r.status+'). Try again later.');
    return r.json();
  }
  async function all(url, key){
    const out=[]; let next=url;
    while (next){ const j=await call(next, key); out.push(...(j.data||[])); next=j.pages&&j.pages.next_url; }
    return out;
  }

  async function fetchAll(key){
    const user=(await call('user', key)).data;
    // everything you've reached Guru or higher on: kanji and vocabulary
    const asg=await all('assignments?subject_types=kanji,vocabulary,kana_vocabulary&srs_stages=5,6,7,8,9', key);
    // characters for each subject (they never change, so they're cached for good)
    const subj=jget(K_SUBJ)||{};
    const need=[...new Set(asg.map(a=>a.data.subject_id))].filter(id=>!(id in subj));
    for (let i=0;i<need.length;i+=500){
      const got=await all('subjects?ids='+need.slice(i,i+500).join(','), key);
      for (const s of got) subj[s.id]=s.data.characters||'';
    }
    set(K_SUBJ, JSON.stringify(subj));
    const kanji={}, vocab={};
    for (const a of asg){
      const ch=subj[a.data.subject_id]; if (!ch) continue;
      const st=a.data.srs_stage; if (st<GURU) continue;
      if (a.data.subject_type==='kanji') kanji[ch]=st; else vocab[ch]=st;
    }
    const d={at:Date.now(), user:user.username, level:user.level, kanji, vocab};
    set(K_DATA, JSON.stringify(d));
    return d;
  }

  const WK={
    GURU,
    key: ()=>get(K_KEY)||'',
    connected: ()=>!!get(K_KEY),
    data: ()=>get(K_KEY) ? jget(K_DATA) : null,
    // stage names, for display
    stageName: s => s>=9?'Burned':s>=8?'Enlightened':s>=7?'Master':s>=5?'Guru':s>=1?'Apprentice':'Locked',
    async connect(key){
      key=String(key||'').trim();
      if (!/^[0-9a-f-]{30,}$/i.test(key)) throw new Error('That doesn\'t look like a WaniKani API key. It\'s a long code with letters, numbers and dashes.');
      const d=await fetchAll(key);      // throws if the key is rejected
      set(K_KEY, key); set(K_DATA, JSON.stringify(d));
      window.dispatchEvent(new CustomEvent('kohikori-wk', {detail:d}));
      return d;
    },
    disconnect(){ del(K_KEY); del(K_DATA); del(K_SUBJ); window.dispatchEvent(new CustomEvent('kohikori-wk', {detail:null})); },
    // refresh in the background if the cached copy is old (or force=true)
    refresh(force){
      const key=get(K_KEY); if (!key) return Promise.resolve(null);
      const d=jget(K_DATA);
      if (!force && d && Date.now()-d.at < STALE) return Promise.resolve(d);
      if (inflight) return inflight;
      inflight=fetchAll(key).then(d=>{ window.dispatchEvent(new CustomEvent('kohikori-wk', {detail:d})); return d; })
        .finally(()=>{ inflight=null; });
      return inflight;
    },
    ago(t){ const m=Math.round((Date.now()-t)/60000); return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'; }
  };
  window.KohiWK=WK;
})();
