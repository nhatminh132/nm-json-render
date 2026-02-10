import { defineRegistry, useStateStore } from "@json-render/react";
import { catalog } from "./catalog";

export const { registry } = defineRegistry(catalog, {
  components: {
    Card: ({ props, children }) => (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{props.title}</h3>
        {props.description && <p className="text-slate-600 mb-4">{props.description}</p>}
        <div className="space-y-4">{children}</div>
      </div>
    ),
    Button: ({ props, emit }) => {
      const variantStyles = {
        primary: "bg-slate-900 text-white hover:bg-slate-800",
        secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
        outline: "border border-slate-300 text-slate-900 hover:bg-slate-50",
      };
      const variant = props.variant || "primary";
      
      return (
        <button
          onClick={() => emit?.("press")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${variantStyles[variant]}`}
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
          <label className="block text-sm font-medium text-slate-700">
            {props.label}
          </label>
          <input
            type="text"
            placeholder={props.placeholder ?? ""}
            value={String(value)}
            onChange={(e) => set(`/form/${props.name}`, e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
          />
        </div>
      );
    },
    Text: ({ props }) => {
      const sizeStyles = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      };
      const size = props.size || "md";
      
      return <p className={`text-slate-700 ${sizeStyles[size]}`}>{props.content}</p>;
    },
  },
});
