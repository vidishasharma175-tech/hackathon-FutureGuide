// tools.js - shared helpers for the tool pages
async function postJSON(url, payload){
  try{
    const res = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
    if (!res.ok) throw res;
    return await res.json();
  }catch(err){
    // fallback to mock JSON if available
    try{
      const name = url.split('/').pop();
      const mock = await fetch('/mock/' + name + '.json');
      if (mock.ok) return await mock.json();
    }catch(e){/* ignore */}
    throw err;
  }
}

function displayResult(container, data){
  const top = data.top || data.suggestion || data.recommendation || data.result || null;
  const reasons = data.reasons || data.explanation || data.details || null;
  container.innerHTML = '';
  const h = document.createElement('div');
  h.className = 'result';
  if (top) h.innerHTML = `<strong>Top suggestion:</strong><div style="margin-top:8px">${top}</div>`;
  else h.textContent = 'No suggestion returned';
  if (reasons) {
    const p = document.createElement('div'); p.className='small'; p.style.marginTop='8px'; p.textContent = String(reasons);
    h.appendChild(p);
  }
  container.appendChild(h);
}
