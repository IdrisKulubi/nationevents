"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload, FileText, CheckCircle, X, Download } from "lucide-react";
import { toast } from "sonner";
import { uploadCVToR2 } from "@/lib/actions/upload-actions";

interface CVUploadFieldProps {
  onFileSelect: (file: File | null) => void;
  onUploadComplete: (url: string) => void;
  currentFile?: File | null;
}

export function CVUploadField({ onFileSelect, onUploadComplete, currentFile }: CVUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = useMemo(() => [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ], []);

  const maxFileSize = useMemo(() => 5 * 1024 * 1024, []); // 5MB

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return "Please upload a PDF or Word document (DOC, DOCX)";
    }
    
    if (file.size > maxFileSize) {
      return "File size must be less than 5MB";
    }
    
    return null;
  }, [allowedTypes, maxFileSize]);

  const handleFileSelect = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    onFileSelect(file);

    try {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadResult = await uploadCVToR2(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (uploadResult.success && uploadResult.url) {
        setUploadedUrl(uploadResult.url);
        onUploadComplete(uploadResult.url);
        toast.success("CV uploaded successfully!");
      } else {
        throw new Error(uploadResult.error || "Upload failed");
      }
    } catch (error) {
      console.error("CV upload error:", error);
      toast.error("Failed to upload CV. Please try again.");
      onFileSelect(null);
    } finally {
      setIsUploading(false);
    }
  }, [onFileSelect, onUploadComplete, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedUrl("");
    setUploadProgress(0);
    onFileSelect(null);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Upload Your CV *</Label>
      
      {!uploadedUrl ? (
        <Card 
          className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragOver 
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" 
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFilePicker}
        >
          <CardContent className="p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploading CV...</p>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-slate-500">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Drop your CV here or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    Supports PDF, DOC, DOCX (max 5MB)
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    CV Uploaded Successfully
                  </p>
                  {currentFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-300">
                      <span>{currentFile.name}</span>
                      <span>•</span>
                      <span>{getFileExtension(currentFile.name)}</span>
                      <span>•</span>
                      <span>{formatFileSize(currentFile.size)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {uploadedUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/view-cv?file=${encodeURIComponent(uploadedUrl)}`, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!uploadedUrl && (
        <div className="text-xs text-slate-500 space-y-1">
          <p>• Maximum file size: 5MB</p>
          <p>• Supported formats: PDF, DOC, DOCX</p>
          <p>• Make sure your CV includes your contact information and relevant experience</p>
        </div>
      )}
    </div>
  );
} 