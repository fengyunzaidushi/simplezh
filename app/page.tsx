"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import OpenCC from "opencc-js";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileText,
  History,
  Languages,
  Menu,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  X,
} from "lucide-react";

type LocaleKey = "cn" | "tw" | "hk";

type LocaleOption = {
  key: LocaleKey;
  label: string;
  short: string;
  description: string;
};

const localeOptions: LocaleOption[] = [
  { key: "cn", label: "简体中文", short: "简", description: "中国大陆" },
  { key: "tw", label: "繁體中文", short: "繁", description: "台湾正体" },
  { key: "hk", label: "繁體中文", short: "港", description: "香港繁体" },
];

const initialTerms = [
  { source: "软件", target: "軟體" },
  { source: "服务器", target: "伺服器" },
];

function getLocale(key: LocaleKey) {
  return localeOptions.find((item) => item.key === key) ?? localeOptions[0];
}

function protectSegments(text: string) {
  const protectedSegments: string[] = [];
  const protectedText = text.replace(
    /```[\s\S]*?```|`[^`\n]+`|https?:\/\/[^\s)]+|<[^>]+>/g,
    (segment) => {
      const token = `SIMPLEZHPROTECTED${protectedSegments.length}TOKEN`;
      protectedSegments.push(segment);
      return token;
    },
  );

  return { protectedText, protectedSegments };
}

function restoreSegments(text: string, protectedSegments: string[]) {
  return text.replace(/SIMPLEZHPROTECTED(\d+)TOKEN/g, (_, index: string) => {
    return protectedSegments[Number(index)] ?? "";
  });
}

function applyCustomTerms(text: string, terms: Array<{ source: string; target: string }>) {
  return terms
    .filter((term) => term.source.trim() && term.target.trim())
    .sort((a, b) => b.source.length - a.source.length)
    .reduce((result, term) => result.split(term.source).join(term.target), text);
}

function convertText(
  text: string,
  from: LocaleKey,
  to: LocaleKey,
  terms: Array<{ source: string; target: string }>,
  preserveFormat: boolean,
) {
  if (!text || from === to) return text;

  const converter = OpenCC.Converter({ from, to });
  const { protectedText, protectedSegments } = preserveFormat
    ? protectSegments(text)
    : { protectedText: text, protectedSegments: [] };
  const converted = converter(applyCustomTerms(protectedText, terms));
  return restoreSegments(converted, protectedSegments);
}

export default function Home() {
  const [sourceLocale, setSourceLocale] = useState<LocaleKey>("cn");
  const [targetLocale, setTargetLocale] = useState<LocaleKey>("tw");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [preserveFormat, setPreserveFormat] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [hasConverted, setHasConverted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [terms, setTerms] = useState(initialTerms);
  const [newSource, setNewSource] = useState("");
  const [newTarget, setNewTarget] = useState("");

  const source = getLocale(sourceLocale);
  const target = getLocale(targetLocale);
  const changedCount = useMemo(() => {
    if (!result || !text) return 0;
    let count = 0;
    const length = Math.max(text.length, result.length);
    for (let index = 0; index < length; index += 1) {
      if (text[index] !== result[index]) count += 1;
    }
    return count;
  }, [result, text]);

  const handleConvert = useCallback(() => {
    if (!text.trim()) return;
    setIsConverting(true);
    setCopied(false);
    window.setTimeout(() => {
      setResult(convertText(text, sourceLocale, targetLocale, terms, preserveFormat));
      setHasConverted(true);
      setIsConverting(false);
    }, 160);
  }, [preserveFormat, sourceLocale, targetLocale, terms, text]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handleConvert();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [handleConvert]);

  const handleSwap = () => {
    setSourceLocale(targetLocale);
    setTargetLocale(sourceLocale);
    if (result) {
      setText(result);
      setResult(text);
    }
    setHasConverted(Boolean(result));
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `simplezh-${targetLocale}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const addTerm = () => {
    if (!newSource.trim() || !newTarget.trim()) return;
    setTerms((current) => [...current, { source: newSource.trim(), target: newTarget.trim() }]);
    setNewSource("");
    setNewTarget("");
  };

  const removeTerm = (sourceTerm: string) => {
    setTerms((current) => current.filter((term) => term.source !== sourceTerm));
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Languages size={18} strokeWidth={2.4} /></div>
          <span className="brand-name">simplezh</span>
          <span className="brand-badge">工作台</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-button mobile-menu" aria-label="打开菜单"><Menu size={18} /></button>
          <button className="topbar-link"><History size={15} /> 历史记录</button>
          <button className="topbar-link"><Settings2 size={15} /> 设置</button>
          <div className="avatar">林</div>
        </div>
      </header>

      <div className="content-wrap">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="section-label">工作区</div>
            <button className="sidebar-item active"><FileText size={17} /> 新建转换 <span className="item-kicker">⌘ N</span></button>
            <button className="sidebar-item"><History size={17} /> 最近使用 <span className="item-count">3</span></button>
          </div>
          <div className="sidebar-section glossary-nav">
            <div className="section-label">词汇表</div>
            <button className="sidebar-item" onClick={() => setShowGlossary(true)}><Sparkles size={17} /> 我的词汇表 <span className="item-count">{terms.length}</span></button>
          </div>
          <div className="sidebar-footer">
            <div className="usage-title"><span>本月用量</span><span>12%</span></div>
            <div className="usage-track"><div className="usage-fill" /></div>
            <div className="usage-caption">12,420 / 100,000 字符</div>
            <button className="upgrade-button">升级额度 <span>→</span></button>
          </div>
        </aside>

        <section className="workspace">
          <div className="workspace-heading">
            <div>
              <div className="eyebrow">新的转换任务</div>
              <h1>让中文内容，抵达更多读者</h1>
              <p>保留原有格式，转换成自然的地区用语。</p>
            </div>
            <button className="secondary-button" onClick={() => { setText(""); setResult(""); setHasConverted(false); }}><Plus size={16} /> 新建</button>
          </div>

          <div className="toolbar">
            <div className="language-picker">
              <div className="language-select">
                <span className={`locale-dot locale-${sourceLocale}`}>{source.short}</span>
                <select value={sourceLocale} onChange={(event) => setSourceLocale(event.target.value as LocaleKey)} aria-label="原文语言">
                  {localeOptions.map((option) => <option key={option.key} value={option.key}>{option.label} · {option.description}</option>)}
                </select>
                <ChevronDown size={15} />
              </div>
              <button className="swap-button" onClick={handleSwap} aria-label="交换源语言和目标语言" title="交换源语言和目标语言"><ArrowLeftRight size={16} /></button>
              <div className="language-select target-select">
                <span className={`locale-dot locale-${targetLocale}`}>{target.short}</span>
                <select value={targetLocale} onChange={(event) => setTargetLocale(event.target.value as LocaleKey)} aria-label="目标语言">
                  {localeOptions.map((option) => <option key={option.key} value={option.key}>{option.label} · {option.description}</option>)}
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
            <div className="toolbar-options">
              <label className="toggle-label"><input type="checkbox" checked={preserveFormat} onChange={(event) => setPreserveFormat(event.target.checked)} /><span className="toggle" />保留格式</label>
              <button className={`toolbar-tool ${showGlossary ? "selected" : ""}`} onClick={() => setShowGlossary(true)}><Sparkles size={15} /> 词汇表 <span className="toolbar-count">{terms.length}</span></button>
              <button className="icon-button" aria-label="更多选项"><MoreHorizontal size={18} /></button>
            </div>
          </div>

          <div className="editor-grid">
            <section className="editor-panel source-panel">
              <div className="panel-head"><div><span className="panel-title">原文</span><span className="panel-caption">{source.label}</span></div><button className="panel-more" aria-label="原文更多操作"><MoreHorizontal size={17} /></button></div>
              <textarea value={text} onChange={(event) => { setText(event.target.value); setHasConverted(false); }} placeholder="粘贴或输入需要转换的内容…" spellCheck={false} />
              <div className="panel-foot"><span>{text.length.toLocaleString()} 字符</span><button className="clear-button" onClick={() => setText("")} disabled={!text}><RotateCcw size={13} /> 清空</button></div>
            </section>

            <section className={`editor-panel result-panel ${hasConverted ? "has-result" : ""}`}>
              <div className="panel-head"><div><span className="panel-title">转换结果</span><span className="panel-caption">{target.label} · {target.description}</span></div><div className="result-status">{hasConverted && <><span className="status-dot" /> 已完成</>}</div></div>
              <textarea value={result} onChange={(event) => setResult(event.target.value)} placeholder="转换结果会显示在这里…" spellCheck={false} />
              <div className="panel-foot"><span>{result.length.toLocaleString()} 字符{hasConverted && changedCount > 0 ? ` · ${changedCount.toLocaleString()} 处变化` : ""}</span><div className="result-actions"><button className="clear-button" onClick={handleCopy} disabled={!result}>{copied ? <Check size={13} /> : <Clipboard size={13} />} {copied ? "已复制" : "复制"}</button><button className="clear-button" onClick={handleDownload} disabled={!result}><Download size={13} /> 下载</button></div></div>
            </section>
          </div>

          <div className="action-row"><div className="action-hint"><span className="hint-key">⌘</span><span className="hint-key">↵</span> 开始转换</div><button className="convert-button" onClick={handleConvert} disabled={!text.trim() || isConverting}>{isConverting ? <><span className="spinner" /> 转换中…</> : <><Sparkles size={17} /> 开始转换 <span className="button-arrow">→</span></>}</button></div>

          <div className="tip-banner"><div className="tip-icon"><Sparkles size={16} /></div><div><strong>试试自定义词汇表</strong><span>让「软件」在台湾版本中自动转换为「軟體」，品牌用语始终保持一致。</span></div><button onClick={() => setShowGlossary(true)}>去设置 <span>→</span></button></div>
        </section>
      </div>

      {showGlossary && <div className="modal-backdrop" onClick={() => setShowGlossary(false)}><section className="glossary-modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">当前工作区</div><h2>我的词汇表</h2></div><button className="icon-button" onClick={() => setShowGlossary(false)} aria-label="关闭词汇表"><X size={18} /></button></div><p className="modal-copy">自定义词条会覆盖默认转换结果，当前任务立即生效。</p><div className="term-list">{terms.map((term) => <div className="term-row" key={term.source}><span>{term.source}</span><ArrowLeftRight size={14} /><span>{term.target}</span><button className="term-remove" onClick={() => removeTerm(term.source)} aria-label={`删除${term.source}`}><X size={14} /></button></div>)}</div><div className="term-add"><input value={newSource} onChange={(event) => setNewSource(event.target.value)} placeholder="源词" /><ArrowLeftRight size={14} /><input value={newTarget} onChange={(event) => setNewTarget(event.target.value)} placeholder="转换结果" /><button className="add-term-button" onClick={addTerm} aria-label="添加词条"><Plus size={16} /></button></div><div className="modal-foot"><span>{terms.length} 个词条已启用</span><button className="primary-small" onClick={() => setShowGlossary(false)}>完成</button></div></section></div>}
    </main>
  );
}
