import React from "react";

export default function WorkingSteps({
  number,
  title,
  description,
  columns,
  timeInvestment,
  whyItMatters,
  highlightBox,
  additionalInfo,
}) {
  return (
    <div className="mb-16">
      <h2 className="text-[40px]  font-semibold text-gray-900 mb-4">
        Step {number}: {title}
      </h2>

      {description && (
        <>
          <p className="text-gray-700 text-2xl font-semibold ">What You’ll Do</p>
          <p className="text-gray-700 mb-6 text-xl">{description}</p>
        </>
      )}

      {columns && (
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="font-bold text-gray-900 mb-3 text-2xl">
                {column.heading}
              </h3>
              <ol className="space-y-2">
                {column.items.map((item, idx) => (
                  <li key={idx} className="text-gray-700 text-xl">
                    <span className="font-semibold text-xl">{idx + 1}.</span>{" "}
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}

      {timeInvestment && (
        <p className="text-xl text-gray-600 mb-4">
          <span className="font-semibold text-2xl">Time Investment:</span>{" "}
          {timeInvestment}
        </p>
      )}

      {additionalInfo &&
        additionalInfo.map((info, index) => (
          <p key={index} className="text-xl text-gray-600 mb-4 ">
            <span className="font-semibold">{info.label}:</span> {info.text}
          </p>
        ))}

      {whyItMatters && (
        whyItMatters.map((info, index) => (
          <p key={index} className="text-gray-700 italic text-2xl">{info}</p>
        ))
      )}

      {highlightBox && (
        <div className="bg-gray-50 p-6 rounded-lg mt-4">
          <h3 className="font-semibold text-2xl text-gray-900 mb-3">
            {highlightBox.heading}
          </h3>
          <ol className="space-y-2">
            {highlightBox.items.map((item, idx) => (
              <li key={idx} className="text-gray-700 text-xl">
                <span className="font-semibold text-xl">{idx + 1}.</span> {item}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
