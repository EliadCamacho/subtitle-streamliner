import { motion } from 'framer-motion';
import { X, Download, FolderOpen, Copy, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExtractedContent, Folder } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ContentDetailModalProps {
  content: ExtractedContent | null;
  onClose: () => void;
  onDownload: (content: ExtractedContent) => void;
  folders: Folder[];
  onMove: (contentId: string, folderId: string | undefined) => void;
}

export function ContentDetailModal({
  content,
  onClose,
  onDownload,
  folders,
  onMove,
}: ContentDetailModalProps) {
  const { toast } = useToast();

  if (!content) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.content);
      toast({
        title: 'Copiado',
        description: 'Contenido copiado al portapapeles',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar',
        variant: 'destructive',
      });
    }
  };

  const currentFolder = folders.find((f) => f.id === content.folderId);

  return (
    <Dialog open={!!content} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col bg-card border-border/50">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-foreground text-left">{content.title}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {content.content.length.toLocaleString()} caracteres
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto mt-4 -mx-6 px-6">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {content.content}
            </p>
          </div>
        </div>

        {/* Current Folder */}
        {currentFolder && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
            <FolderOpen className="h-4 w-4" style={{ color: currentFolder.color }} />
            <span className="text-sm text-muted-foreground">En:</span>
            <span className="text-sm font-medium text-foreground">{currentFolder.name}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
          <Button size="sm" onClick={() => onDownload(content)} className="flex-1">
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
