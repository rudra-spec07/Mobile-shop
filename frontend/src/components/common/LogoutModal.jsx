import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import { LogOut } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleConfirmLogout = async () => {
    setLoading(true);
    try {
      // Call stateless backend logout endpoint
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Even if network call fails, proceed with client logout
    } finally {
      logout();
      setLoading(false);
      onClose();
      navigate('/login');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="flex items-center gap-4 py-2">
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Log out of Mobile-Adda?</h3>
            <p className="text-xs text-slate-500 mt-1">
              You will be returned to the login screen and will need to log back in to access your account.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirmLogout} isLoading={loading}>
            Logout
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutModal;
