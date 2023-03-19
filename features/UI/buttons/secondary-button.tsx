import classNames from "classnames";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode | string;
  type?: "submit" | undefined;
}

export const SecondaryButton = ({ children, ...props }: Props) => {
  return (
    <button
      onClick={props?.onClick}
      className={classNames([
        "bg-blue-800 hover:bg-blue-900 rounded-xl p-4 py-2 uppercase text-stone-300",
        props.className,
      ])}
      type={props.type}
    >
      <>{children}</>
    </button>
  );
};
