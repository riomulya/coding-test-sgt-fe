import { useState } from 'react';

export const useProductUI = () => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode);
  };

  const handleDrawerOpen = () => {
    setDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  return {
    viewMode,
    drawerVisible,
    handleViewModeChange,
    handleDrawerOpen,
    handleDrawerClose,
  };
};
