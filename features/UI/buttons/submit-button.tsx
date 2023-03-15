import classNames from "classnames";
import { SecondaryButton } from "features/UI/buttons/secondary-button";
import Spinner from "features/UI/spinner";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
  buttonText?: string;
  children?: React.ReactNode | string;
}

export const SubmitButton = ({ isSubmitting, buttonText, children }: Props) => {
  return (
    <SecondaryButton
      className={classNames([
        isSubmitting
          ? "opacity-50 cursor-not-allowed"
          : "opacity-100 cursor-pointer",
      ])}
      type="submit"
    >
      {isSubmitting ? (
        <Spinner />
      ) : (
        <>{children ? children : buttonText || "Save"}</>
      )}
    </SecondaryButton>
  );
};
