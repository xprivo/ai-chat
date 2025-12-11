import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Modal } from '../UI/Modal';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { Workspace } from '../../types';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt'>) => void;
}

export function WorkspaceModal({ isOpen, onClose, onCreateWorkspace }: WorkspaceModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t('fileNameCannotBeEmpty'));
      return;
    }

    onCreateWorkspace({
      name: name.trim(),
      instructions: instructions.trim() || undefined
    });

    setName('');
    setInstructions('');
    setError('');
    onClose();
  };

  const handleCancel = () => {
    setName('');
    setInstructions('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={t('newWorkspace')}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
        <Input
          label={t('workspaceName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('enterWorkspaceName')}
          error={error}
        />

        <Textarea
          label={t('workspaceInstructions')}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder={t('enterWorkspaceInstructions')}
          rows={4}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button type="submit" className="px-4 py-2">
            {t('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
