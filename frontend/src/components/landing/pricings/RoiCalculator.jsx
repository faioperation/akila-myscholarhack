"use client";
import React, { useState, useEffect } from "react";

const RoiCalculator = () => {
    const [scholarshipsPerMonth, setScholarshipsPerMonth] = useState(5);
    const [averageAmount, setAverageAmount] = useState(1000);
    const [winRate, setWinRate] = useState(10);
    const [expectedWins, setExpectedWins] = useState(0);

    useEffect(() => {
        const wins = scholarshipsPerMonth * averageAmount * (winRate / 100);
        setExpectedWins(wins);
    }, [scholarshipsPerMonth, averageAmount, winRate]);

    const handleScholarshipChange = (val) => {
        const newVal = parseInt(val);
        if (!isNaN(newVal) && newVal >= 0) {
            setScholarshipsPerMonth(newVal);
        }
    };

    const incrementScholarships = () => setScholarshipsPerMonth((prev) => prev + 1);
    const decrementScholarships = () => setScholarshipsPerMonth((prev) => (prev > 0 ? prev - 1 : 0));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
            {/* Left Card: Inputs */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-8">
                    <label className="block text-gray-700 font-medium mb-3 text-lg">
                        Number of scholarships you'll apply to per month:
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <input
                            type="number"
                            value={scholarshipsPerMonth}
                            onChange={(e) => handleScholarshipChange(e.target.value)}
                            className="w-full p-4 text-gray-800 outline-none text-lg"
                        />
                        <button
                            onClick={decrementScholarships}
                            className="px-5 py-4 text-2xl text-gray-500 hover:bg-gray-50 border-l border-gray-200 transition-colors"
                        >
                            &mdash;
                        </button>
                        <button
                            onClick={incrementScholarships}
                            className="px-5 py-4 text-2xl text-gray-500 hover:bg-gray-50 border-l border-gray-200 transition-colors"
                        >
                            &#43;
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-gray-700 font-medium mb-3 text-lg">
                        Average scholarship amount:
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={averageAmount}
                            onChange={(e) => setAverageAmount(Number(e.target.value))}
                            className="w-full p-4 pl-8 border border-gray-200 rounded-lg text-gray-800 outline-none focus:border-blue-500 transition-colors text-lg"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
                            $
                        </span>
                        <style jsx>{`
              input[type="number"]::-webkit-inner-spin-button,
              input[type="number"]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            `}</style>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-gray-700 font-medium text-lg">
                            Your estimated win rate:
                        </label>
                        <span className="text-gray-800 font-medium text-lg">{winRate}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={winRate}
                        onChange={(e) => setWinRate(Number(e.target.value))}
                        className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                        style={{
                            background: `linear-gradient(to right, #FCD34D 0%, #FCD34D ${winRate}%, #374151 ${winRate}%, #374151 100%)`
                        }}
                    />
                    <p className="text-gray-500 text-sm mt-2">typical is 5-10%</p>
                </div>
            </div>

            {/* Right Card: Results */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                {/* Background decoration if needed, but image looks clean white/light */}

                <h3 className="text-gray-700 font-medium text-xl mb-2">
                    Expected monthly scholarship wins
                </h3>
                <div className="text-5xl font-bold text-gray-800 mb-6">
                    ${Math.round(expectedWins)}
                </div>

                <p className="text-gray-600 mb-8 text-lg">
                    Cost of Essay Hack+: $29.99/month
                </p>

                <div className="flex items-center gap-6 mb-8">
                    {/* Circular Progress */}
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#E0E7FF"
                                strokeWidth="12"
                                fill="transparent"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#6366F1"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 56}
                                strokeDashoffset={2 * Math.PI * 56 * (1 - 0.75)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800">75%</span>
                            <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-0.5 rounded-full mt-1">+10%</span>
                        </div>
                    </div>
                </div>

                <div className="text-green-500 font-medium text-2xl">
                    Your ROI / return
                </div>
            </div>
        </div>
    );
};

export default RoiCalculator;
