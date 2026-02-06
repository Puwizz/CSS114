export type Matrix = number[][];
export type Vector = number[];

export type SolutionStatus = 'unique' | 'infinite' | 'none';

export interface SolverResult {
    status: SolutionStatus;
    solution?: Vector;
    L?: Matrix;
    U?: Matrix;
}

const EPSILON = 1e-10;

export const solveGaussElimination = (matrix: Matrix, vector: Vector): SolverResult => {
    const n = matrix.length;
    // Clone to avoid modifying original
    const A = matrix.map((row) => [...row]);
    const b = [...vector];

    let pivotRow = 0;

    // Forward Elimination with robust pivot handling
    for (let col = 0; col < n && pivotRow < n; col++) {
        // Find pivot for this column
        let maxRow = pivotRow;
        for (let i = pivotRow + 1; i < n; i++) {
            if (Math.abs(A[i][col]) > Math.abs(A[maxRow][col])) {
                maxRow = i;
            }
        }

        // If pivot is essentially zero, skip this column (free variable)
        if (Math.abs(A[maxRow][col]) < EPSILON) {
            continue;
        }

        // Swap rows
        [A[pivotRow], A[maxRow]] = [A[maxRow], A[pivotRow]];
        [b[pivotRow], b[maxRow]] = [b[maxRow], b[pivotRow]];

        // Eliminate rows below
        for (let i = pivotRow + 1; i < n; i++) {
            const factor = A[i][col] / A[pivotRow][col];
            // Set pivot column to 0 explicitly to avoid precision artifacts
            A[i][col] = 0;
            for (let k = col + 1; k < n; k++) {
                A[i][k] -= factor * A[pivotRow][k];
            }
            b[i] -= factor * b[pivotRow];
        }

        pivotRow++;
    }

    // Check for inconsistent rows (0 = non-zero)
    for (let i = pivotRow; i < n; i++) {
        if (Math.abs(b[i]) > EPSILON) {
            // We have a row of zeros equal to a non-zero value
            // But wait, are the rows really all zeros?
            // The logic above ensures that for rows >= pivotRow, the columns < last processed col are eliminated. 
            // We should verify strictly that the row is zero.
            // However, with our logic, rows below pivotRow have been eliminated for all processed columns.
            // Any remaining columns must have been skipped because they were zero for all these rows.
            // So yes, row `i` should be effectively zero vectors.
            // Just to be safe, let's verify row sums? No, `b[i]` check is usually enough given the algorithm.
            return { status: 'none' };
        }
    }

    // If we have fewer pivots than variables, and system is consistent => Infinite solutions
    if (pivotRow < n) {
        return { status: 'infinite' };
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

    return { status: 'unique', solution: x };
};

export const solveGaussJordan = (matrix: Matrix, vector: Vector): SolverResult => {
    // Gauss-Jordan is essentially the same forward phase, handling singularity can be identical.
    // For simplicity, we can rely on `solveGaussElimination`'s logic for consistency checking, 
    // but users might expect the Gauss-Jordan algorithm steps.
    // Let's implement robust Gauss-Jordan.

    const n = matrix.length;
    const A = matrix.map((row) => [...row]);
    const b = [...vector];

    let pivotRow = 0;

    for (let col = 0; col < n && pivotRow < n; col++) {
        let maxRow = pivotRow;
        for (let i = pivotRow + 1; i < n; i++) {
            if (Math.abs(A[i][col]) > Math.abs(A[maxRow][col])) {
                maxRow = i;
            }
        }

        if (Math.abs(A[maxRow][col]) < EPSILON) {
            continue;
        }

        [A[pivotRow], A[maxRow]] = [A[maxRow], A[pivotRow]];
        [b[pivotRow], b[maxRow]] = [b[maxRow], b[pivotRow]];

        // Normalize Pivot Row
        const pivot = A[pivotRow][col];
        for (let j = col; j < n; j++) {
            A[pivotRow][j] /= pivot;
        }
        b[pivotRow] /= pivot;

        // Eliminate other rows (both above and below)
        for (let i = 0; i < n; i++) {
            if (i !== pivotRow) {
                const factor = A[i][col];
                for (let j = col; j < n; j++) {
                    A[i][j] -= factor * A[pivotRow][j];
                }
                b[i] -= factor * b[pivotRow];
            }
        }
        pivotRow++;
    }

    // Checking consistency
    // Any row with all zeros in A must have 0 in b
    for (let i = 0; i < n; i++) {
        let rowIsZero = true;
        for (let j = 0; j < n; j++) {
            if (Math.abs(A[i][j]) > EPSILON) {
                rowIsZero = false;
                break;
            }
        }
        if (rowIsZero && Math.abs(b[i]) > EPSILON) {
            return { status: 'none' };
        }
    }

    if (pivotRow < n) {
        return { status: 'infinite' };
    }

    // The result vector is just b
    return { status: 'unique', solution: b };
};

export const solveLUFactorization = (matrix: Matrix, vector: Vector): SolverResult => {
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
                if (Math.abs(U[i][i]) < EPSILON) {
                    // Singular Matrix encountered during LU
                    // LU decomposition fails or is not unique/stable without pivoting.
                    // To correctly identify No vs Infinite solution, we fallback to Gaussian Elimination check.
                    // As LU alone (without pivoting P) is not sufficient for general singular analysis.
                    return solveGaussElimination(matrix, vector);
                }
                L[k][i] = (matrix[k][i] - sum) / U[i][i];
            }
        }
    }

    // Check last pivot for singularity
    if (Math.abs(U[n - 1][n - 1]) < EPSILON) {
        return solveGaussElimination(matrix, vector);
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
        // U[i][i] checked above, but double check
        if (Math.abs(U[i][i]) < EPSILON) {
            return solveGaussElimination(matrix, vector);
        }
        x[i] = (y[i] - sum) / U[i][i];
    }

    return { status: 'unique', solution: x, L, U };
};

export const findInverse = (matrix: Matrix): Matrix | null => {
    const n = matrix.length;
    const A = matrix.map(row => [...row]);
    const I: Matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );

    // Gauss-Jordan
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
        }

        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [I[i], I[maxRow]] = [I[maxRow], I[i]];

        if (Math.abs(A[i][i]) < EPSILON) return null; // Singular, no inverse

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
