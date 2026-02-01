import React, { useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { Matrix, Vector } from '../utils/solver';

interface MatrixInputProps {
    n: number;
    setN: (n: number) => void;
    matrixA: Matrix;
    setMatrixA: (m: Matrix) => void;
    matrixB: Vector;
    setMatrixB: (v: Vector) => void;
    onSolve: () => void;
}

const MatrixInput: React.FC<MatrixInputProps> = ({
    n,
    setN,
    matrixA,
    setMatrixA,
    matrixB,
    setMatrixB,
    onSolve,
}) => {
    // Initialize matrix when n changes (if size doesn't match)
    useEffect(() => {
        if (matrixA.length !== n) {
            const newA = Array.from({ length: n }, () => Array(n).fill(0));
            const newB = Array(n).fill(0);
            setMatrixA(newA);
            setMatrixB(newB);
        }
    }, [n, setMatrixA, setMatrixB, matrixA.length]);

    const handleDimensionChange = (delta: number) => {
        const newN = Math.max(2, Math.min(10, n + delta));
        setN(newN);
    };

    const handleAChange = (row: number, col: number, value: string) => {
        const newA = [...matrixA];
        newA[row] = [...newA[row]];
        newA[row][col] = parseFloat(value) || 0;
        setMatrixA(newA);
    };

    const handleBChange = (index: number, value: string) => {
        const newB = [...matrixB];
        newB[index] = parseFloat(value) || 0;
        setMatrixB(newB);
    };

    const loadExample1 = () => {
        setN(3);
        setMatrixA([
            [2, 1, 3],
            [4, 3, 5],
            [6, 5, 5],
        ]);
        setMatrixB([1, 1, -3]);
    };

    const loadExample2 = () => {
        setN(4);
        setMatrixA([
            [2, -1, -3, 1],
            [1, 1, 1, -2],
            [3, 2, -3, -4],
            [-1, -4, 1, 1],
        ]);
        setMatrixB([9, 10, 6, 6]);
    };

    const loadInverseExample = () => {
        setN(3);
        setMatrixA([
            [1, 2, -3],
            [-1, 1, -1],
            [0, -2, 3],
        ]);
        setMatrixB([5, 3, -1]); // Example 4
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-700/50 p-1.5 rounded-full border border-slate-200 dark:border-slate-600 transition-colors">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 pl-3 uppercase tracking-wider">Size (N)</span>
                    <div className="flex items-center bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-600 overflow-hidden">
                        <button
                            onClick={() => handleDimensionChange(-1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border-r border-slate-200 dark:border-slate-600 active:bg-slate-200 dark:active:bg-slate-600"
                            aria-label="Decrease Size"
                        >
                            <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="w-10 text-center font-bold text-lg text-slate-800 dark:text-slate-100 select-none">
                            {n}
                        </span>
                        <button
                            onClick={() => handleDimensionChange(1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border-l border-slate-200 dark:border-slate-600 active:bg-slate-200 dark:active:bg-slate-600"
                            aria-label="Increase Size"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-center">
                    <button onClick={loadExample1} className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                        Example 1 (3x3)
                    </button>
                    <button onClick={loadExample2} className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                        Example 2 (4x4)
                    </button>
                    <button onClick={loadInverseExample} className="px-3 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                        Inverse Ex (3x3)
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 justify-center items-start overflow-auto">
                {/* Matrix A Input */}
                <div>
                    <h3 className="text-center mb-2 font-semibold text-slate-700 dark:text-slate-300">Matrix A</h3>
                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${n}, minmax(60px, 1fr))` }}
                    >
                        {matrixA.map((row, i) => (
                            row.map((val, j) => (
                                <input
                                    key={`a-${i}-${j}`}
                                    type="number"
                                    value={val}
                                    onChange={(e) => handleAChange(i, j, e.target.value)}
                                    className="w-full h-12 text-center text-lg font-medium border-0 ring-1 ring-slate-200 dark:ring-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none transition-all duration-200 hover:ring-indigo-300 dark:hover:ring-indigo-500/50"
                                />
                            ))
                        ))}
                    </div>
                </div>

                {/* Vector B Input */}
                <div className="flex flex-col items-center">
                    <h3 className="text-center mb-2 font-semibold text-slate-700 dark:text-slate-300">Vector B</h3>
                    <div className="flex flex-col gap-2">
                        {matrixB.map((val, i) => (
                            <input
                                key={`b-${i}`}
                                type="number"
                                value={val}
                                onChange={(e) => handleBChange(i, e.target.value)}
                                className="w-20 h-12 text-center text-lg font-medium border-0 ring-1 ring-amber-200 dark:ring-amber-800/50 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 bg-amber-50 dark:bg-amber-950/20 text-slate-800 dark:text-amber-100 placeholder:text-amber-300 focus:outline-none transition-all duration-200 hover:ring-amber-300 dark:hover:ring-amber-700"
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <button
                    onClick={onSolve}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-lg"
                >
                    Solve System
                </button>
            </div>
        </div>
    );
};

export default MatrixInput;
