import { useLocalStorage } from './useLocalStorage';
import { Folder, ExtractedContent } from '@/types';

const FOLDER_COLORS = [
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ef4444', // red
  '#22c55e', // green
  '#3b82f6', // blue
  '#ec4899', // pink
  '#f97316', // orange
];

export function useAppState() {
  const [folders, setFolders] = useLocalStorage<Folder[]>('jw-folders', []);
  const [contents, setContents] = useLocalStorage<ExtractedContent[]>('jw-contents', []);

  const createFolder = (name: string, color?: string) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      color: color || FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
      createdAt: new Date(),
      updatedAt: new Date(),
      itemCount: 0,
    };
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = (id: string, updates: Partial<Pick<Folder, 'name' | 'color'>>) => {
    setFolders(prev =>
      prev.map(folder =>
        folder.id === id
          ? { ...folder, ...updates, updatedAt: new Date() }
          : folder
      )
    );
  };

  const deleteFolder = (id: string) => {
    setFolders(prev => prev.filter(folder => folder.id !== id));
    setContents(prev =>
      prev.map(content =>
        content.folderId === id ? { ...content, folderId: undefined } : content
      )
    );
  };

  const addContent = (content: Omit<ExtractedContent, 'id' | 'extractedAt'>) => {
    const newContent: ExtractedContent = {
      ...content,
      id: crypto.randomUUID(),
      extractedAt: new Date(),
    };
    setContents(prev => [...prev, newContent]);

    if (content.folderId) {
      setFolders(prev =>
        prev.map(folder =>
          folder.id === content.folderId
            ? { ...folder, itemCount: folder.itemCount + 1, updatedAt: new Date() }
            : folder
        )
      );
    }

    return newContent;
  };

  const moveContentToFolder = (contentId: string, folderId: string | undefined) => {
    const content = contents.find(c => c.id === contentId);
    if (!content) return;

    const oldFolderId = content.folderId;

    setContents(prev =>
      prev.map(c => (c.id === contentId ? { ...c, folderId } : c))
    );

    setFolders(prev =>
      prev.map(folder => {
        if (folder.id === oldFolderId) {
          return { ...folder, itemCount: Math.max(0, folder.itemCount - 1), updatedAt: new Date() };
        }
        if (folder.id === folderId) {
          return { ...folder, itemCount: folder.itemCount + 1, updatedAt: new Date() };
        }
        return folder;
      })
    );
  };

  const deleteContent = (id: string) => {
    const content = contents.find(c => c.id === id);
    if (content?.folderId) {
      setFolders(prev =>
        prev.map(folder =>
          folder.id === content.folderId
            ? { ...folder, itemCount: Math.max(0, folder.itemCount - 1), updatedAt: new Date() }
            : folder
        )
      );
    }
    setContents(prev => prev.filter(c => c.id !== id));
  };

  const getContentsInFolder = (folderId: string | undefined) => {
    return contents.filter(c => c.folderId === folderId);
  };

  const getUnfiledContents = () => {
    return contents.filter(c => !c.folderId);
  };

  return {
    folders,
    contents,
    createFolder,
    updateFolder,
    deleteFolder,
    addContent,
    moveContentToFolder,
    deleteContent,
    getContentsInFolder,
    getUnfiledContents,
    FOLDER_COLORS,
  };
}
