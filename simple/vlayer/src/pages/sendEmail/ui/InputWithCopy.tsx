import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";

interface InputWithCopyProps {
  label: string;
  value: string;
}

export const InputWithCopy = ({ label, value }: InputWithCopyProps) => {
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <label className="input input-bordered flex items-center gap-2 border-gray-300 text-black bg-purple-50/50 focus-within:border-[#915bf8] focus-within:bg-white">
        <input type="text" value={value} className="w-full bg-transparent" />
        <span
          className="label-text-alt cursor-pointer hover:text-[#915bf8]"
          onClick={() => {
            void navigator.clipboard.writeText(value);
          }}
        >
          <DocumentDuplicateIcon className="w-4 h-4" />
        </span>
      </label>
    </label>
  );
};
