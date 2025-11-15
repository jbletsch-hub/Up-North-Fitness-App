import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Calendar } from "lucide-react";
import { format } from "date-fns";

interface PhotoMetadata {
  id: string;
  imagePath: string;
  uploadDate: string;
  createdAt: string;
}

interface PhotoComparisonProps {
  userId: string;
}

export function PhotoComparison({ userId }: PhotoComparisonProps) {
  const [beforePhotoId, setBeforePhotoId] = useState<string | null>(null);
  const [afterPhotoId, setAfterPhotoId] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);

  const { data: photos = [], isLoading, isError } = useQuery<PhotoMetadata[]>({
    queryKey: [`/api/photos/${userId}`],
  });

  if (isLoading) {
    return (
      <Card className="border-card-border" data-testid="card-photo-comparison">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            PHOTO COMPARISON
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading photos...</div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-card-border" data-testid="card-photo-comparison">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            PHOTO COMPARISON
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Unable to load photos. This profile may be private.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photos.length < 2) {
    return (
      <Card className="border-card-border" data-testid="card-photo-comparison">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            PHOTO COMPARISON
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Upload at least 2 photos to compare your progress!
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort photos by date (newest first)
  const sortedPhotos = [...photos].sort((a, b) => 
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

  // Set default selections if not set
  const beforePhoto = beforePhotoId 
    ? photos.find(p => p.id === beforePhotoId)
    : sortedPhotos[sortedPhotos.length - 1]; // Oldest photo
    
  const afterPhoto = afterPhotoId
    ? photos.find(p => p.id === afterPhotoId)
    : sortedPhotos[0]; // Newest photo

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(parseInt(e.target.value));
  };

  const calculateDaysBetween = () => {
    if (!beforePhoto || !afterPhoto) return 0;
    const before = new Date(beforePhoto.uploadDate);
    const after = new Date(afterPhoto.uploadDate);
    const diff = after.getTime() - before.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="border-card-border" data-testid="card-photo-comparison">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          PHOTO COMPARISON
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Before</label>
            <Select
              value={beforePhoto?.id || ""}
              onValueChange={setBeforePhotoId}
            >
              <SelectTrigger data-testid="select-before-photo">
                <SelectValue placeholder="Select before photo" />
              </SelectTrigger>
              <SelectContent>
                {sortedPhotos.map((photo) => (
                  <SelectItem 
                    key={photo.id} 
                    value={photo.id}
                    data-testid={`option-before-${photo.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(photo.uploadDate), "MMM d, yyyy")}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">After</label>
            <Select
              value={afterPhoto?.id || ""}
              onValueChange={setAfterPhotoId}
            >
              <SelectTrigger data-testid="select-after-photo">
                <SelectValue placeholder="Select after photo" />
              </SelectTrigger>
              <SelectContent>
                {sortedPhotos.map((photo) => (
                  <SelectItem 
                    key={photo.id} 
                    value={photo.id}
                    data-testid={`option-after-${photo.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(photo.uploadDate), "MMM d, yyyy")}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Display */}
        {beforePhoto && afterPhoto && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-lg font-display">
              {calculateDaysBetween()} {calculateDaysBetween() === 1 ? 'Day' : 'Days'} of Progress
            </div>
            <div className="text-xs text-muted-foreground">
              {format(new Date(beforePhoto.uploadDate), "MMM d, yyyy")} → {format(new Date(afterPhoto.uploadDate), "MMM d, yyyy")}
            </div>
          </div>
        )}

        {/* Comparison Viewer with Slider */}
        {beforePhoto && afterPhoto && (
          <div className="space-y-2">
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-muted" data-testid="comparison-viewer">
              {/* Before Photo (Full Width) */}
              <img
                src={beforePhoto.imagePath}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
                data-testid="img-before-photo"
              />
              
              {/* After Photo (Clipped by Slider) */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                <img
                  src={afterPhoto.imagePath}
                  alt="After"
                  className="w-full h-full object-cover"
                  data-testid="img-after-photo"
                />
              </div>
              
              {/* Slider Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <ArrowLeftRight className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* Slider Control */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="w-full"
              data-testid="slider-comparison"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Before</span>
              <span>After</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
