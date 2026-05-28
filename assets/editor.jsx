/* editor.jsx — Word-like rich text editor
   Built on contentEditable + document.execCommand (still the most reliable
   cross-browser primitive for a polished WYSIWYG without a heavy dep).
*/
const { useState: _useStateE, useEffect: _useEffectE, useRef: _useRefE, useCallback: _useCallbackE } = React;

function RichEditor({ value, onChange, onDirtyChange }) {
  const ref = _useRefE(null);
  const [active, setActive] = _useStateE({});
  const [block, setBlock] = _useStateE('p');
  const lastHtmlRef = _useRefE(value || '');

  // Set initial HTML only on mount / when value changes externally
  _useEffectE(() => {
    if (ref.current && (value || '') !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
      lastHtmlRef.current = value || '';
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    ref.current && ref.current.focus();
    try { document.execCommand(cmd, false, val); } catch (e) {}
    handleInput();
    refreshState();
  };

  const refreshState = () => {
    const next = {};
    ['bold', 'italic', 'underline', 'strikeThrough',
      'insertUnorderedList', 'insertOrderedList',
      'justifyLeft', 'justifyCenter', 'justifyRight'].forEach((c) => {
      try { next[c] = document.queryCommandState(c); } catch (e) { next[c] = false; }
    });
    setActive(next);
    try {
      const b = (document.queryCommandValue('formatBlock') || '').toLowerCase().replace(/[<>]/g, '');
      setBlock(b || 'p');
    } catch (e) {}
  };

  const handleInput = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    lastHtmlRef.current = html;
    onChange && onChange(html);
    onDirtyChange && onDirtyChange(true);
  };

  const handleKeyDown = (e) => {
    // Smart shortcuts
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey) {
      const k = e.key.toLowerCase();
      if (k === 'b') { e.preventDefault(); exec('bold'); return; }
      if (k === 'i') { e.preventDefault(); exec('italic'); return; }
      if (k === 'u') { e.preventDefault(); exec('underline'); return; }
      if (k === 'k') { e.preventDefault(); promptLink(); return; }
    }
  };

  const handlePaste = (e) => {
    // Strip pasted formatting — plain-text paste, then convert linebreaks
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const html = text
      .split(/\n{2,}/)
      .map((p) => '<p>' + p.replace(/\n/g, '<br>').replace(/</g, '&lt;') + '</p>')
      .join('');
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  const promptLink = () => {
    const url = window.prompt('Link URL', 'https://');
    if (!url) return;
    exec('createLink', url);
    // make links open in new tab
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      let node = sel.anchorNode;
      while (node && node.nodeName !== 'A') node = node.parentElement;
      if (node) { node.target = '_blank'; node.rel = 'noopener'; }
    }
  };

  const insertImage = async () => {
    // Offer file upload first; users can still paste a URL inline.
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        const r = await Store.uploadFile(file);
        exec('insertImage', r.url);
      } catch (e) {
        const url = window.prompt('Upload failed. Paste an image URL instead:', 'https://');
        if (url) exec('insertImage', url);
      }
    };
    input.click();
  };

  const insertHr = () => {
    exec('insertHTML', '<hr>');
  };

  const insertTable = () => {
    const rows = parseInt(window.prompt('Rows', '3'), 10);
    const cols = parseInt(window.prompt('Columns', '3'), 10);
    if (!rows || !cols) return;
    let html = '<table><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += r === 0 ? '<th>Header</th>' : '<td>Cell</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p></p>';
    exec('insertHTML', html);
  };

  const setBlockTag = (tag) => exec('formatBlock', tag);

  const TBtn = ({ name, label, cmd, val, onClick, on, big }) => (
    <button
      className={'kb-tb-btn' + (on ? ' is-on' : '')}
      title={label}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick ? onClick : () => exec(cmd, val)}
    >
      {name ? <Icon name={name} size={big ? 18 : 16} /> : <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>}
    </button>
  );

  return (
    <div className="kb-editor">
      <div className="kb-editor__toolbar" role="toolbar">
        <div className="kb-tb-group">
          <TBtn name="undo" label="Undo" cmd="undo" />
          <TBtn name="redo" label="Redo" cmd="redo" />
        </div>
        <div className="kb-tb-group">
          <select
            className="kb-tb-select"
            value={['h1','h2','h3','blockquote','pre','p'].includes(block) ? block : 'p'}
            onChange={(e) => setBlockTag(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            title="Block style"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="blockquote">Quote</option>
            <option value="pre">Code block</option>
          </select>
          <select
            className="kb-tb-select"
            defaultValue=""
            onChange={(e) => { if (e.target.value) { exec('fontName', e.target.value); e.target.value = ''; } }}
            title="Font family"
          >
            <option value="">Font</option>
            <option value="'Plus Jakarta Sans', sans-serif">Sans</option>
            <option value="'Instrument Serif', serif">Serif</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'JetBrains Mono', monospace">Mono</option>
          </select>
          <select
            className="kb-tb-select"
            defaultValue=""
            onChange={(e) => { if (e.target.value) { exec('fontSize', e.target.value); e.target.value = ''; } }}
            title="Font size"
          >
            <option value="">Size</option>
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="5">Large</option>
            <option value="6">XL</option>
            <option value="7">XXL</option>
          </select>
        </div>
        <div className="kb-tb-group">
          <TBtn name="bold" label="Bold (⌘B)" cmd="bold" on={active.bold} />
          <TBtn name="italic" label="Italic (⌘I)" cmd="italic" on={active.italic} />
          <TBtn name="underline" label="Underline (⌘U)" cmd="underline" on={active.underline} />
          <TBtn name="strike" label="Strikethrough" cmd="strikeThrough" on={active.strikeThrough} />
          <input
            type="color"
            className="kb-tb-color"
            title="Text color"
            onChange={(e) => exec('foreColor', e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="kb-tb-group">
          <TBtn name="alignLeft" label="Align left" cmd="justifyLeft" on={active.justifyLeft} />
          <TBtn name="alignCenter" label="Align center" cmd="justifyCenter" on={active.justifyCenter} />
          <TBtn name="alignRight" label="Align right" cmd="justifyRight" on={active.justifyRight} />
        </div>
        <div className="kb-tb-group">
          <TBtn name="list" label="Bulleted list" cmd="insertUnorderedList" on={active.insertUnorderedList} />
          <TBtn name="listOl" label="Numbered list" cmd="insertOrderedList" on={active.insertOrderedList} />
          <TBtn name="quote" label="Quote" onClick={() => setBlockTag('blockquote')} />
          <TBtn name="code" label="Inline code" onClick={() => exec('insertHTML', '<code>' + (window.getSelection().toString() || 'code') + '</code>')} />
        </div>
        <div className="kb-tb-group">
          <TBtn name="link" label="Insert link (⌘K)" onClick={promptLink} />
          <TBtn name="image" label="Insert image" onClick={insertImage} />
          <TBtn name="hr" label="Horizontal rule" onClick={insertHr} />
          <TBtn label="Table" onClick={insertTable} />
        </div>
        <div className="kb-tb-group">
          <TBtn label="Clear" onClick={() => exec('removeFormat')} />
        </div>
      </div>
      <div className="kb-editor__canvas">
        <div
          ref={ref}
          className="kb-editor__page"
          contentEditable
          spellCheck
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onMouseUp={refreshState}
          onKeyUp={refreshState}
          onFocus={refreshState}
          suppressContentEditableWarning
        />
      </div>
      <div className="kb-editor__status">
        <span>{stripHtml(lastHtmlRef.current).trim().split(/\s+/).filter(Boolean).length} words · {readMinutes(lastHtmlRef.current)} min read</span>
        <span>Markdown-paste safe · ⌘B / ⌘I / ⌘K shortcuts</span>
      </div>
    </div>
  );
}

Object.assign(window, { RichEditor });
