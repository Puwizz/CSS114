import { useState, useEffect } from 'react';
import {
  solveGaussElimination,
  solveGaussJordan,
  solveLUFactorization,
  findInverse
} from './utils/solver';
import type { Matrix, Vector, SolverResult, SolutionStatus } from './utils/solver';
import MatrixInput from './components/MatrixInput';
import ResultDisplay from './components/ResultDisplay';
import { Calculator, Grid3X3, Sigma, RefreshCcw, Moon, Sun } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [n, setN] = useState(3);
  const [matrixA, setMatrixA] = useState<Matrix>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]);
  const [matrixB, setMatrixB] = useState<Vector>([0, 0, 0]);

  const [method, setMethod] = useState<string>('gauss');
  const [resultX, setResultX] = useState<Vector | null>(null);
  const [resultLU, setResultLU] = useState<{ L: Matrix; U: Matrix } | null>(null);
  const [resultInverse, setResultInverse] = useState<Matrix | null>(null);
  const [solutionStatus, setSolutionStatus] = useState<SolutionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const methods = [
    { id: 'gauss', name: 'Gauss Elimination', icon: Sigma },
    { id: 'gauss-jordan', name: 'Gauss-Jordan', icon: Grid3X3 },
    { id: 'lu', name: 'LU Factorization', icon: Calculator },
    { id: 'inverse', name: 'Inverse Matrix', icon: RefreshCcw },
  ];

  const handleSolve = () => {
    setError(null);
    setResultX(null);
    setResultLU(null);
    setResultInverse(null);
    setSolutionStatus(null);

    try {
      let res: SolverResult;

      switch (method) {
        case 'gauss':
          res = solveGaussElimination(matrixA, matrixB);
          setSolutionStatus(res.status);
          if (res.status === 'unique' && res.solution) {
            setResultX(res.solution);
          }
          break;
        case 'gauss-jordan':
          res = solveGaussJordan(matrixA, matrixB);
          setSolutionStatus(res.status);
          if (res.status === 'unique' && res.solution) {
            setResultX(res.solution);
          }
          break;
        case 'lu':
          res = solveLUFactorization(matrixA, matrixB);
          setSolutionStatus(res.status);
          if (res.status === 'unique' && res.solution) {
            setResultX(res.solution);
            if (res.L && res.U) {
              setResultLU({ L: res.L, U: res.U });
            }
          }
          break;
        case 'inverse':
          const inv = findInverse(matrixA);
          if (!inv) throw new Error("Matrix is not invertible.");
          setResultInverse(inv);

          // No longer solving for x here as requested.
          // setResultX is cleared at the start of handleSolve, so x remains null.
          break;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during calculation.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col items-center relative">
          <button
            onClick={toggleTheme}
            className="absolute right-0 top-0 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400 mb-2">
            Linear Equation Solver
          </h1>
          <p className="text-slate-500 dark:text-slate-400">CSS114 Project - Numerical Methods</p>
        </header>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Navigation */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 h-fit transition-colors duration-300">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Algorithms</h2>
            <div className="space-y-2">
              {methods.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={clsx(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      method === m.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                        : "hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}
                  >
                    <Icon size={18} />
                    {m.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 px-4 py-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 text-xs text-indigo-800 dark:text-indigo-300">
              <p className="font-semibold mb-1">Current Method:</p>
              <p>{methods.find(m => m.id === method)?.name}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <MatrixInput
              n={n}
              setN={setN}
              matrixA={matrixA}
              setMatrixA={setMatrixA}
              matrixB={matrixB}
              setMatrixB={setMatrixB}
              onSolve={handleSolve}
            />

            <ResultDisplay
              x={resultX}
              lu={resultLU}
              inverse={resultInverse}
              error={error}
              status={solutionStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
