import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../../core/tracking/trackEvent";
import { getDefaultTool, toolCatalog } from "./toolCatalog";
import { buildStyledNicknames } from "./nicknameStyles";

const PASSWORD_CHARSETS = [
  { id: "special", label: "znaki specjalne" },
  { id: "upper", label: "wielkie litery" },
  { id: "lower", label: "małe litery" },
  { id: "number", label: "cyfry" },
] as const;


function buildPasswordUrl(seed: string, charsets: string[], minLength: number, maxLength: number) {
  const trimmed = seed.trim();
  const range = minLength === maxLength ? `${minLength}` : `${minLength}-${maxLength}`;
  const password = `${charsets.join(",")},${range}`;
  const seedParam = trimmed ? `&seed=${encodeURIComponent(trimmed)}` : "";
  return `https://randomuser.me/api/?password=${encodeURIComponent(password)}${seedParam}`;
}

export function ToolsFeed() {
  const navigate = useNavigate();
  const defaultTool = useMemo(() => getDefaultTool() ?? toolCatalog[0], []);
  if (!defaultTool) return null;
  const [selectedToolId, setSelectedToolId] = useState(defaultTool.id);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [lastToolId, setLastToolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [usedSeed, setUsedSeed] = useState("");
  const [selectedCharsets, setSelectedCharsets] = useState<string[]>(["special", "upper", "lower", "number"]);
  const [minLength, setMinLength] = useState(10);
  const [maxLength, setMaxLength] = useState(24);

  useEffect(() => {
    trackEvent("page_view", { page: "tools_feed", title: "Generator nicków" });
  }, []);

  const activeTool = toolCatalog.find((tool) => tool.id === selectedToolId) ?? defaultTool;
  const hasResult = result.length > 0 && lastToolId === activeTool.id;

  const runTool = async () => {
    setLoading(true);
    setError("");
    try {
      setResult([]);
      setCopied(null);
      setLastToolId(null);
      if (activeTool.id === "password_generator") {
        const seed = input.trim() || "seed";
        const res = await fetch(buildPasswordUrl(seed, selectedCharsets, minLength, maxLength));
        if (!res.ok) throw new Error("Password API failed");
        const data = (await res.json()) as { results?: Array<{ login?: { password?: string } }> };
        const passwords = (data.results ?? []).map((item) => item.login?.password).filter((value): value is string => Boolean(value));
        if (!passwords.length) throw new Error("No passwords returned");
        setUsedSeed(seed);
        setLastToolId(activeTool.id);
        setResult(passwords.slice(0, 5));
      } else {
        const prefix = input.trim();
        const source = buildStyledNicknames(prefix);
        if (!source.length) throw new Error("No names returned");
        setUsedSeed("");
        setLastToolId(activeTool.id);
        setResult(source);
      }
      trackEvent("tool_used", {
        toolId: activeTool.id,
        category: activeTool.category,
      });
    } catch {
      setError("Nie udało się pobrać wyników.");
    } finally {
      setLoading(false);
    }
  };

  const copyVariant = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 1200);
    } catch {
      setError("Kopiowanie nie powiodło się.");
    }
  };

  const backToQuiz = () => {
    navigate("/?variant=quiz", { replace: false });
    window.dispatchEvent(new CustomEvent("spk-variant-change", { detail: "quiz" }));
  };

  return (
    <div className="spk-tool">
      <div className="spk-tool__hero spk-card">
        <span className="spk-picker__eyebrow">Narzędzia</span>
        <h1 className="spk-title">{activeTool.title}</h1>
        <p className="spk-muted">{activeTool.description}</p>
      </div>

      <div className="spk-tool__panel spk-card">
        <label className="spk-tool__label" htmlFor="tool-input">
          {activeTool.id === "password_generator" ? "Seed (np. 42)" : "Twój wpis"}
        </label>
        <input
          id="tool-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeTool.placeholder}
          className="spk-tool__input"
        />
        {activeTool.id === "password_generator" ? (
          <div className="spk-tool__options">
            <div className="spk-tool__option-group">
              <span className="spk-tool__option-label">Zestawy znaków</span>
              <div className="spk-tool__chips">
                {PASSWORD_CHARSETS.map((charset) => {
                  const checked = selectedCharsets.includes(charset.id);
                  return (
                    <label key={charset.id} className={["spk-tool__chip", checked ? "spk-tool__chip--active" : ""].join(" ")}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedCharsets((current) =>
                            current.includes(charset.id) ? current.filter((item) => item !== charset.id) : [...current, charset.id],
                          );
                        }}
                      />
                      {charset.label}
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="spk-tool__option-group">
              <span className="spk-tool__option-label">Długość</span>
              <div className="spk-tool__lengths">
                <label className="spk-tool__field">
                  <span>Minimalna długość</span>
                  <input type="number" min={1} value={minLength} onChange={(e) => setMinLength(Number(e.target.value) || 1)} className="spk-tool__input" />
                </label>
                <label className="spk-tool__field">
                  <span>Maksymalna długość</span>
                  <input type="number" min={1} value={maxLength} onChange={(e) => setMaxLength(Number(e.target.value) || 1)} className="spk-tool__input" />
                </label>
              </div>
            </div>
          </div>
        ) : null}
        <button type="button" onClick={runTool} className="spk-tool__cta">
          {loading ? "Ładowanie..." : activeTool.id === "password_generator" ? "Generuj hasła" : "Generuj nicki"}
        </button>
        {error ? <p className="spk-tool__error">{error}</p> : null}
      </div>

      {hasResult ? (
        <div className="spk-tool__result spk-card">
          <span className="spk-picker__eyebrow">Wyniki</span>
          <div className="spk-tool__styled-list">
            {result.map((item) => (
              <button key={item} type="button" onClick={() => copyVariant(item)} className="spk-tool__styled-item">
                {item}
              </button>
            ))}
          </div>
          {activeTool.id === "password_generator" ? <p className="spk-muted">Seed: {usedSeed}</p> : null}
          {result.length ? <p className="spk-muted">{copied ? `Skopiowano: ${copied}` : "Kliknij wynik, aby go skopiować."}</p> : null}
        </div>
      ) : null}

      <div className="spk-tool__grid">
        {toolCatalog.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => {
              setSelectedToolId(tool.id);
              setResult([]);
              setCopied(null);
              setUsedSeed("");
              setLastToolId(null);
            }}
            className={["spk-tool__mini", tool.id === activeTool.id ? "spk-tool__mini--active" : ""].join(" ")}
          >
            <strong>{tool.title}</strong>
            <span className="spk-tool__category">{tool.category}</span>
          </button>
        ))}
      </div>

      <button type="button" className="spk-picker__cta" onClick={backToQuiz}>
        Wróć do quizów
      </button>
    </div>
  );
}
