import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder } from '@/types';
import { cn } from '@/lib/utils';

interface FolderEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder | null;
  onCreate: (name: string, color?: string) => Folder;
  onUpdate: (id: string, updates: Partial<Pick<Folder, 'name' | 'color'>>) => void;
}

const FOLDER_COLORS = [
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#22c55e',
  '#3b82f6',
  '#ec4899',
  '#f97316',
];

export function FolderEditModal({
  open,
  onOpenChange,
  folder,
  onCreate,
  onUpdate,
}: FolderEditModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setColor(folder.color);
    } else {
      setName('');
      setColor(FOLDER_COLORS[0]);
    }
  }, [folder, open]);

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (folder) {
      onUpdate(folder.id, { name, color });
    } else {
      onCreate(name, color);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {folder ? 'Editar carpeta' : 'Nueva carpeta'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input
            placeholder="Nombre de la carpeta"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
            autoFocus
          />

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-9 w-9 rounded-full transition-all duration-200 ring-primary',
                    color === c && 'ring-2 ring-offset-2 ring-offset-card'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim()} className="flex-1">
              {folder ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
