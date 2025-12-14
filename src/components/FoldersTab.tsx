import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  FileText,
  Download,
  ArrowLeft,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folder, ExtractedContent } from '@/types';
import { FolderEditModal } from './FolderEditModal';
import { ContentDetailModal } from './ContentDetailModal';
import { downloadAsTxt } from '@/lib/extractor';
import { cn } from '@/lib/utils';

interface FoldersTabProps {
  folders: Folder[];
  contents: ExtractedContent[];
  onCreateFolder: (name: string, color?: string) => Folder;
  onUpdateFolder: (id: string, updates: Partial<Pick<Folder, 'name' | 'color'>>) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteContent: (id: string) => void;
  onMoveContent: (contentId: string, folderId: string | undefined) => void;
  getContentsInFolder: (folderId: string | undefined) => ExtractedContent[];
  getUnfiledContents: () => ExtractedContent[];
}

export function FoldersTab({
  folders,
  contents,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onDeleteContent,
  onMoveContent,
  getContentsInFolder,
  getUnfiledContents,
}: FoldersTabProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [editFolder, setEditFolder] = useState<Folder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ExtractedContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const unfiledContents = getUnfiledContents();

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentContents = selectedFolder
    ? getContentsInFolder(selectedFolder.id)
    : [];

  const handleDownloadContent = (content: ExtractedContent) => {
    downloadAsTxt(content.title, content.content);
  };

  if (selectedFolder) {
    return (
      <div className="flex flex-col min-h-full pb-20">
        {/* Folder Header */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 pt-6 pb-4"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFolder(null)}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${selectedFolder.color}20` }}
            >
              <FolderOpen className="h-6 w-6" style={{ color: selectedFolder.color }} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{selectedFolder.name}</h1>
              <p className="text-sm text-muted-foreground">
                {currentContents.length} elementos
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contents List */}
        <div className="px-4 space-y-2 flex-1">
          <AnimatePresence>
            {currentContents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Esta carpeta está vacía</p>
              </motion.div>
            ) : (
              currentContents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border/50 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{content.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {content.content.length.toLocaleString()} caracteres
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedContent(content)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadContent(content)}>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar TXT
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteContent(content.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Content Detail Modal */}
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onDownload={handleDownloadContent}
          folders={folders}
          onMove={onMoveContent}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4"
      >
        <h1 className="text-2xl font-bold text-gradient">Mis Carpetas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Organiza tu contenido extraído
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar carpetas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card border-border/50 rounded-xl"
          />
        </div>
      </motion.div>

      {/* Folders Grid */}
      <div className="px-4 flex-1">
        <div className="grid grid-cols-2 gap-3">
          {/* Create Folder Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            onClick={() => setShowCreateModal(true)}
            className="aspect-square bg-card border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-surface-hover transition-all duration-200"
          >
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Nueva carpeta</span>
          </motion.button>

          {/* Unfiled Contents */}
          {unfiledContents.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="aspect-square bg-card border border-border/50 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-elevated transition-all duration-200"
            >
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Sin carpeta</span>
              <span className="text-xs text-muted-foreground">{unfiledContents.length} elementos</span>
            </motion.button>
          )}

          {/* Folder Cards */}
          <AnimatePresence>
            {filteredFolders.map((folder, index) => (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.15 + (index + 1) * 0.05 }}
                className="relative aspect-square"
              >
                <button
                  onClick={() => setSelectedFolder(folder)}
                  className="w-full h-full bg-card border border-border/50 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-elevated transition-all duration-200"
                >
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${folder.color}20` }}
                  >
                    <FolderOpen className="h-6 w-6" style={{ color: folder.color }} />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate max-w-[90%]">
                    {folder.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{folder.itemCount} elementos</span>
                </button>

                {/* Folder Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditFolder(folder)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteFolder(folder.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Create/Edit Folder Modal */}
      <FolderEditModal
        open={showCreateModal || editFolder !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setEditFolder(null);
          }
        }}
        folder={editFolder}
        onCreate={onCreateFolder}
        onUpdate={onUpdateFolder}
      />
    </div>
  );
}
