export default function switchBtn({ plans, setPlans }) {
  return (
    <div
      onClick={() => setPlans(!plans)}
      className={`relative flex items-center ${!plans ? "bg-[#FFFFFF0A] border-2 border-[#FFFFFF14]" : "bg-[#ffc94225] border-2 border-[#ffc9429d]"} rounded-full cursor-pointer transition-all w-[200px] md:w-[220px] lg:w-[264px] h-[54px] duration-300`}
    >
      <div
        className={`absolute bg-[#FFCA42] py-4 px-8 rounded-full flex items-center justify-center font-bold text-[#1B1B1B] transition-all duration-300 text-sm md:text-md lg:text-xl ${
          plans ? "translate-x-24 md:translate-x-28 lg:translate-x-35 " : "translate-x-0"
        }`}
      >
        {plans ? "Yearly" : "Monthly"}
      </div>
      <div className={`flex justify-between w-full px-3 md:px-4 lg:px-5 ${!plans ? "text-white": "text-black"} font-bold text-sm md:text-lg lg:text-xl`}>
        <h3>Monthly</h3>
        <h3>Yearly</h3>
      </div>
    </div>
  );
}
