import { CheckCircle2, UploadIcon } from "lucide-react";
import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "lib/constans";

interface UploadProps {
  onComplete?: (base64Data: string) => void;
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) {
      return;
    }

    setFile(selectedFile);
    setProgress(0);

    // Read file as Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;

      // Start progress interval
      progressIntervalRef.current = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + PROGRESS_STEP;
          if (newProgress >= 100) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }

            // Call onComplete after REDIRECT_DELAY_MS delay
            setTimeout(() => {
              if (onComplete) {
                onComplete(base64String);
              }
            }, REDIRECT_DELAY_MS);

            return 100;
          }
          return newProgress;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.onerror = () => {
      console.error("Error reading file");
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setFile(null);
      setProgress(0);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      return;
    }

    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isSignedIn) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isSignedIn) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isSignedIn) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isSignedIn) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleClick = () => {
    if (isSignedIn && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone ${isDragging ? "is-dragging" : ""} ${
            !isSignedIn ? "disabled" : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="drop-input"
            accept=".jpg, .jpeg, .png, .gif, .svg"
            disabled={!isSignedIn}
            onChange={handleFileChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={24} />
            </div>
            {isSignedIn ? (
              <p>Drag and drop your image here or click to browse</p>
            ) : (
              <p>Please sign in to upload your image</p>
            )}
            <p className="help">Maximum file size is 10MB</p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress < 100 ? (
                <CheckCircle2 className="icon" />
              ) : (
                <CheckCircle2 color="green" className="image" />
              )}
            </div>
            <h3>{file?.name}</h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100 ? `${progress}%` : "Processing..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
