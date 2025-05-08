import * as React from "react";
import { cn } from "@/lib/utils";

interface TreeRootProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  children: React.ReactNode;
}

const TreeRoot = React.forwardRef<HTMLUListElement, TreeRootProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ul
        className={cn("list-none pl-0", className)}
        ref={ref}
        role="tree"
        {...props}
      >
        {children}
      </ul>
    );
  }
);
TreeRoot.displayName = "TreeRoot";

interface TreeNodeProps extends React.HTMLAttributes<HTMLLIElement> {
  className?: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  isParent?: boolean;
  level?: number;
}

const TreeNode = React.forwardRef<HTMLLIElement, TreeNodeProps>(
  ({ className, children, isExpanded = false, isParent = false, level = 0, ...props }, ref) => {
    const [expanded, setExpanded] = React.useState(isExpanded);
    
    return (
      <li
        className={cn(
          "my-1 relative",
          isParent && "cursor-pointer",
          className
        )}
        ref={ref}
        role="treeitem"
        aria-expanded={isParent ? expanded : undefined}
        {...props}
      >
        {isParent && (
          <span
            className="absolute left-0 -ml-4 top-1 cursor-pointer text-gray-400 hover:text-gray-800"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? '▼' : '►'}
          </span>
        )}
        <div className="flex items-center relative ml-4 pl-2">
          {level > 0 && (
            <div 
              className="absolute -left-4 -top-4 border-l-2 border-b-2 border-gray-300 h-8 w-5"
              aria-hidden="true"
            />
          )}
          {children}
        </div>
      </li>
    );
  }
);
TreeNode.displayName = "TreeNode";

interface TreeBranchProps extends React.HTMLAttributes<HTMLUListElement> {
  className?: string;
  children: React.ReactNode;
  isExpanded?: boolean;
}

const TreeBranch = React.forwardRef<HTMLUListElement, TreeBranchProps>(
  ({ className, children, isExpanded = false, ...props }, ref) => {
    return (
      <ul
        className={cn(
          "list-none ml-6 pl-2 border-l-2 border-gray-200",
          !isExpanded && "hidden",
          className
        )}
        ref={ref}
        role="group"
        {...props}
      >
        {children}
      </ul>
    );
  }
);
TreeBranch.displayName = "TreeBranch";

interface TreeLeafContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  avatar?: React.ReactNode;
  label: string;
  description?: string;
}

const TreeLeafContent = React.forwardRef<HTMLDivElement, TreeLeafContentProps>(
  ({ className, children, avatar, label, description, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center space-x-2 py-1",
          className
        )}
        ref={ref}
        {...props}
      >
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 truncate">{label}</div>
          {description && (
            <div className="text-xs text-gray-500 truncate">{description}</div>
          )}
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    );
  }
);
TreeLeafContent.displayName = "TreeLeafContent";

export { TreeRoot, TreeNode, TreeBranch, TreeLeafContent };
