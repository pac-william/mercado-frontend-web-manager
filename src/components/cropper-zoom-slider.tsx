"use client"

import { useCallback, useEffect, useState } from "react"

import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper"
import { Slider } from "@/components/ui/slider"

type Area = { x: number; y: number; width: number; height: number }

type CropperZoomSliderProps = {
  image: string
  onCropChange?: (crop: Area | null) => void
  onZoomChange?: (zoom: number) => void
}

export default function CropperZoomSlider({ 
  image, 
  onCropChange,
  onZoomChange 
}: CropperZoomSliderProps) {
  const [zoom, setZoom] = useState(1)

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1)
    onCropChange?.(null)
  }, [image, onCropChange])

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom)
    onZoomChange?.(newZoom)
  }, [onZoomChange])

  const handleCropChange = useCallback((pixels: Area | null) => {
    onCropChange?.(pixels)
  }, [onCropChange])

  return (
    <div className="flex flex-col items-center gap-2">
      <Cropper
        className="h-80 w-80"
        image={image}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        onCropChange={handleCropChange}
      >
        <CropperDescription />
        <CropperImage />
        <CropperCropArea  />
      </Cropper>
      <div className="mx-auto flex w-full items-center gap-1">
        <Slider
          defaultValue={[1]}
          value={[zoom]}
          min={1}
          max={3}
          step={0.1}
          onValueChange={(value) => handleZoomChange(value[0])}
          aria-label="Zoom slider"
        />
        <output className="block w-10 shrink-0 text-right text-sm font-medium tabular-nums">
          {parseFloat(zoom.toFixed(1))}x
        </output>
      </div>
    </div>
  )
}
