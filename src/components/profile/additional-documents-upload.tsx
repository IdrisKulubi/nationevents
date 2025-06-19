"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { uploadAdditionalDocumentToR2 } from "@/lib/actions/upload-actions";

interface AdditionalDocument {
  id: string;
  name: string;
  url: string;
  uploadKey: string;
  uploadedAt: string;
  fileSize?: number;
  fileType?: string;
}

interface AdditionalDocumentsUploadProps {
  onDocumentsChange: (documents: AdditionalDocument[]) => void;
  currentDocuments?: AdditionalDocument[];
  maxDocuments?: number;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function AdditionalDocumentsUpload({ 
  onDocumentsChange, 
  currentDocuments = [], 
  maxDocuments = 5 
}: AdditionalDocumentsUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const validateFile = (file: File): string | null => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return "Please upload a supported document type (PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX)";
      }
      
      if (file.size > MAX_FILE_SIZE) {
        return "File size must be less than 10MB";
      }
      
      if (currentDocuments.length >= maxDocuments) {
        return `Maximum ${maxDocuments} documents allowed`;
      }
      
      return null;
    };

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFileName(file.name);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadResult = await uploadAdditionalDocumentToR2(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (uploadResult.success && uploadResult.url) {
        const newDocument: AdditionalDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          url: uploadResult.url,
          uploadKey: uploadResult.fileName || uploadResult.url,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          fileType: file.type,
        };

        const updatedDocuments = [...currentDocuments, newDocument];
        onDocumentsChange(updatedDocuments);
        toast.success("Document uploaded successfully!");
      } else {
        throw new Error(uploadResult.error || "Upload failed");
      }
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadingFileName("");
      setUploadProgress(0);
    }
  }, [currentDocuments, onDocumentsChange, maxDocuments]);

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

  const removeDocument = (documentId: string) => {
    const updatedDocuments = currentDocuments.filter(doc => doc.id !== documentId);
    onDocumentsChange(updatedDocuments);
    toast.success("Document removed successfully");
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

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('text')) return '📃';
    return '📎';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Additional Documents (Optional)</Label>
        <span className="text-sm text-slate-500">
          {currentDocuments.length}/{maxDocuments} documents
        </span>
      </div>
      
      {currentDocuments.length < maxDocuments && (
        <Card 
          className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragOver 
              ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" 
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFilePicker}
        >
          <CardContent className="p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <Upload className="w-10 h-10 text-purple-500 mx-auto mb-2" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploading {uploadingFileName}...</p>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-slate-500">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Plus className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <p className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Add Additional Documents
                  </p>
                  <p className="text-sm text-slate-500">
                    Certificates, portfolios, references, etc.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm">
                  Choose File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentDocuments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Uploaded Documents
          </h4>
          {currentDocuments.map((document) => (
            <Card key={document.id} className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-lg">{getFileIcon(document.fileType || '')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-purple-800 dark:text-purple-200 truncate">
                        {document.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-300">
                        <span>{getFileExtension(document.name)}</span>
                        {document.fileSize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(document.fileSize)}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/view-document?file=${encodeURIComponent(document.url)}`, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDocument(document.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="text-xs text-slate-500 space-y-1">
        <p>• Maximum file size: 10MB per document</p>
        <p>• Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX</p>
        <p>• Upload certificates, portfolios, references, or any other relevant documents</p>
        <p>• Maximum {maxDocuments} documents allowed</p>
      </div>
    </div>
  );
} 