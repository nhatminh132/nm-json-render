'use client';

import { useStateStore } from "@json-render/react";

// Direct component registry with dark theme
export const componentsRegistry = {
  Card: ({ props, children }) => (
    <div className="border border-white/20 bg-black p-6">
      <h3 className="text-xl font-medium text-white mb-2">{props.title}</h3>
      {props.description && <p className="text-white/60 mb-4 text-sm">{props.description}</p>}
      <div className="space-y-4">{children}</div>
    </div>
  ),
  Button: ({ props, emit }) => {
    const variantStyles = {
      primary: "bg-white text-black hover:bg-white/90",
      secondary: "border border-white/30 text-white hover:border-white",
      outline: "border border-white/30 text-white hover:bg-white hover:text-black",
    };
    const variant = props.variant || "primary";
    
    return (
      <button
        onClick={() => emit?.("press")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${variantStyles[variant]}`}
      >
        {props.label}
      </button>
    );
  },
  Input: ({ props }) => {
    const { get, set } = useStateStore();
    const value = get(`/form/${props.name}`) ?? "";
    
    return (
      <div className="space-y-2">
        <label className="block text-xs font-medium text-white/80 uppercase tracking-wider">
          {props.label}
        </label>
        <input
          type="text"
          placeholder={props.placeholder ?? ""}
          value={String(value)}
          onChange={(e) => set(`/form/${props.name}`, e.target.value)}
          className="w-full border border-white/20 bg-black text-white px-3 py-2 text-sm focus:border-white/60 focus:outline-none placeholder-white/30"
        />
      </div>
    );
  },
  Text: ({ props }) => {
    const sizeStyles = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };
    const size = props.size || "md";
    
    return <p className={`text-white/80 ${sizeStyles[size]}`}>{props.content}</p>;
  },
};
