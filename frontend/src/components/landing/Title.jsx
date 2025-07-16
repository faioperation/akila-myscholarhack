export default function Title({ title }) {
  return (
    <div className="h-[41px] bg-white/10 border-2 border-[#FFCA42] rounded-full inline-flex px-1 pr-4 items-center gap-3">
      <button
        className={`font-medium text-base text-black bg-[#FFCA42] py-1 px-3 hover:bg-[#ffc942c2] duration-300 rounded-full`}
      >
        New
      </button>

      <p className="text-white text-sm md:text-base lg:text-base">{title}</p>
    </div>
  );
}
