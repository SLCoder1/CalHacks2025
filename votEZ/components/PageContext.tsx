import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PageContent {
  title: string;
  content: string;
  type: 'candidates' | 'propositions' | 'home' | 'explore';
  metadata?: Record<string, any>;
}

interface PageContextType {
  currentPageContent: PageContent | null;
  setCurrentPageContent: (content: PageContent | null) => void;
  getPageContentAsText: () => string;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};

interface PageProviderProps {
  children: ReactNode;
}

export const PageProvider: React.FC<PageProviderProps> = ({ children }) => {
  const [currentPageContent, setCurrentPageContent] = useState<PageContent | null>(null);

  const getPageContentAsText = (): string => {
    if (!currentPageContent) {
      return '';
    }

    let content = `Page: ${currentPageContent.title}\n`;
    content += `Type: ${currentPageContent.type}\n\n`;
    content += currentPageContent.content;

    if (currentPageContent.metadata) {
      content += '\n\nAdditional Information:\n';
      Object.entries(currentPageContent.metadata).forEach(([key, value]) => {
        content += `${key}: ${value}\n`;
      });
    }

    return content;
  };

  return (
    <PageContext.Provider
      value={{
        currentPageContent,
        setCurrentPageContent,
        getPageContentAsText,
      }}
    >
      {children}
    </PageContext.Provider>
  );
}; 