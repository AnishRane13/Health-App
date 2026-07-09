import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function ProfileSettingsModal({ open, onClose }) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.fullName || '');
  const [emailAlerts, setEmailAlerts] = useState(user?.emailAlerts ?? true);

  useEffect(() => {
    if (!open) return;
    setDisplayName(user?.displayName || user?.fullName || '');
    setEmailAlerts(user?.emailAlerts ?? true);
  }, [open, user]);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim() || user?.email,
      emailAlerts,
    });
    toast('Profile updated', 'success');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Account settings"
      footer={
        <>
          <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="profile-settings-form" className="btn btn--primary btn--sm">
            Save changes
          </button>
        </>
      }
    >
      <form id="profile-settings-form" onSubmit={handleSave}>
        <label className="field">
          <span className="field__label">Display name</span>
          <input
            className="field__input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you'd like to be addressed"
          />
        </label>
        <label className="field">
          <span className="field__label">Email</span>
          <input className="field__input field__input--readonly" value={user?.email || ''} readOnly />
          <span className="field__hint">Email is tied to your account and cannot be changed here.</span>
        </label>
        <label className="field field--checkbox">
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
          />
          <span>Email me when new lab results are imported</span>
        </label>
      </form>
    </Modal>
  );
}
