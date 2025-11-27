import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import './Notification.css';

const NotificationContext = createContext(null);

let toastIdCounter = 0;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { title, message, confirmText, cancelText, variant, resolve }

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    if (!message) return;
    const id = ++toastIdCounter;
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const confirm = useCallback(({
    title = 'Xác nhận',
    message = '',
    confirmText = 'Đồng ý',
    cancelText = 'Hủy',
    variant = 'default',
  }) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
        resolve,
      });
    });
  }, []);

  const handleConfirmResult = (result) => {
    if (confirmState && typeof confirmState.resolve === 'function') {
      confirmState.resolve(result);
    }
    setConfirmState(null);
  };

  // Override window.alert để mọi alert() trong code dùng toast đẹp thay vì popup trình duyệt
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (msg) => {
      const text = typeof msg === 'string' ? msg : String(msg);
      const lower = text.toLowerCase();
      let type = 'info';

      if (
        lower.includes('thành công') ||
        lower.includes('đã được tạo') ||
        lower.includes('đã được xác nhận') ||
        lower.includes('đã gửi yêu cầu')
      ) {
        type = 'success';
      } else if (
        lower.includes('lỗi') ||
        lower.includes('không thể') ||
        lower.includes('thất bại')
      ) {
        type = 'error';
      }

      showToast(text, type);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  const value = {
    notify: showToast,
    confirm,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Toast list */}
      <div className="app-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`app-toast app-toast-${toast.type}`}
          >
            <span className="app-toast-message">{toast.message}</span>
            <button
              type="button"
              className="app-toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Đóng thông báo"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirmState && (
        <div className="app-confirm-backdrop">
          <div className="app-confirm-modal">
            {confirmState.title && (
              <h3 className="app-confirm-title">{confirmState.title}</h3>
            )}
            {confirmState.message && (
              <p className="app-confirm-message">{confirmState.message}</p>
            )}
            <div className="app-confirm-actions">
              <button
                type="button"
                className="app-confirm-btn app-confirm-btn-cancel"
                onClick={() => handleConfirmResult(false)}
              >
                {confirmState.cancelText || 'Hủy'}
              </button>
              <button
                type="button"
                className={`app-confirm-btn app-confirm-btn-confirm app-confirm-btn-${confirmState.variant || 'default'}`}
                onClick={() => handleConfirmResult(true)}
              >
                {confirmState.confirmText || 'Đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notify: () => {},
      confirm: async () => true,
    };
  }
  return ctx;
};
