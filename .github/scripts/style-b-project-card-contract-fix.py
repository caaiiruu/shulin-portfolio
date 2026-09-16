from pathlib import Path

work_path = Path('public/site/assets/js/work.js')
work = work_path.read_text()
old = """      link.innerHTML = control.innerHTML;
      control.replaceWith(link);
"""
new = """      while (control.firstChild) link.append(control.firstChild);
      control.replaceWith(link);
"""
if old not in work:
    raise SystemExit('navigation DOM-copy block not found')
work = work.replace(old, new, 1)
work_path.write_text(work)
