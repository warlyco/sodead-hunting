import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ContentWrapper = ({ children, className }: Props) => {
  return (
    <div className={classNames([className, "pt-40 max-w-5xl mx-auto"])}>
      {children}
    </div>
  );
};
