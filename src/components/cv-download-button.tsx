'use client';

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CVDownloadButtonProps {
  cvUrl: string;
}

export function CVDownloadButton({ cvUrl }: CVDownloadButtonProps) {
  const convertToPublicUrl = (storageUrl: string): string => {
    // Convert R2 storage URL to public viewing URL
    if (storageUrl.includes('r2.cloudflarestorage.com')) {
      // Extract the path after the domain
      const pathMatch = storageUrl.match(/r2\.cloudflarestorage\.com(\/.*)/);
      if (pathMatch) {
        const path = pathMatch[1];
        return `https://pub-c1f2d2c1ecc24b4bac78666e0a1644a7.r2.dev${path}`;
      }
    }
    // Return original URL if it doesn't match the pattern
    return storageUrl;
  };

  const handleDownload = () => {
    const publicUrl = convertToPublicUrl(cvUrl);
    window.open(publicUrl, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
    >
      <Download className="w-4 h-4 mr-1" />
      View CV
    </Button>
  );
} 