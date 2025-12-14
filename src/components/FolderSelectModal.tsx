import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder as FolderIcon, Plus, FileText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder } from '@/types';
import { cn } from '@/lib/utils';

interface FolderSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: Folder[];
  onSelect: (folderId?: string) => void;
  onCreateFolder: (name: string, color?: string) => Folder;
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

export function FolderSelectModal({
  open,
  onOpenChange,
  folders,
  onSelect,
  onCreateFolder,
}: FolderSelectModalProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const folder = onCreateFolder(newFolderName, selectedColor);
    setNewFolderName('');
    setShowCreate(false);
    onSelect(folder.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Guardar en carpeta</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* No folder option */}
          <button
            onClick={() => onSelect(undefined)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-surface-hover transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Sin carpeta</p>
              <p className="text-xs text-muted-foreground">Guardar sin organizar</p>
            </div>
          </button>

          {/* Existing folders */}
          <AnimatePresence>
            {folders.map((folder, index) => (
              <motion.button
                key={folder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(folder.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-surface-hover transition-colors text-left"
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${folder.color}20` }}
                >
                  <FolderIcon className="h-5 w-5" style={{ color: folder.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">{folder.itemCount} elementos</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Create new folder */}
          <AnimatePresence mode="wait">
            {showCreate ? (
              <motion.div
                key="create-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <Input
                  placeholder="Nombre de la carpeta"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="h-11"
                  autoFocus
                />
                
                <div className="flex gap-2 flex-wrap">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'h-8 w-8 rounded-full transition-all duration-200 ring-primary',
                        selectedColor === color && 'ring-2 ring-offset-2 ring-offset-card'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreate(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="flex-1"
                  >
                    Crear
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="create-button">
                <Button
                  variant="outline"
                  onClick={() => setShowCreate(true)}
                  className="w-full h-12 border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Nueva carpeta
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
