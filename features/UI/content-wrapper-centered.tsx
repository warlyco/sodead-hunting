import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ContentWrapperCentered = ({ children, className }: Props) => {
  return (
    <div
      className={classNames([
        className,
        "container flex flex-col items-center justify-center gap-6 text-stone-300 mx-auto pt-16 -mt-16",
      ])}
    >
      <div className="overflow-y-auto pt-16 mb-16 text-center">{children}</div>
    </div>
  );
};
