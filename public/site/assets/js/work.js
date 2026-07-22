
(function(){
  const rail=document.getElementById('workFilterRail');
  if(!rail)return;
  const reset=()=>{rail.scrollLeft=0;};
  requestAnimationFrame(reset);
  window.addEventListener('pageshow',reset);
  document.querySelectorAll('[data-lang-toggle]').forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(reset)));
})();
