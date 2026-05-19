import {
  ArrowRight,
  BookOpen,
  Box,
  Brain,
  Camera,
  ChevronDown,
  CircleDot,
  Gauge,
  EyeOff,
  Grid3X3,
  Heart,
  Info,
  Leaf,
  MessageCircle,
  Library,
  Microscope,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CellScene } from "./components/CellScene";
import { cells, getCellById, type CellItem, type ViewMode } from "./data/cells";
import { llmComplete, bridgeErrorMessage } from "./brainBridge";

type ModeOption = {
  id: ViewMode;
  label: string;
  Icon: LucideIcon;
};

type TutorState = {
  status: "idle" | "loading" | "answered" | "error";
  question: string;
  answer: string;
  sources: string[];
  model: string;
  error: string;
};

const initialTutor: TutorState = {
  status: "idle",
  question: "",
  answer: "",
  sources: [],
  model: "",
  error: "",
};

const modeOptions: ModeOption[] = [
  { id: "mesh", label: "Mesh", Icon: Box },
  { id: "focus", label: "Focus", Icon: CircleDot },
];

const initialCell = getCellById("animal");

function Header({ cell }: { cell: CellItem }) {
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-orb" aria-hidden="true">
          <Sparkles size={26} />
        </div>
        <div>
          <h1>Cell Architecture Studio</h1>
          <p>Explore life at the microscopic level</p>
        </div>
      </div>

      <nav className="top-nav" aria-label="Primary">
        <a href="#gallery">
          <Grid3X3 size={24} />
          <span>Gallery</span>
        </a>
        <a href="#library">
          <Library size={24} />
          <span>Library</span>
        </a>
        <a href="#notebooks">
          <BookOpen size={24} />
          <span>Notebooks</span>
        </a>
        <a href="#settings">
          <Settings size={24} />
          <span>Settings</span>
        </a>
        <button className="avatar-button" type="button" aria-label="User menu">
          <span className="avatar-core" style={{ background: cell.accentSoft }}>
            <span style={{ background: cell.accent }} />
          </span>
          <ChevronDown size={20} />
        </button>
      </nav>
    </header>
  );
}

type SidebarProps = {
  selectedCell: CellItem;
  activeOrganelle: string;
  favorites: Set<string>;
  onSelectCell: (id: string) => void;
  onSelectOrganelle: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

function MiniCell({ cell }: { cell: CellItem }) {
  if (cell.renderImage?.url) {
    return (
      <span className="mini-cell has-preview" style={{ "--thumb": cell.accent } as CSSProperties}>
        <img src={cell.renderImage.url} alt="" aria-hidden="true" />
      </span>
    );
  }

  if (cell.modelAsset?.previewUrl) {
    return (
      <span className="mini-cell has-preview" style={{ "--thumb": cell.accent } as CSSProperties}>
        <img src={cell.modelAsset.previewUrl} alt="" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className={`mini-cell mini-cell-${cell.modelKind}`} style={{ "--thumb": cell.accent } as CSSProperties}>
      <span />
      <i />
      <b />
    </span>
  );
}

function Sidebar({
  selectedCell,
  activeOrganelle,
  favorites,
  onSelectCell,
  onSelectOrganelle,
  onToggleFavorite,
}: SidebarProps) {
  return (
    <aside className="left-rail">
      <section className="panel cell-type-panel">
        <div className="panel-heading">
          <span>
            <Leaf size={18} />
            Cell Types
          </span>
          <ChevronDown size={18} />
        </div>

        <div className="cell-list">
          {cells.map((cell) => {
            const selected = selectedCell.id === cell.id;
            return (
              <button
                className={`cell-row ${selected ? "is-active" : ""}`}
                type="button"
                key={cell.id}
                onClick={() => onSelectCell(cell.id)}
              >
                <MiniCell cell={cell} />
                <span className="cell-row-copy">
                  <strong>{cell.name}</strong>
                  <span>{cell.type}</span>
                </span>
                <span
                  className={`favorite-dot ${favorites.has(cell.id) ? "is-on" : ""}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(cell.id);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Favorite ${cell.name}`}
                >
                  <Star size={18} fill="currentColor" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel organelle-panel">
        <div className="panel-heading">
          <span>
            <Sparkles size={16} />
            Organelles
          </span>
          <ChevronDown size={18} />
        </div>

        <div className="organelle-list">
          {selectedCell.organelles.map((organelle) => (
            <button
              className={`organelle-row ${activeOrganelle === organelle.id ? "is-active" : ""}`}
              type="button"
              key={organelle.id}
              onClick={() => onSelectOrganelle(organelle.id)}
            >
              <span className="color-dot" style={{ background: organelle.color }} />
              <span>{organelle.name}</span>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

type StageProps = {
  cell: CellItem;
  activeOrganelle: string;
  viewMode: ViewMode;
  crossSection: boolean;
  autoRotate: boolean;
  resetKey: number;
  onModeChange: (mode: ViewMode) => void;
  onCrossSectionChange: (value: boolean) => void;
  onAutoRotateChange: (value: boolean) => void;
  onReset: () => void;
  onToast: (message: string) => void;
};

function Stage({
  cell,
  activeOrganelle,
  viewMode,
  crossSection,
  autoRotate,
  resetKey,
  onModeChange,
  onCrossSectionChange,
  onAutoRotateChange,
  onReset,
  onToast,
}: StageProps) {
  return (
    <main className="stage-column">
      <section className="stage-panel">
        <div className="stage-title">
          <div>
            <h2>{cell.name}</h2>
            <p>{cell.type}</p>
          </div>

          <div className="view-card">
            <span>View Mode</span>
            <div className="mode-switcher">
              {modeOptions.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={viewMode === id ? "is-active" : ""}
                  onClick={() => onModeChange(id)}
                  title={label}
                >
                  <Icon size={22} />
                </button>
              ))}
            </div>
            <label className="toggle-line">
              <span>Cross Section</span>
              <input
                type="checkbox"
                checked={crossSection}
                onChange={(event) => onCrossSectionChange(event.target.checked)}
              />
              <i />
            </label>
          </div>
        </div>

        <div className="canvas-wrap">
          <CellScene
            cell={cell}
            activeOrganelle={activeOrganelle}
            viewMode={viewMode}
            crossSection={crossSection}
            autoRotate={autoRotate}
            resetKey={resetKey}
          />
        </div>

        <div className="stage-toolbar">
          <button
            type="button"
            className={autoRotate ? "is-active" : ""}
            onClick={() => onAutoRotateChange(!autoRotate)}
          >
            <RotateCcw size={20} />
            Rotate
          </button>
          <button type="button" onClick={() => onModeChange("focus")}>
            <CircleDot size={20} />
            Isolate
          </button>
          <button type="button" onClick={() => onModeChange("focus")}>
            <EyeOff size={20} />
            Hide Others
          </button>
          <button type="button" onClick={onReset}>
            <RotateCcw size={20} />
            Reset View
          </button>
        </div>

        <div className="export-toolbar">
          <button type="button" onClick={() => onToast("截图功能这里先做占位。")}>
            <Camera size={20} />
            Screenshot
          </button>
          <button type="button" onClick={() => onToast("GLB 导出需要接入模型导出管线。")}>
            <Box size={20} />
            GLB Export
          </button>
        </div>
      </section>
    </main>
  );
}

type RightPanelProps = {
  cell: CellItem;
  activeOrganelle: string;
  favorites: Set<string>;
  mastery: number;
  viewedCellCount: number;
  viewedOrganelleCount: number;
  totalOrganelleCount: number;
  tutor: TutorState;
  onToggleFavorite: (id: string) => void;
  onAsk: (question: string) => void;
};

function buildTutorPrompts(cell: CellItem, organelle: CellItem["organelles"][number]) {
  return [
    `Explain how ${organelle.name} helps a ${cell.name} stay alive.`,
    `Quiz me on the visual differences between ${cell.name} and ${getCellById(cell.comparison).name}.`,
    `Guide me through finding ${organelle.name} inside the 3D model.`,
  ];
}

function RightPanel({
  cell,
  activeOrganelle,
  favorites,
  mastery,
  viewedCellCount,
  viewedOrganelleCount,
  totalOrganelleCount,
  tutor,
  onToggleFavorite,
  onAsk,
}: RightPanelProps) {
  const organelle = cell.organelles.find((item) => item.id === activeOrganelle) ?? cell.organelles[0];
  const tutorPrompts = buildTutorPrompts(cell, organelle);
  const [draft, setDraft] = useState("");
  const loading = tutor.status === "loading";

  function submitDraft() {
    const trimmed = draft.trim();
    if (!trimmed || loading) {
      return;
    }
    onAsk(trimmed);
    setDraft("");
  }

  return (
    <aside className="right-rail">
      <section className="panel details-panel">
        <div className="panel-heading detail-heading">
          <span>Organelle Details</span>
          <button type="button" onClick={() => onToggleFavorite(cell.id)} aria-label="Toggle favorite">
            <Heart size={22} fill={favorites.has(cell.id) ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="detail-hero">
          <span className="organelle-orb" style={{ background: organelle.color }} />
          <div>
            <h3>{organelle.name}</h3>
            <p>{organelle.subtitle}</p>
          </div>
        </div>

        <dl className="attribute-list">
          {organelle.attributes.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
          <div>
            <dt>Label</dt>
            <dd>
              <span className="mini-toggle is-on" />
              <span className="detail-dot" style={{ background: organelle.color }} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="panel notes-panel">
        <div className="panel-heading">
          <span>Biological Notes</span>
        </div>
        <p>{organelle.note}</p>
        <div className="fun-fact">
          <span>Fun Fact: {organelle.fact}</span>
          <Sparkles size={18} />
        </div>
      </section>

      <section className="panel learning-panel">
        <div className="panel-heading">
          <span>
            <Brain size={17} />
            AI Tutor
          </span>
        </div>

        <div className="mastery-meter" style={{ "--progress": `${mastery}%` } as CSSProperties}>
          <div>
            <Gauge size={18} />
            <span>Mastery</span>
            <strong>{mastery}%</strong>
          </div>
          <i>
            <b />
          </i>
          <small>
            {viewedCellCount}/{cells.length} cells explored · {viewedOrganelleCount}/{totalOrganelleCount} organelles inspected
          </small>
        </div>

        <div className="lesson-focus">
          <span>
            <Target size={17} />
            Current lesson focus
          </span>
          <p>
            Locate <strong>{organelle.name}</strong>, explain its role, then compare it with the matching structure in{" "}
            {getCellById(cell.comparison).name}.
          </p>
        </div>

        <form
          className="tutor-ask"
          onSubmit={(event) => {
            event.preventDefault();
            submitDraft();
          }}
        >
          <input
            type="text"
            value={draft}
            placeholder={`Ask the brain about the ${cell.name}...`}
            onChange={(event) => setDraft(event.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || draft.trim().length === 0}>
            <MessageCircle size={18} />
            Ask
          </button>
        </form>

        <div className="prompt-list">
          {tutorPrompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => onAsk(prompt)} disabled={loading}>
              {prompt}
            </button>
          ))}
        </div>

        {tutor.status !== "idle" && (
          <div className={`tutor-answer is-${tutor.status}`}>
            <span className="tutor-question">
              <MessageCircle size={15} />
              {tutor.question}
            </span>
            {tutor.status === "loading" && (
              <p className="tutor-status">The brain is thinking...</p>
            )}
            {tutor.status === "answered" && (
              <>
                <p className="tutor-text">{tutor.answer}</p>
                <small className="tutor-meta">
                  {tutor.model ? `Answered by ${tutor.model}` : "Answered by the brain"}
                  {tutor.sources.length > 0
                    ? ` · drew on ${tutor.sources.length} corpus source${
                        tutor.sources.length === 1 ? "" : "s"
                      }`
                    : ""}
                </small>
              </>
            )}
            {tutor.status === "error" && (
              <p className="tutor-status tutor-error">{bridgeErrorMessage(tutor.error)}</p>
            )}
          </div>
        )}
      </section>

      <section className="panel occurrence-panel">
        <div className="panel-heading">
          <span>Where It Occurs</span>
        </div>
        <div className={`occurrence-art occurrence-${cell.occurrence.motif}`}>
          <span />
          <i />
          <b />
        </div>
        <h4>{cell.occurrence.title}</h4>
        <p>{cell.occurrence.body}</p>
      </section>
    </aside>
  );
}

type BottomPanelsProps = {
  cell: CellItem;
  onCompare: () => void;
  onToast: (message: string) => void;
};

function BottomPanels({ cell, onCompare, onToast }: BottomPanelsProps) {
  const comparedCell = getCellById(cell.comparison);

  return (
    <section className="bottom-grid">
      <div className="panel microscope-panel">
        <div className="panel-heading">
          <span>
            Microscope View
            <Info size={16} />
          </span>
        </div>
        <div className="micro-card-row">
          {cell.microscope.map((image) => (
            <button
              type="button"
              key={image.label}
              className={`micro-card pattern-${image.pattern}`}
              style={{ "--micro": image.tone } as CSSProperties}
              onClick={() => onToast(`${image.label} selected.`)}
            >
              <span />
              <strong>{image.label}</strong>
            </button>
          ))}
          <button type="button" className="micro-card add-card" onClick={() => onToast("Image upload is a planned step.")}>
            <Plus size={28} />
            <strong>Add Image</strong>
          </button>
        </div>
      </div>

      <div className="panel compare-panel">
        <div className="panel-heading">
          <span>
            Compare Cells
            <Info size={16} />
          </span>
        </div>
        <div className="compare-row">
          <div>
            <MiniCell cell={cell} />
            <span>
              <strong>{cell.name}</strong>
              <em>You are here</em>
            </span>
          </div>
          <b>VS</b>
          <div>
            <span>
              <strong>{comparedCell.name}</strong>
              <em>{comparedCell.type}</em>
            </span>
            <MiniCell cell={comparedCell} />
          </div>
        </div>
        <button type="button" className="comparison-button" onClick={onCompare}>
          Open Comparison View
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
}

type ComparisonModalProps = {
  cell: CellItem;
  open: boolean;
  onClose: () => void;
};

function ComparisonModal({ cell, open, onClose }: ComparisonModalProps) {
  const comparedCell = getCellById(cell.comparison);
  if (!open) {
    return null;
  }

  const currentOrganelle = cell.organelles.find((item) => item.id === cell.defaultOrganelle) ?? cell.organelles[0];
  const comparedOrganelle =
    comparedCell.organelles.find((item) => item.id === comparedCell.defaultOrganelle) ?? comparedCell.organelles[0];

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label="Cell comparison">
      <div className="comparison-modal">
        <button className="modal-close" type="button" onClick={onClose}>
          Close
        </button>
        <div className="comparison-modal-head">
          <h3>Comparison View</h3>
          <p>
            {cell.name} compared with {comparedCell.name}
          </p>
        </div>
        <div className="comparison-columns">
          {[cell, comparedCell].map((item) => {
            const organelle = item.id === cell.id ? currentOrganelle : comparedOrganelle;
            return (
              <section key={item.id}>
                <MiniCell cell={item} />
                <h4>{item.name}</h4>
                <p>{item.type}</p>
                <dl>
                  <div>
                    <dt>Default focus</dt>
                    <dd>{organelle.name}</dd>
                  </div>
                  <div>
                    <dt>Main note</dt>
                    <dd>{organelle.subtitle}</dd>
                  </div>
                  <div>
                    <dt>Occurs in</dt>
                    <dd>{item.occurrence.title}</dd>
                  </div>
                </dl>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return <div className="toast">{message}</div>;
}

export default function App() {
  const [selectedCellId, setSelectedCellId] = useState(initialCell.id);
  const [activeOrganelle, setActiveOrganelle] = useState(initialCell.defaultOrganelle);
  const [viewMode, setViewMode] = useState<ViewMode>("mesh");
  const [crossSection, setCrossSection] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set([initialCell.id]));
  const [viewedCells, setViewedCells] = useState<Set<string>>(() => new Set([initialCell.id]));
  const [viewedOrganelleKeys, setViewedOrganelleKeys] = useState<Set<string>>(
    () => new Set([`${initialCell.id}:${initialCell.defaultOrganelle}`]),
  );
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [tutor, setTutor] = useState<TutorState>(initialTutor);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  const selectedCell = useMemo(() => getCellById(selectedCellId), [selectedCellId]);
  const totalOrganelleCount = useMemo(
    () => cells.reduce((total, cell) => total + cell.organelles.length, 0),
    [],
  );
  const mastery = useMemo(() => {
    const cellCoverage = viewedCells.size / cells.length;
    const organelleCoverage = viewedOrganelleKeys.size / totalOrganelleCount;
    return Math.round((cellCoverage * 0.42 + organelleCoverage * 0.58) * 100);
  }, [totalOrganelleCount, viewedCells, viewedOrganelleKeys]);

  useEffect(() => {
    setActiveOrganelle(selectedCell.defaultOrganelle);
    setComparisonOpen(false);
  }, [selectedCell]);

  useEffect(() => {
    setViewedCells((current) => {
      const next = new Set(current);
      next.add(selectedCell.id);
      return next;
    });
    setViewedOrganelleKeys((current) => {
      const next = new Set(current);
      next.add(`${selectedCell.id}:${activeOrganelle}`);
      return next;
    });
  }, [activeOrganelle, selectedCell.id]);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  async function askTutor(question: string) {
    const organelle =
      selectedCell.organelles.find((item) => item.id === activeOrganelle) ??
      selectedCell.organelles[0];
    setTutor({ ...initialTutor, status: "loading", question });
    const system =
      "You are a cell biology tutor inside an interactive 3D cell viewer. " +
      `The learner is currently looking at the ${selectedCell.name} (${selectedCell.type}), ` +
      `focused on the ${organelle.name}. Answer accurately and concisely for a curious ` +
      "student — two to four short paragraphs, no preamble.";
    try {
      const result = await llmComplete([
        { role: "system", content: system },
        { role: "user", content: question },
      ]);
      setTutor({
        status: "answered",
        question,
        answer: result.text,
        sources: result.sources,
        model: result.model,
        error: "",
      });
    } catch (err) {
      setTutor({
        ...initialTutor,
        status: "error",
        question,
        error: err instanceof Error ? err.message : "llm_complete_failed",
      });
    }
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const shellStyle = {
    "--accent": selectedCell.accent,
    "--accent-soft": selectedCell.accentSoft,
    "--cell-color": selectedCell.color,
  } as CSSProperties;

  return (
    <div className="app-shell" style={shellStyle}>
      <Header cell={selectedCell} />

      <div className="app-grid">
        <Sidebar
          selectedCell={selectedCell}
          activeOrganelle={activeOrganelle}
          favorites={favorites}
          onSelectCell={setSelectedCellId}
          onSelectOrganelle={setActiveOrganelle}
          onToggleFavorite={toggleFavorite}
        />

        <div className="center-stack">
          <Stage
            cell={selectedCell}
            activeOrganelle={activeOrganelle}
            viewMode={viewMode}
            crossSection={crossSection}
            autoRotate={autoRotate}
            resetKey={resetKey}
            onModeChange={setViewMode}
            onCrossSectionChange={setCrossSection}
            onAutoRotateChange={setAutoRotate}
            onReset={() => {
              setResetKey((key) => key + 1);
              showToast("View reset.");
            }}
            onToast={showToast}
          />
          <BottomPanels
            cell={selectedCell}
            onCompare={() => setComparisonOpen(true)}
            onToast={showToast}
          />
        </div>

        <RightPanel
          cell={selectedCell}
          activeOrganelle={activeOrganelle}
          favorites={favorites}
          mastery={mastery}
          viewedCellCount={viewedCells.size}
          viewedOrganelleCount={viewedOrganelleKeys.size}
          totalOrganelleCount={totalOrganelleCount}
          tutor={tutor}
          onToggleFavorite={toggleFavorite}
          onAsk={askTutor}
        />
      </div>

      <ComparisonModal cell={selectedCell} open={comparisonOpen} onClose={() => setComparisonOpen(false)} />
      <Toast message={toast} />
    </div>
  );
}
