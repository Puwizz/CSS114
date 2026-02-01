export type Matrix = number[][];
export type Vector = number[];

export const solveGaussElimination = (matrix: Matrix, vector: Vector): Vector | null => {
    const n = matrix.length;
    // Clone to avoid modifying original
    const A = matrix.map((row) => [...row]);
    const b = [...vector];

    // Forward Elimination
    for (let i = 0; i < n; i++) {
        // Pivoting
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                maxRow = k;
            }
        }

        // Swap rows
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [b[i], b[maxRow]] = [b[maxRow], b[i]];

        if (Math.abs(A[i][i]) < 1e-10) return null; // Singular matrix

        for (let k = i + 1; k < n; k++) {
            const factor = A[k][i] / A[i][i];
            b[k] -= factor * b[i];
            for (let j = i; j < n; j++) {
                A[k][j] -= factor * A[i][j];
            }
        }
    }

    // Back Substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (b[i] - sum) / A[i][i];
    }

    return x;
};

export const solveGaussJordan = (matrix: Matrix, vector: Vector): Vector | null => {
    const n = matrix.length;
    const A = matrix.map((row) => [...row]);
    const b = [...vector];

    for (let i = 0; i < n; i++) {
        // Pivoting
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                maxRow = k;
            }
        }

        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [b[i], b[maxRow]] = [b[maxRow], b[i]];

        if (Math.abs(A[i][i]) < 1e-10) return null;

        // Normalize Pivot Row
        const pivot = A[i][i];
        for (let j = i; j < n; j++) {
            A[i][j] /= pivot;
        }
        b[i] /= pivot;

        // Eliminate other rows
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = A[k][i];
                for (let j = i; j < n; j++) {
                    A[k][j] -= factor * A[i][j];
                }
                b[k] -= factor * b[i];
            }
        }
    }

    return b;
};

export const solveLUFactorization = (matrix: Matrix, vector: Vector): { x: Vector, L: Matrix, U: Matrix } | null => {
    const n = matrix.length;
    const L: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
    const U: Matrix = Array.from({ length: n }, () => Array(n).fill(0));

    // Doolittle Algorithm
    for (let i = 0; i < n; i++) {
        // Upper Triangular
        for (let k = i; k < n; k++) {
            let sum = 0;
            for (let j = 0; j < i; j++) {
                sum += (L[i][j] * U[j][k]);
            }
            U[i][k] = matrix[i][k] - sum;
        }

        // Lower Triangular
        for (let k = i; k < n; k++) {
            if (i === k)
                L[i][i] = 1;
            else {
                let sum = 0;
                for (let j = 0; j < i; j++) {
                    sum += (L[k][j] * U[j][i]);
                }
                L[k][i] = (matrix[k][i] - sum) / U[i][i];
            }
        }
    }

    // Forward Substitution Ly = b
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
            sum += L[i][j] * y[j];
        }
        y[i] = (vector[i] - sum) / L[i][i];
    }

    // Backward Substitution U x = y
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += U[i][j] * x[j];
        }
        if (Math.abs(U[i][i]) < 1e-10) return null; // Singular
        x[i] = (y[i] - sum) / U[i][i];
    }

    return { x, L, U };
};

export const findInverse = (matrix: Matrix): Matrix | null => {
    const n = matrix.length;
    const A = matrix.map(row => [...row]);
    const I: Matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );

    // Gauss-Jordan to transform [A|I] -> [I|A^-1]
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
        }

        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [I[i], I[maxRow]] = [I[maxRow], I[i]];

        if (Math.abs(A[i][i]) < 1e-10) return null;

        const pivot = A[i][i];
        for (let j = 0; j < n; j++) {
            A[i][j] /= pivot;
            I[i][j] /= pivot;
        }

        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = A[k][i];
                for (let j = 0; j < n; j++) {
                    A[k][j] -= factor * A[i][j];
                    I[k][j] -= factor * I[i][j];
                }
            }
        }
    }
    return I;
};
