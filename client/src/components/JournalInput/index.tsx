import { TextAreaProps } from "antd/es/input";
import { StyledInput } from "Components/JournalInput/journalInput.style";

interface InputProps extends TextAreaProps  {
  name: string,
  value?: string,
  placeholder: string,
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void

};

function JournalInput({ name, placeholder, onChange, value }: InputProps) {
  return (
    <StyledInput
      id={name}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
      rows={name === "description" ? 17 : 1}
    />
  );
}

export default JournalInput;
