import IconicBtn from "./IconicBtn";

export default function SolutionSteps({ icon, title, descrtion, step }) {
  const SolutionStep = [1, 2, 3, 4];
  return (
    <div className="w-full flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group">
      <div className="w-full md:w-[10%] flex flex-row md:flex-col justify-start md:justify-center items-center gap-2 ">
        <IconicBtn
          icon={icon}
          style={"bg-[#FFCA42] inline-flex rounded-full group-hover:animate-bounce duration-300 shrink-0"}
        />
        <div className="hidden md:block w-1 h-[61px] bg-linear-to-b from-[#FBA919]"></div>
      </div>
      <div className="w-full md:w-[90%] relative">
        <h3 className="bg-[#FFCA42] px-9 py-1 inline-flex absolute right-7 -top-3 md:top-1 z-10 text-sm md:text-base">
          Step {step}
        </h3>
        <div className="border-2 border-[#FFE7A8] bg-[#F9F9F9] mt-0 md:mt-[22px] p-6 rounded-2xl group-hover:shadow-xl duration-300">
          <h3 className="text-xl md:text-2xl font-bold pr-20 md:pr-0">{title}</h3>
          <p className="py-4 text-lg md:text-xl leading-[145%]">{descrtion}</p>

          <div className="grid grid-cols-4 gap-1.5">
            {SolutionStep.map((_, idx) => (
              <p
                key={idx}
                className={`w-full h-1.5 ${step >= idx + 1 ? "bg-[#E8B83C]" : " bg-[#1B1B1B]"
                  } `}
              ></p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
