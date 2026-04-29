import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../../core/tracking/trackEvent";
import { getDefaultTool, toolCatalog } from "./toolCatalog";
import { buildStyledNicknames } from "./nicknameStyles";

const VILLAGE_IMAGES = [
  "/assets/village/Village_1_xpl6vkxpl6vkxpl6.png",
  "/assets/village/Village_2_r5y3v5r5y3v5r5y3.png",
  "/assets/village/Village_3_kvo5gpkvo5gpkvo5.png",
  "/assets/village/Village_4_puyfohpuyfohpuyf.png",
  "/assets/village/Village_5_6fjs5c6fjs5c6fjs.png",
  "/assets/village/Village_6_szffneszffneszff.png",
  "/assets/village/Village_7_x8uss7x8uss7x8us.png",
];

const VILLAGE_LEVELS = [0, 10, 35, 135, 385, 1385, 3885] as const;
const VILLAGE_STATE_KEY = "spk_village_state";
const VILLAGE_TOTAL_CLICKS_KEY = "spk_village_clicks";

type VillageState = {
  stage: number;
  clicks: number;
};

function getVillageState(): VillageState {
  try {
    const raw = localStorage.getItem(VILLAGE_STATE_KEY);
    if (!raw) return { stage: 1, clicks: 0 };
    const parsed = JSON.parse(raw) as VillageState;
    return {
      stage: Math.min(Math.max(parsed.stage ?? 1, 1), 7),
      clicks: Math.max(parsed.clicks ?? 0, 0),
    };
  } catch {
    return { stage: 1, clicks: 0 };
  }
}

function setVillageState(next: VillageState) {
  try {
    localStorage.setItem(VILLAGE_STATE_KEY, JSON.stringify(next));
    localStorage.setItem(VILLAGE_TOTAL_CLICKS_KEY, String(next.clicks));
  } catch {}
}

function getVillageStage(clicks: number) {
  if (clicks >= 3885) return 7;
  if (clicks >= 1385) return 6;
  if (clicks >= 385) return 5;
  if (clicks >= 135) return 4;
  if (clicks >= 35) return 3;
  if (clicks >= 10) return 2;
  return 1;
}

function getVillageProgress(clicks: number) {
  const nextThreshold = VILLAGE_LEVELS.find((level) => level > clicks);
  return nextThreshold ? nextThreshold - clicks : 0;
}

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
  const [result, setResult] = useState<string[]>([]);
  const [nicknameInput, setNicknameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [lastToolId, setLastToolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [usedSeed, setUsedSeed] = useState("");
  const [selectedCharsets, setSelectedCharsets] = useState<string[]>(["special", "upper", "lower", "number"]);
  const [minLength, setMinLength] = useState(10);
  const [maxLength, setMaxLength] = useState(24);
  const [villageState, setVillageStateState] = useState<VillageState>(() => getVillageState());

  useEffect(() => {
    trackEvent("page_view", { page: "tools_feed", title: "Gra typu click-it w rozwijanie wioski" });
  }, []);

  const activeTool = toolCatalog.find((tool) => tool.id === selectedToolId) ?? defaultTool;
  const hasResult = result.length > 0 && lastToolId === activeTool.id;
  const villageImage = VILLAGE_IMAGES[villageState.stage - 1] ?? VILLAGE_IMAGES[0];

  const runTool = async () => {
    setLoading(true);
    setError("");
    try {
      setResult([]);
      setCopied(null);
      setLastToolId(null);
      if (activeTool.id === "village_clicker") {
        const totalClicks = villageState.clicks + 1;
        const stage = getVillageStage(totalClicks);
        const nextState = { stage, clicks: totalClicks };
        setVillageStateState(nextState);
        setVillageState(nextState);
        setLastToolId(activeTool.id);
        setResult([]);
      } else if (activeTool.id === "password_generator") {
        const seed = passwordInput.trim() || "seed";
        const res = await fetch(buildPasswordUrl(seed, selectedCharsets, minLength, maxLength), {
          credentials: "omit",
          mode: "cors",
        });
        if (!res.ok) throw new Error("Password API failed");
        const data = (await res.json()) as { results?: Array<{ login?: { password?: string } }> };
        const passwords = (data.results ?? []).map((item) => item.login?.password).filter((value): value is string => Boolean(value));
        if (!passwords.length) throw new Error("No passwords returned");
        setUsedSeed(seed);
        setLastToolId(activeTool.id);
        setResult(passwords.slice(0, 5));
      } else {
        const prefix = nicknameInput.trim();
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
        {activeTool.id === "name_generator" ? (
          <input
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder={activeTool.placeholder}
            className="spk-tool__input"
          />
        ) : null}
        {activeTool.id === "password_generator" ? (
          <input
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder={activeTool.placeholder}
            className="spk-tool__input"
          />
        ) : null}
        {activeTool.id === "password_generator" ? (
          <button type="button" onClick={runTool} className="spk-tool__cta">
            {loading ? "Ładowanie..." : "Generuj hasła"}
          </button>
        ) : activeTool.id === "name_generator" ? (
          <button type="button" onClick={runTool} className="spk-tool__cta">
            {loading ? "Ładowanie..." : "Generuj nicki"}
          </button>
        ) : null}
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
        {error ? <p className="spk-tool__error">{error}</p> : null}
      </div>

      {activeTool.id === "village_clicker" ? (
        <div className="spk-tool__result spk-card">
          <span className="spk-picker__eyebrow">Wioska</span>
          <button type="button" onClick={runTool} className="spk-village__button" aria-label="Kliknij, aby rozwijać wioskę">
            <img src={villageImage} alt={`Wioska poziom ${villageState.stage}`} className="spk-village__image" />
          </button>
          <div className="spk-village__meta">
            <strong>Poziom {villageState.stage}</strong>
            <span>{villageState.stage === 7 ? "Maksymalny poziom" : `Do następnego poziomu: ${getVillageProgress(villageState.clicks)} kliknięć`}</span>
            <span>Łącznie kliknięć: {villageState.clicks}</span>
          </div>
        </div>
      ) : hasResult ? (
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
              setError("");
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
