import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} - CabinCalm` : 'CabinCalm';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
