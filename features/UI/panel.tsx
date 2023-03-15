import classNames from "classnames";

export interface PanelProps extends React.HTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

export const Panel = ({ children, className, ...props }: PanelProps) => {
  return (
    <form
      className={classNames(
        "flex flex-wrap max-w-lg bg-stone-300 rounded-xl shadow-2xl mx-auto p-4 space-y-4 min-w-[400px]",
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
};
