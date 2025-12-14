import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabNavigation } from '@/components/TabNavigation';
import { ExtractTab } from '@/components/ExtractTab';
import { FoldersTab } from '@/components/FoldersTab';
import { useAppState } from '@/hooks/useAppState';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'extract' | 'folders'>('extract');
  const {
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
  } = useAppState();

  // Apply dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'extract' ? (
          <motion.div
            key="extract"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen"
          >
            <ExtractTab
              folders={folders}
              onAddContent={addContent}
              onCreateFolder={createFolder}
            />
          </motion.div>
        ) : (
          <motion.div
            key="folders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen"
          >
            <FoldersTab
              folders={folders}
              contents={contents}
              onCreateFolder={createFolder}
              onUpdateFolder={updateFolder}
              onDeleteFolder={deleteFolder}
              onDeleteContent={deleteContent}
              onMoveContent={moveContentToFolder}
              getContentsInFolder={getContentsInFolder}
              getUnfiledContents={getUnfiledContents}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
