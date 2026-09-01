import { useEffect } from 'react';

interface ShortcutOptions {
  onNewInvoice?: () => void;
  onNavigate?: (tab: string) => void;
  onSearchFocus?: () => void;
  onToggleShortcutsModal?: () => void;
  onCloseModals?: () => void;
  onToggleAIChat?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewInvoice,
  onNavigate,
  onSearchFocus,
  onToggleShortcutsModal,
  onCloseModals,
  onToggleAIChat,
}: ShortcutOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘+K or Ctrl+K triggers AI chat anywhere
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onToggleAIChat) onToggleAIChat();
        return;
      }

      // Don't trigger shortcuts if user is typing in an input / textarea / select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === 'Escape') {
        if (onCloseModals) onCloseModals();
        return;
      }

      if (isInputActive) return;

      // Never hijack system modifier shortcuts (Ctrl+C, Cmd+C, Alt, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (key === 'n' && onNewInvoice) {
        e.preventDefault();
        onNewInvoice();
      } else if (key === 'd' && onNavigate) {
        e.preventDefault();
        onNavigate('dashboard');
      } else if (key === 'i' && onNavigate) {
        e.preventDefault();
        onNavigate('invoices');
      } else if (key === 'r' && onNavigate) {
        e.preventDefault();
        onNavigate('recurring');
      } else if (key === 'k' && onNavigate) {
        e.preventDefault();
        onNavigate('clients');
      } else if (key === 's' && onNavigate) {
        e.preventDefault();
        onNavigate('settings');
      } else if (key === '/' && onSearchFocus) {
        e.preventDefault();
        onSearchFocus();
      } else if (key === '?' && onToggleShortcutsModal) {
        e.preventDefault();
        onToggleShortcutsModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewInvoice, onNavigate, onSearchFocus, onToggleShortcutsModal, onCloseModals]);
};
