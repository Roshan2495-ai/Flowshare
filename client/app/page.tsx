"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  QrCode,
  LogOut,
  Upload,
  Camera,
  X,
  Copy,
  Check,
  CloudUpload,
  FolderOpen,
  ArrowRight
} from "lucide-react";
import { Button } from "./components/Button";
import { ToastNotification, Toast } from "./components/Toast";
import { FileCard } from "./components/FileCard";

// --- CONFIG ---
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export default function Home() {
  // --- STATE ---
  const [roomId, setRoomId] = useState("");
  const [tempRoomId, setTempRoomId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [status, setStatus] = useState<"IDLE" | "UPLOADING" | "SCANNING">("IDLE");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TOAST NOTIFICATIONS ---
  const showToast = (message: string, type: "success" | "error" | "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- ROOM HANDLING ---
  const createRoom = () => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    joinRoom(newId);
    showToast(`Room created!`, "success");
  };

  const joinRoom = (id: string) => {
    if (!id || id.length < 3) {
      showToast("Invalid Room ID", "error");
      return;
    }
    const cleanId = id.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    setRoomId(cleanId);
    setTempRoomId("");
    setFiles([]);
    setStatus("IDLE");
  };

  const leaveRoom = () => {
    setRoomId("");
    setFiles([]);
    setFile(null);
    setStatus("IDLE");
    setUploadProgress(0);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    showToast("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- FILE SYNC (POLLING) ---
  useEffect(() => {
    if (!roomId) return;

    const fetchFiles = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/files/${roomId}`);
        const type = res.headers.get("content-type");
        if (type && type.includes("application/json")) {
          const data = await res.json();
          if (Array.isArray(data)) setFiles(data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchFiles();
    const interval = setInterval(fetchFiles, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  // --- DRAG & DROP ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      showToast(`Selected: ${droppedFile.name}`, "info");
    }
  };

  // --- UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (!file || !roomId) {
      showToast("Please select a file", "error");
      return;
    }

    setStatus("UPLOADING");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("roomId", roomId);
    formData.append("file", file);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 100);

      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const type = res.headers.get("content-type");
      let data;

      if (type && type.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server error");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Upload failed");
      }

      showToast("Uploaded successfully", "success");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      const listRes = await fetch(`${BACKEND_URL}/files/${roomId}`);
      const listData = await listRes.json();
      if (Array.isArray(listData)) setFiles(listData);

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
      setUploadProgress(0);
    } finally {
      setStatus("IDLE");
    }
  };

  // --- QR SCANNER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === "SCANNING") {
      setCameraError("");

      const startCamera = async () => {
        try {
          if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Camera not supported");
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }

          if (!("BarcodeDetector" in window)) {
            throw new Error("QR Scanner not supported");
          }

          // @ts-ignore
          const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

          interval = setInterval(async () => {
            if (videoRef.current) {
              try {
                const codes = await detector.detect(videoRef.current);
                if (codes.length > 0) {
                  const val = codes[0].rawValue;
                  if (val) {
                    stopCamera(stream);
                    joinRoom(val);
                  }
                }
              } catch (e) { }
            }
          }, 500);

        } catch (err: any) {
          setCameraError("Camera error. Please type ID manually.");
        }
      };

      startCamera();
    }

    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        stopCamera(videoRef.current.srcObject as MediaStream);
      }
    };
  }, [status]);

  const stopCamera = (stream: MediaStream) => {
    stream.getTracks().forEach(t => t.stop());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // --- RENDER ---
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      <ToastNotification toasts={toasts} onRemove={removeToast} />

      <div className="relative z-10 w-full max-w-sm md:max-w-xl mx-auto">

        {/* === HOME PAGE === */}
        {!roomId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[85vh] gap-12 md:gap-16 py-10"
          >
            {/* Header */}
            <div className="text-center space-y-6">
              <h1 className="text-6xl md:text-8xl font-black gradient-text tracking-tighter">
                FlowShare
              </h1>
              <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                Instant file sharing across devices. <br className="hidden md:block" /> No login. No limits. Just QR.
              </p>
            </div>

            {/* Main Card */}
            <div className="glass-strong rounded-3xl p-8 md:p-10 w-full space-y-8 shadow-2xl shadow-indigo-500/10 border border-white/10">

              <Button
                onClick={createRoom}
                variant="primary"
                size="lg"
                className="w-full text-lg h-14 md:h-16 shadow-indigo-500/20 shadow-xl"
                icon={<Plus className="w-6 h-6" />}
              >
                Create New Room
              </Button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-6 text-gray-500 text-sm font-semibold tracking-wider uppercase">Or Join Room</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    value={tempRoomId}
                    onChange={(e) => setTempRoomId(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 h-14 text-center font-mono text-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600 focus:bg-white/10"
                    maxLength={10}
                  />
                  <Button
                    onClick={() => joinRoom(tempRoomId)}
                    className="px-8 h-14 text-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-500/25 border-0 group"
                    disabled={!tempRoomId}
                  >
                    <span>Join</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => setStatus("SCANNING")}
                variant="ghost"
                className="w-full text-base h-12 hover:bg-white/5 text-gray-400 hover:text-white transition-all"
                icon={<Camera className="w-5 h-5" />}
              >
                Scan QR Code
              </Button>
            </div>
          </motion.div>
        )}

        {/* === QR SCANNER === */}
        <AnimatePresence>
          {status === "SCANNING" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4"
            >
              <div className="relative w-full max-w-xs aspect-square rounded-2xl overflow-hidden mb-8 border border-white/10">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none"></div>
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
              </div>

              <p className="text-center mb-8 text-gray-300 px-4">
                {cameraError || "Point camera at a FlowShare QR Code"}
              </p>

              <Button
                onClick={() => setStatus("IDLE")}
                variant="secondary"
                size="lg"
                className="w-full max-w-xs"
              >
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === ROOM DASHBOARD === */}
        {roomId && status !== "SCANNING" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4 pb-8"
          >
            {/* Header / Room ID */}
            <div className="glass-strong rounded-2xl p-6 relative flex flex-col items-center">
              <button
                onClick={leaveRoom}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <div className="bg-white p-3 rounded-xl mb-4 shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${roomId}&bgcolor=fff`}
                  alt="Room QR"
                  className="w-32 h-32 md:w-40 md:h-40"
                />
              </div>

              <div className="flex items-center gap-3 bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                <span className="text-2xl font-mono font-bold tracking-wider">{roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Room ID</p>
            </div>

            {/* Upload Area */}
            <div className="glass-strong rounded-2xl p-6">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                  ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-indigo-500/30 hover:bg-white/5"}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFile(f);
                      showToast("File selected", "info");
                    }
                  }}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                  {file ? (
                    <div className="bg-indigo-500/20 p-4 rounded-full">
                      <FileCard filename={file.name} roomId="" backendUrl="" index={0} />
                      {/* ^ Reuse Icon Logic only or simplify presentation */}
                      <p className="text-sm font-medium mt-2">{file.name}</p>
                      <p className="text-xs text-indigo-300">{formatFileSize(file.size)}</p>
                    </div>
                  ) : (
                    <>
                      <CloudUpload className="w-8 h-8 text-indigo-400" />
                      <div>
                        <p className="font-medium">Tap to Upload</p>
                        <p className="text-xs text-gray-500 mt-1">or drag & drop</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {uploadProgress > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={handleUpload}
                disabled={!file || status === "UPLOADING"}
                variant="primary"
                className="w-full mt-4"
                icon={status === "UPLOADING" ? null : <Upload className="w-4 h-4" />}
                loading={status === "UPLOADING"}
              >
                {status === "UPLOADING" ? "Sending..." : "Send File"}
              </Button>
            </div>

            {/* File List */}
            <div className="glass-strong rounded-2xl p-6 min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-400" />
                  Files
                </h2>
                <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-gray-400">
                  {files.length}
                </span>
              </div>

              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm border border-dashed border-white/10 rounded-xl">
                  <p>No files yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((f, i) => (
                    <FileCard
                      key={i}
                      filename={f}
                      roomId={roomId}
                      backendUrl={BACKEND_URL}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}
