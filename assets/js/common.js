function nowForInput() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const s = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return s;
}

function initAutoNow() {
  document.querySelectorAll('input[data-auto-now="true"]').forEach(el => {
    if (!el.value) el.value = nowForInput();
  });
}

function collectFormData(form) {
  const data = {};
  const fields = form.querySelectorAll('[name]');
  fields.forEach(el => {
    const key = el.name;
    if (el.type === 'file') {
      data[key] = el.files && el.files[0] ? el.files[0].name : '';
    } else if (el.type === 'checkbox') {
      data[key] = el.checked;
    } else if (el.type === 'radio') {
      if (el.checked) data[key] = el.value;
    } else {
      data[key] = el.value;
    }
  });
  // 富文本
  form.querySelectorAll('[data-rt][name]').forEach(el => {
    data[el.getAttribute('name')] = el.innerHTML.trim();
  });
  return data;
}

function attachPreview(form) {
  const preview = document.getElementById('preview');
  const btn = document.getElementById('btn-preview');
  if (!btn || !preview) return;
  btn.addEventListener('click', () => {
    const data = collectFormData(form);
    preview.textContent = JSON.stringify(data, null, 2);
  });
}

function toggleBySelect(selectId, mappings) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const apply = () => {
    const v = sel.value;
    Object.entries(mappings).forEach(([key, showVals]) => {
      const el = document.getElementById(key);
      if (!el) return;
      el.style.display = showVals.includes(v) ? '' : 'none';
    });
  };
  sel.addEventListener('change', apply);
  apply();
}

function initToolbar() {
  document.querySelectorAll('[data-rt-toolbar] button').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.cmd;
      document.execCommand(cmd, false, null);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAutoNow();
  initToolbar();
});