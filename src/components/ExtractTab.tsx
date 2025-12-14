import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardPaste, Upload, Loader2, CheckCircle2, FolderPlus, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { extractFromUrl } from '@/lib/extractor';
import { useToast } from '@/hooks/use-toast';
import { FolderSelectModal } from './FolderSelectModal';
import { Folder } from '@/types';

interface ExtractTabProps {
  folders: Folder[];
  onAddContent: (content: { title: string; content: string; url: string; folderId?: string }) => void;
  onCreateFolder: (name: string, color?: string) => Folder;
}

export function ExtractTab({ folders, onAddContent, onCreateFolder }: ExtractTabProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<{ title: string; content: string } | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast({
        title: 'Enlace pegado',
        description: 'El enlace se ha pegado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo acceder al portapapeles',
        variant: 'destructive',
      });
    }
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, ingresa un enlace',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setExtractedData(null);

    try {
      const data = await extractFromUrl(url);
      if (data) {
        setExtractedData(data);
        setShowPreview(true);
        toast({
          title: 'Extracción exitosa',
          description: `"${data.title}" extraído correctamente`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al extraer contenido',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFolder = (folderId?: string) => {
    if (!extractedData) return;

    onAddContent({
      title: extractedData.title,
      content: extractedData.content,
      url: url,
      folderId,
    });

    toast({
      title: 'Guardado',
      description: folderId ? 'Contenido guardado en la carpeta' : 'Contenido guardado',
    });

    // Reset state
    setUrl('');
    setExtractedData(null);
    setShowPreview(false);
    setShowFolderModal(false);
  };

  const handleCopyContent = async () => {
    if (!extractedData) return;
    try {
      await navigator.clipboard.writeText(extractedData.content);
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

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-gradient">Extraer Subtítulos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pega un enlace de JW.org para extraer el texto
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 space-y-3"
      >
        <div className="relative">
          <Input
            type="url"
            placeholder="https://www.jw.org/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pr-12 h-12 text-base bg-card border-border/50 rounded-xl"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePaste}
            className="absolute right-1 top-1 h-10 w-10"
          >
            <ClipboardPaste className="h-5 w-5" />
          </Button>
        </div>

        <Button
          onClick={handleExtract}
          disabled={isLoading || !url.trim()}
          className="w-full h-12"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Extrayendo...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              Extraer Texto
            </>
          )}
        </Button>
      </motion.div>

      {/* Preview Section */}
      <AnimatePresence>
        {extractedData && showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 mt-6 flex-1"
          >
            <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-elevated">
              {/* Title Bar */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{extractedData.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {extractedData.content.length.toLocaleString()} caracteres
                  </p>
                </div>
              </div>

              {/* Content Preview */}
              <div className="relative">
                <div className="max-h-48 overflow-hidden rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                    {extractedData.content}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContent}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowFolderModal(true)}
                  className="flex-1"
                >
                  <FolderPlus className="h-4 w-4" />
                  Guardar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Select Modal */}
      <FolderSelectModal
        open={showFolderModal}
        onOpenChange={setShowFolderModal}
        folders={folders}
        onSelect={handleSaveToFolder}
        onCreateFolder={onCreateFolder}
      />
    </div>
  );
}
