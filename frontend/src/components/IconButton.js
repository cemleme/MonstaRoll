import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./IconButton.css";

const IconButton = ({ icon, text, handler, isDisabled, isSmall, isLong }) => {
  return (
    <button
      className={
        "iconButton " + (isSmall ? "small " : "") + (isLong ? "long " : "")
      }
      type="button"
      onClick={handler}
      disabled={isDisabled}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          style={{
            fontSize: text ? "14px" : "34px",
          }}
        />
      )}
      {text && (
        <span>
          {icon && <br />} {text}
        </span>
      )}
    </button>
  );
};

export default IconButton;
