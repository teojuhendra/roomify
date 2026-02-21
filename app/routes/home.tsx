import Navbar from "components/Navbar";
import type { Route } from "./+types/home";
import { ArrowRight, ArrowUpRight, Clock, ImageIcon } from "lucide-react";
import { Button } from "components/ui/Button";
import Upload from "components/Upload";
import { useNavigate } from "react-router";
import { useState } from "react";
import { createProject } from "lib/puter.action";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);

  const handleUploadComplete = async (base64Data: string) => {
    const newId = Date.now().toString();
    const name = `Residence ${newId}`;

    const newItem = {
      id: newId,
      name,
      sourceImage: base64Data,
      renderedImage: undefined,
      timestamp: Date.now(),
    };

    const saved = await createProject({ item: newItem, visibility: "private" });

    if (!saved) {
      console.error(`Failed to create a project, skipping navigation`);
      return false;
    }

    setProjects((prev) => [newItem, ...prev]);

    navigate(`/visualizer/${newId}`, {
      state: {
        initialImage: saved.sourceImage,
        initialRender: saved.renderedImage || null,
        name,
      },
    });

    return true;
  };

  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Roomify 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Roomify</h1>
        <p className="subtitle">
          Roomify is an AI first design tool that helps you create beautiful
          spaces at the speed of thought.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Designing <ArrowRight className="icon" />
          </a>
          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <ImageIcon className="icon" />
              </div>
              <h3>Upload Your Image</h3>
              <p>Drag and drop your image here or click to browse</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Your Projects</h2>
              <p>View and manage your projects</p>
            </div>
          </div>

          <div className="projects-grid">
            {projects.map(
              ({ id, name, renderedImage, sourceImage, timestamp }) => (
                <div className="project-card group" key={id}>
                  <div className="preview">
                    <img
                      src={renderedImage || sourceImage}
                      alt={name || "Project"}
                    />
                    <div className="badge">
                      <span>{name || "Project"}</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <h3>{name || "Project"}</h3>
                    <div className="meta">
                      <Clock size={12} />
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>by {name?.split(" ")[0] || "Project"}</span>
                    </div>
                    <div className="arrow">
                      <ArrowUpRight size={18} className="icon" />
                    </div>
                  </div>
                </div>
              ),
            )}
            {projects.length === 0 && (
              <div className="empty">
                <p>No projects yet</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
