import Navbar from "components/Navbar";
import type { Route } from "./+types/home";
import { ArrowRight, ArrowUpRight, Clock, ImageIcon } from "lucide-react";
import { Button } from "components/ui/Button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
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

            <p className="help">PNG, JPG, GIF, or SVG</p>
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
            <div className="project-card group">
              <div className="preview">
                <img
                  src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png"
                  alt="Project 1"
                />
                <div className="badge">
                  <span>Living Room</span>
                </div>
              </div>
              <div className="card-body">
                <h3>Living Room</h3>
                <div className="meta">
                  <Clock size={12} />
                  <span>{new Date().toLocaleDateString()}</span>
                  <span>by Teo J.</span>
                </div>
                <div className="arrow">
                  <ArrowUpRight size={18} className="icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
