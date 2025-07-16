import { Icon } from "@iconify/react";

export default function statusBtn({ title, style }) {
  return (
    <button
      className={`font-medium text-base  border-2 bg-transparent flex items-center pl-3 pr-4 py-2 rounded-full ${style}`}
    >
      <Icon
        className="animate-pulse"
        icon="icon-park-outline:dot"
        width="20"
        height="20"
      />
      {title}
    </button>
  );
}
