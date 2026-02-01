import React from 'react';
import type { Matrix, Vector } from '../utils/solver';

interface ResultDisplayProps {
    x: Vector | null;
    lu: { L: Matrix; U: Matrix } | null;
    inverse: Matrix | null;
    error: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ x, lu, inverse, error }) => {
    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 mt-6 text-center animate-pulse">
                {error}
            </div>
        );
    }

    if (!x && !inverse) return null;

    return (
        <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center border-b dark:border-slate-700 pb-4">Results</h2>

            {/* Solution Vector X */}
            {x && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Solution Vector (x)</h3>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {x.map((val, i) => (
                            <div key={i} className="flex flex-col items-center bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800 min-w-[80px]">
                                <span className="text-xs text-green-600 dark:text-green-400 font-bold mb-1">x{i + 1}</span>
                                <span className="text-lg font-mono text-slate-800 dark:text-slate-200">
                                    {Number.isInteger(val) ? val : val.toFixed(4)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inverse Matrix Display */}
            {inverse && (
                <div className="mb-8 overflow-x-auto">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Inverse Matrix (A⁻¹)</h3>
                    <div className="inline-block border-l-2 border-r-2 border-slate-800 dark:border-slate-400 px-2 rounded-lg">
                        {inverse.map((row, i) => (
                            <div key={i} className="flex gap-4 mb-2 last:mb-0">
                                {row.map((val, j) => (
                                    <div key={j} className="w-16 text-center font-mono text-sm py-1 text-slate-700 dark:text-slate-300">
                                        {Number.isInteger(val) ? val : val.toFixed(3)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* LU Factorization Display */}
            {lu && (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="overflow-x-auto">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Lower Triangular (L)</h3>
                        <div className="inline-block border-l-2 border-r-2 border-slate-800 dark:border-slate-400 px-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                            {lu.L.map((row, i) => (
                                <div key={i} className="flex gap-4 mb-2 last:mb-0">
                                    {row.map((val, j) => (
                                        <div key={j} className="w-12 text-center font-mono text-sm py-1 text-slate-700 dark:text-slate-300">
                                            {Number.isInteger(val) ? val : val.toFixed(2)}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Upper Triangular (U)</h3>
                        <div className="inline-block border-l-2 border-r-2 border-slate-800 dark:border-slate-400 px-2 rounded-lg bg-orange-50/50 dark:bg-orange-900/20">
                            {lu.U.map((row, i) => (
                                <div key={i} className="flex gap-4 mb-2 last:mb-0">
                                    {row.map((val, j) => (
                                        <div key={j} className="w-12 text-center font-mono text-sm py-1 text-slate-700 dark:text-slate-300">
                                            {Number.isInteger(val) ? val : val.toFixed(2)}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultDisplay;
