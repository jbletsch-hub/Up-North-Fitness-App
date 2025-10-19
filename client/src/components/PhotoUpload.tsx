import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";

interface PhotoUploadProps {
  onUpload?: (file: File) => void;
}

export function PhotoUpload({ onUpload }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload?.(selectedFile);
      console.log("Photo uploaded:", selectedFile.name);
      setSelectedFile(null);
      (e.target as HTMLFormElement).reset();
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
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            data-testid="input-photo"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedFile}
            data-testid="button-upload-photo"
          >
            Upload Photo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
