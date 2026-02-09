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

/**
 * Solves a system of linear equations using Gaussian Elimination.
 * Converts the matrix to row-echelon form and then uses back substitution.
 */
export const solveGaussElimination = (matrix: Matrix, vector: Vector): SolverResult => {
    const n = matrix.length;
    const A = matrix.map((row) => [...row]);
    const b = [...vector];

    let pivotRow = 0;

    for (let col = 0; col < n && pivotRow < n; col++) {
        // Find the pivot element (Partial Pivoting)
        // Select the row with the largest absolute value in the current column to ensure numerical stability.
        let maxRow = pivotRow;
        for (let i = pivotRow + 1; i < n; i++) {
            if (Math.abs(A[i][col]) > Math.abs(A[maxRow][col])) {
                maxRow = i;
            }
        }

        if (Math.abs(A[maxRow][col]) < EPSILON) {
            continue;
        }

        // Swap the current row with the pivot row
        [A[pivotRow], A[maxRow]] = [A[maxRow], A[pivotRow]];
        [b[pivotRow], b[maxRow]] = [b[maxRow], b[pivotRow]];

        // Eliminate entries below the pivot to convert A into an Upper Triangular Matrix (Row Echelon Form).
        // For each row i below the pivotRow, we subtract a multiple of the pivotRow.
        // Operation: R_i = R_i - factor * R_pivotRow
        for (let i = pivotRow + 1; i < n; i++) {
            // factor = coefficient to be eliminated / pivot value
            const factor = A[i][col] / A[pivotRow][col];
            A[i][col] = 0;
            for (let k = col + 1; k < n; k++) {
                A[i][k] -= factor * A[pivotRow][k];
            }
            b[i] -= factor * b[pivotRow];
        }

        pivotRow++;
    }

    for (let i = pivotRow; i < n; i++) {
        if (Math.abs(b[i]) > EPSILON) {
            return { status: 'none' };
        }
    }

    if (pivotRow < n) {
        return { status: 'infinite' };
    }

    // Back Substitution
    // Solve for unknown variables x starting from the last row (n-1) up to the first (0).
    // Formula: x_i = (b_i - sum(A_ij * x_j for j > i)) / A_ii
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

/**
 * Solves a system of linear equations using Gauss-Jordan Elimination.
 * Converts the matrix to reduced row-echelon form.
 */
export const solveGaussJordan = (matrix: Matrix, vector: Vector): SolverResult => {
    const n = matrix.length;
    const A = matrix.map((row) => [...row]);
    const b = [...vector];

    let pivotRow = 0;

    for (let col = 0; col < n && pivotRow < n; col++) {
        // Find the pivot element (Partial Pivoting)
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

        // Normalize the pivot row so the pivot element becomes 1 (Identity Matrix property).
        // Operation: R_pivot = R_pivot / pivotValue
        const pivot = A[pivotRow][col];
        for (let j = col; j < n; j++) {
            A[pivotRow][j] /= pivot;
        }
        b[pivotRow] /= pivot;

        // Eliminate all other entries in the current column (both above and below) to make them 0.
        // This transforms the matrix directly into Reduced Row Echelon Form.
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

    return { status: 'unique', solution: b };
};


/**
 * Solves a system of linear equations using LU Factorization (Doolittle's Algorithm).
 * Decomposes A into Lower (L) and Upper (U) triangular matrices, then solves Ly = b and Ux = y.
 */
export const solveLUFactorization = (matrix: Matrix, vector: Vector): SolverResult => {

    const n = matrix.length;
    const L: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
    const U: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
    // LU decomposition
    for (let i = 0; i < n; i++) {
        // Calculate Upper Triangular Matrix (U) using Doolittle's Algorithm.
        // U_ik = A_ik - sum(L_ij * U_jk) for j < i
        for (let k = i; k < n; k++) {
            let sum = 0;
            for (let j = 0; j < i; j++) {
                sum += (L[i][j] * U[j][k]);
            }
            U[i][k] = matrix[i][k] - sum;
        }

        // Calculate Lower Triangular Matrix (L)
        // L_ki = (A_ki - sum(L_kj * U_ji)) / U_ii for j < i
        // Diagonal elements L_ii are set to 1.
        for (let k = i; k < n; k++) {
            //If it's a diagonal position (e.g., row 1, column 1), always put the number 1.
            if (i === k)
                L[i][i] = 1;
            else { //calculate the cumulative sum to prepare for finding the value of L at that location.
                let sum = 0;
                for (let j = 0; j < i; j++) {
                    sum += (L[k][j] * U[j][i]);
                }
                if (Math.abs(U[i][i]) < EPSILON) {
                    return solveGaussElimination(matrix, vector);
                }
                L[k][i] = (matrix[k][i] - sum) / U[i][i];
            }
        }
    }

    if (Math.abs(U[n - 1][n - 1]) < EPSILON) {
        return solveGaussElimination(matrix, vector);
    }

    // Forward Substitution: Solve Ly = b for y
    // Formula: y_i = (b_i - sum(L_ij * y_j for j < i)) / L_ii
    // Since L_ii is 1, the division is trivial.
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
            sum += L[i][j] * y[j];
        }
        y[i] = (vector[i] - sum) / L[i][i];
    }

    // Backward Substitution: Solve Ux = y for x
    // Formula: x_i = (y_i - sum(U_ij * x_j for j > i)) / U_ii
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += U[i][j] * x[j];
        }
        if (Math.abs(U[i][i]) < EPSILON) {
            return solveGaussElimination(matrix, vector);
        }
        x[i] = (y[i] - sum) / U[i][i];
    }

    return { status: 'unique', solution: x, L, U };
};

/**
 * Finds the inverse of a matrix using Gauss-Jordan Elimination.
 * Augments the matrix with the identity matrix and reduces it.
 */
export const findInverse = (matrix: Matrix): Matrix | null => {
    const n = matrix.length;
    const A = matrix.map(row => [...row]);
    const I: Matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );

    for (let i = 0; i < n; i++) {
        // Partial Pivoting
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
        }

        // Swap rows in both Matrix A and Identity Matrix I
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [I[i], I[maxRow]] = [I[maxRow], I[i]];

        if (Math.abs(A[i][i]) < EPSILON) return null;

        // Scale the pivot row to make the pivot element 1.
        // This ensures the final matrix on the left is the Identity Matrix I.
        const pivot = A[i][i];
        for (let j = 0; j < n; j++) {
            A[i][j] /= pivot;
            I[i][j] /= pivot;
        }

        // Eliminate all other entries in the column to 0.
        // The operations performed on A to make it I are performed on I to make it A^(-1).
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
