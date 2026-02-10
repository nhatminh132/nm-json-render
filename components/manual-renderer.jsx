'use client';

import { componentsRegistry } from '@/lib/components-registry';

// Manual renderer that directly uses our registry components
export function ManualRenderer({ spec, onAction }) {
  if (!spec || !spec.type) {
    return <div className="text-red-500">No valid spec</div>;
  }

  const ComponentWrapper = componentsRegistry[spec.type];
  
  if (!ComponentWrapper) {
    return <div className="text-red-500">Unknown component: {spec.type}</div>;
  }

  // Render children recursively
  const children = spec.children?.map((child, index) => (
    <ManualRenderer key={index} spec={child} onAction={onAction} />
  ));

  // Create emit function for events
  const emit = (eventName) => {
    console.log('Event emitted:', eventName, spec.on);
    // Handle the action if defined
    if (spec.on && spec.on[eventName]) {
      const actionName = spec.on[eventName].action;
      console.log('Triggering action:', actionName);
      if (onAction) {
        onAction(actionName);
      }
    }
  };

  // Call the component wrapper with the expected structure
  try {
    return ComponentWrapper({ 
      props: spec.props || {}, 
      emit: emit,
      children: children 
    });
  } catch (err) {
    console.error('Error rendering component:', spec.type, err);
    return <div className="text-red-500">Error rendering {spec.type}: {err.message}</div>;
  }
}
