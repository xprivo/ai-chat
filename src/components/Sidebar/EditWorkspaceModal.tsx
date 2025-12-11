import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { Workspace } from '../../types';

interface EditWorkspaceModalProps {
  isOpen: boolean;
  workspace: Workspace | null;
  onClose: () => void;
  onUpdateWorkspace: (workspace: Workspace) => void;
}

export function EditWorkspaceModal({ isOpen, workspace, onClose, onUpdateWorkspace }: EditWorkspaceModalProps) {
  const { t } = useTranslation();
  const [editName, setEditName] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (workspace) {
      setEditName(workspace.name);
      setEditInstructions(workspace.instructions || '');
    }
  }, [workspace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editName.trim()) {
      setError(t('fileNameCannotBeEmpty'));
      return;
    }

    if (!workspace) return;

    const updatedWorkspace = {
      ...workspace,
      name: editName.trim(),
      instructions: editInstructions.trim() || undefined
    };

    onUpdateWorkspace(updatedWorkspace);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('workspaceUpdated', {
        detail: { workspaceId: workspace.id, workspace: updatedWorkspace }
      }));
      window.dispatchEvent(new Event('storage'));
    }, 10);

    onClose();
  };

  const handleCancel = () => {
    if (workspace) {
      setEditName(workspace.name);
      setEditInstructions(workspace.instructions || '');
    }
    setError('');
    onClose();
  };

  if (!workspace) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={t('editWorkspace')}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
        <Input
          label={t('workspaceName')}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder={t('enterWorkspaceName')}
          error={error}
        />

        <Textarea
          label={t('workspaceInstructions')}
          value={editInstructions}
          onChange={(e) => setEditInstructions(e.target.value)}
          placeholder={t('enterWorkspaceInstructions')}
          rows={4}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" className="px-4 py-2">
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
