import React from 'react';
import { ConversationSummary } from '../../types';
import { MessageSquare, Plus, Trash2, X, Clock } from 'lucide-react';
import { Button } from '../common/Button';

interface ConversationSidebarProps {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-72 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Chat History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="py-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center"
            leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-500" />}
            onClick={() => {
              onNew();
              onClose();
            }}
          >
            New Smog Consultation
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {conversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No previous conversations. Start asking the Smart Smog Assistant!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv._id === activeId;
              const dateText = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    onSelect(conv._id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive
                          ? 'text-emerald-400 dark:text-emerald-600'
                          : 'text-zinc-400 group-hover:text-emerald-500'
                      }`}
                    />
                    <div className="truncate">
                      <p className="truncate">{conv.title}</p>
                      <span className="text-[10px] opacity-60 font-mono">{dateText}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => onDelete(conv._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-500 text-zinc-400 transition-opacity shrink-0"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {conversations.length > 0 && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <button
              onClick={onClearAll}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
