import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  onUpload?: (file: File, event: React.FormEvent) => void;
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: "Please select an image file",
            variant: "destructive",
          });
          return;
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "File size must be less than 10MB",
            variant: "destructive",
          });
          return;
        }
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      toast({
        title: "Error",
        description: "Failed to select file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFile) {
        onUpload?.(selectedFile, e);
        console.log("Photo uploaded:", selectedFile.name);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          PROGRESS PHOTO
        </CardTitle>
        <p className="text-sm text-muted-foreground">+15 XP per photo</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              data-testid="input-photo"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile}
            data-testid="button-upload-photo"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
