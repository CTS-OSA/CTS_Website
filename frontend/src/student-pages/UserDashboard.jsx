import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardTable from '../components/DashboardTable';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useApiRequest } from '../context/ApiRequestContext';
import DefaultLayout from '../components/DefaultLayout';
import './css/userDashboard.css';
import ToastMessage from '../components/ToastMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import Button from "../components/UIButton";

export const UserDashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { request } = useApiRequest();
  const [submittedForms, setSubmittedForms] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, form: null });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSubmittedForms = async () => {
      try {
        const response = await request('http://localhost:8000/api/forms/display/submissions/');
        if (response && response.ok) {
          const data = await response.json();

          const submitted = data
            .filter(form => form.status === 'submitted')
            .sort((a, b) => new Date(a.submitted_on || a.saved_on) - new Date(b.submitted_on || b.saved_on));

          const pending = data
            .filter(form => form.status === 'draft');

          setSubmittedForms(submitted);
          setPendingActions(pending);
        } else {
          setSubmittedForms([]);
          setPendingActions([]);
        }
      } catch (err) {
        setSubmittedForms([]);
        setPendingActions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmittedForms();
  }, [isAuthenticated, request, navigate]);

  if (authLoading || loading) {
    return <Loader />;
  }

  const handleView = (form) => {
    const slugify = (text) =>
      text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const slug = slugify(form.form_type);

    if (form.status === 'draft') {
      navigate(`/forms/${slug}`);
    } else if (form.status === 'submitted') {
      navigate(`/submitted-forms/${slug}`);
    }
  };

  const promptDelete = (form) => {
    setConfirmDialog({ visible: true, form });
  };

  const confirmDelete = async () => {
    const form = confirmDialog.form;
    
    const slugify = (text) =>
      text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const slug = slugify(form.form_type);

    try {
      const response = await request(
        `http://localhost:8000/api/forms/${slug}/`,
        {
          method: 'DELETE',
        }
      );

      let responseData = null;
 
      if (response.status !== 204) {
        responseData = await response.json();
      }

      if (response.ok) {
        setPendingActions(prev => prev.filter(item => item.id !== form.id));
        setToastMessage(`"${form.form_type}" draft deleted successfully.`);
      } else {
        setToastMessage(`Failed to delete "${form.form_type}".`);
      }
    } catch (err) {
      setToastMessage(`Error deleting "${form.form_type}".`);
    } finally {
      setConfirmDialog({ visible: false, form: null });
    }
  };

  return (
    <DefaultLayout variant="student">

        <DashboardTable
          submittedForms={submittedForms}
          pendingActions={pendingActions}
          onView={handleView}
          onDelete={promptDelete}
        />


      {confirmDialog.visible && (
        <ConfirmDialog
          title="Delete Draft"
          message={`Are you sure you want to delete the draft for "${confirmDialog.form.form_type}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDialog({ visible: false, form: null })}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}

      {toastMessage && (
        <ToastMessage
          message={toastMessage}
          onClose={() => setToastMessage('')}
          duration={3000}
        />
      )}
    </DefaultLayout>
  );
};
