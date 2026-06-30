// main.js — UI interactions and animations
window.addEventListener('DOMContentLoaded', () => {
  // Simple GSAP intro animation if gsap loaded
  function readyAnim(){
    if (window.gsap) {
      gsap.registerPlugin(window.ScrollTrigger);
      gsap.from('.hero-title',{y:30,opacity:0,duration:0.8,ease:'power3.out',stagger:0.04});
      gsap.from('.hero-panel',{y:20,opacity:0,duration:0.8,delay:0.15});
      gsap.utils.toArray('.feature-card, .tool, .feature-media').forEach((el,i)=>{
        gsap.from(el,{y:30,opacity:0,duration:0.7,delay:0.12 + i*0.06,scrollTrigger:{trigger:el,start:'top 85%'}})
      });
    }
  }
  readyAnim();

  const quickForm = document.getElementById('quickForm');
  const resultEl = document.getElementById('quickResult');
  const submitBtn = document.getElementById('submitQuick');

  quickForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subjects = document.getElementById('subjects').value;
    const interest = document.getElementById('interest').value;
    if (!subjects && !interest) { resultEl.textContent = 'Please provide at least one input.'; return; }
    submitBtn.disabled = true; submitBtn.textContent = 'Suggesting...';
    try {
      const res = await fetch('/api/stream-selector', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ subjects, interest })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({ message: res.statusText }));
        resultEl.textContent = 'Error: ' + (err.message || res.statusText);
      } else {
        const data = await res.json();
        // Expecting API to return { top: '...' } or similar
        const top = data.top || data.suggestion || JSON.stringify(data);
        resultEl.innerHTML = `<strong>Top suggestion:</strong> <div style="margin-top:6px">${top}</div>`;
      }
    } catch(err){
      resultEl.textContent = 'Network error';
    } finally { submitBtn.disabled = false; submitBtn.textContent = 'Suggest'; }
  });

  // CTA buttons scroll to form
  document.getElementById('startNow').addEventListener('click', ()=>{
    document.querySelector('.hero-panel').scrollIntoView({behavior:'smooth',block:'center'});
  });
  document.getElementById('ctaTop').addEventListener('click', ()=>{
    document.querySelector('.hero-panel').scrollIntoView({behavior:'smooth',block:'center'});
  });
});
