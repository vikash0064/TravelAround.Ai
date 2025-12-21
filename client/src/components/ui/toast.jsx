"use client";

import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = (argsOrTitle, options = {}) => {
    const id = options.id || (typeof argsOrTitle === 'object' && argsOrTitle.id) || Date.now();

    let title = argsOrTitle;
    let description = options.description;
    let action = options.action;
    let duration = options.duration;
    let type = options.type;

    // Handle Shadcn-style object argument: toast({ title, description, variant })
    if (typeof argsOrTitle === 'object' && argsOrTitle !== null) {
      title = argsOrTitle.title;
      description = argsOrTitle.description;
      action = argsOrTitle.action;
      duration = argsOrTitle.duration;
      // Map 'destructive' variant to 'error' type
      if (argsOrTitle.variant === 'destructive') {
        type = 'error';
      } else if (argsOrTitle.type) {
        type = argsOrTitle.type;
      }
    }

    setToasts((prev) => {
      const existing = prev.find(t => t.id === id);
      if (existing) {
        // update
        return prev.map(t => t.id === id ? { ...t, title, description, action, duration: duration ?? 4000, type } : t);
      } else {
        return [...prev, { id, title, description, action, duration: duration ?? 4000, type }];
      }
    });

    // Always set timeout to auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration ?? 4000);

    return { id };
  };

  return (
    <ToastContext.Provider value={{
      toast,
      loading: (message, options = {}) => toast(message, { ...options, type: "loading" }),
      error: (message, options = {}) => toast(message, { ...options, type: "error" }),
      success: (message, options = {}) => toast(message, { ...options, type: "success" })
    }}>
      {children}

      {/* ✅ FLEX CONTAINER (Sonner style) */}
      <ol
        className="
          fixed top-6 left-1/2 -translate-x-1/2
          z-[9999]
          flex flex-col items-center
          gap-3
          pointer-events-none
        "
      >
        {toasts.map((t, index) => (
          <li
            key={t.id}
            tabIndex={0}
            className={`text-center text-xl
              cn-toast
              pointer-events-auto
              w-[360px] max-w-[calc(100vw-2rem)]
              rounded-xl border shadow-lg
              px-5 py-3
              flex flex-col gap-1
              animate-toast-in
              ${t.type === 'error' ? 'bg-red-500 text-white border-red-600' :
                t.type === 'success' ? 'bg-green-500 text-white border-green-600' :
                  t.type === 'loading' ? 'bg-blue-500 text-white border-blue-600' :
                    'bg-white text-black border-gray-200'}`}
            style={{
              "--index": index,
            }}
          >
            <p className="font-medium text-gray-900">
              {t.title}
            </p>

            {t.description && (
              <p className="text-sm text-gray-600">
                {t.description}
              </p>
            )}

            {t.action && (
              <button
                onClick={() => {
                  t.action.onClick();
                  setToasts((prev) =>
                    prev.filter((x) => x.id !== t.id)
                  );
                }}
                className="self-end mt-2 text-sm font-medium text-blue-600 hover:underline"
              >
                {t.action.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
