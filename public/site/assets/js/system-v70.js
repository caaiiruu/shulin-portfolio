(() => {
  'use strict';
  const doc = document;

  const cleanGeneratedOverview = () => {
    doc.querySelectorAll('.info-grid-v45 > div,.project-signals-v45 > div').forEach(cell => {
      const value = cell.querySelector('strong,dd');
      const text = value?.textContent.trim() || '';
      const empty = !text || /^(undefined|null|—|-|n\/a)$/i.test(text);
      cell.dataset.empty = String(empty);
      // These cells are persistent render targets. They begin empty and are
      // populated from the Project SSOT only after a project is opened.
      cell.hidden = empty;
    });
    doc.querySelectorAll('.decision-result-v46').forEach(node => {
      node.setAttribute('role','note');
      node.setAttribute('aria-label',doc.documentElement.lang === 'zh' ? '決策帶來的結果' : 'Decision outcome');
    });
  };

  const dialog = doc.getElementById('detailDialog');
  if (dialog) new MutationObserver(cleanGeneratedOverview).observe(dialog,{subtree:true,childList:true,characterData:true});
  cleanGeneratedOverview();
})();
