import { Button } from "components/ui/Button";
import { Generate3DView } from "lib/ai.action";
import {
  createProject,
  deleteProject,
  getProjectById,
} from "lib/puter.action";
import { Box, Download, RefreshCcw, Share2, Trash2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";

const visualizerId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useOutletContext<AuthContext>();

  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => navigate("/");

  const handleDeleteProject = async () => {
    if (!id || !window.confirm("Hapus project ini? Tindakan tidak dapat dibatalkan.")) return;
    setIsDeleting(true);
    const ok = await deleteProject({ id });
    setIsDeleting(false);
    if (ok) navigate("/", { replace: true });
  };

  const handleExport = () => {
    if (!currentImage) return;
    const m = currentImage.startsWith("data:")
      ? /data:image\/(\w+);/.exec(currentImage)
      : null;
    const ext = m ? m[1] : "png";
    const filename = `blendify-render-${id ?? "export"}.${ext}`;
    const a = document.createElement("a");
    a.href = currentImage;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;

    setGenerationError(null);
    try {
      setIsProcessing(true);
      const result = await Generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        };

        const saved = await createProject({
          item: updatedItem,
          visibility: "private",
        });

        if (saved) {
          setProject(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
        }
      } else {
        setGenerationError("Generate 3D tidak mengembalikan gambar.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generate 3D gagal. Coba lagi.";
      setGenerationError(message);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">Blendify</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
          <X className="icon" /> Exit Editor{" "}
        </Button>
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Project</p>
              <h2>{project?.name || `Residence ${id}`}</h2>
              <p className="note">Created By Teo J.</p>
            </div>
            <div className="panel-actions">
              <Button
                size="sm"
                onClick={handleExport}
                className="export"
                disabled={!currentImage}
              >
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button
                size="sm"
                onClick={() => {}}
                className="share"
                disabled={!currentImage}
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteProject}
                className="delete-project"
                disabled={isDeleting}
                aria-label="Hapus project"
              >
                <Trash2 className="delete-project-icon mr-2" size={20} /> Hapus
              </Button>
            </div>

            <div
              className={`render-area ${isProcessing ? "is-processing" : ""}`}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="AI Render"
                  className="render-img"
                />
              ) : (
                <div className="render-placeholder">
                  {project?.sourceImage && (
                    <img
                      src={project.sourceImage}
                      alt="Original"
                      className="render-fallback"
                    />
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="render-overlay">
                  <div className="rendering-card">
                    <RefreshCcw className="spinner" />
                    <span className="title">Rendering ...</span>
                    <span className="subtitle">
                      Generating Your 3D Visualitaion ...
                    </span>
                  </div>
                </div>
              )}
              {generationError && !isProcessing && (
                <div className="render-overlay render-error">
                  <div className="rendering-card">
                    <span className="title">Gagal generate 3D</span>
                    <span className="subtitle">{generationError}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panel compare">
          <div className="panel-header">
            <div className="panel-meta">
              <p>Comparison</p>
              <h3>Before and After</h3>
            </div>
            <div className="hint">Drag to Compare</div>
          </div>

          <div className="compare-stage">
            {project?.sourceImage && currentImage ? (
              <ReactCompareSlider
                defaultValue={50}
                style={{ height: "auto", width: "100%" }}
                itemOne={
                  <ReactCompareSliderImage
                    src={project?.sourceImage}
                    alt="Original"
                    className="compare-img"
                  />
                }
                itemTwo={
                  <ReactCompareSliderImage
                    src={(currentImage ?? project?.renderedImage) ?? ""}
                    alt="After Render"
                    className="compare-img"
                  />
                }
              />
            ) : (
              <div className="compare-fallback">
                {project?.sourceImage && (
                  <img
                    src={project.sourceImage}
                    alt="Original"
                    className="compare-img"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default visualizerId;
