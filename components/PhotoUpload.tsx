"use client";

import { useCallback, useRef, useState } from "react";

// Componente de carga de fotos con previsualización.
// Límite: 3 fotos activas por atleta (coincide con el constraint de la BD).
// Emite las fotos vía callback para que el formulario padre las guarde.

export type PhotoFile = {
  file: File;
  preview: string; // data URL para previsualización
};

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoUpload({
  onChange,
}: {
  onChange: (photos: PhotoFile[]) => void;
}) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const emit = useCallback(
    (next: PhotoFile[]) => {
      setPhotos(next);
      onChange(next);
    },
    [onChange]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setError(`Ya subiste el máximo de ${MAX_PHOTOS} fotos.`);
      return;
    }

    const list = Array.from(files).slice(0, remaining);
    const next: PhotoFile[] = [];

    for (const f of list) {
      if (!ACCEPTED.includes(f.type)) {
        setError(`Formato no admitido: ${f.name} (usa JPG, PNG o WebP).`);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Archivo muy grande: ${f.name} (máx ${MAX_SIZE_MB} MB).`);
        continue;
      }
      next.push({
        file: f,
        preview: URL.createObjectURL(f),
      });
    }

    if (next.length) emit([...photos, ...next]);
  };

  const removePhoto = (index: number) => {
    const next = photos.filter((_, i) => i !== index);
    emit(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white hover:bg-red-700"
              aria-label="Quitar foto"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-blue-500 hover:text-blue-500"
          >
            <span className="text-2xl font-bold">+</span>
            <span className="text-xs">{photos.length}/{MAX_PHOTOS}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {photos.length > 0 && (
        <p className="text-xs text-gray-400">Puedes subir hasta {MAX_PHOTOS} fotos (cuerpo completo, carnet, uniforme/acción).</p>
      )}
    </div>
  );
}
