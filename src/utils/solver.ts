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

        for (let i = pivotRow + 1; i < n; i++) {
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

        const pivot = A[pivotRow][col];
        for (let j = col; j < n; j++) {
            A[pivotRow][j] /= pivot;
        }
        b[pivotRow] /= pivot;

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


export const solveLUFactorization = (matrix: Matrix, vector: Vector): SolverResult => {
    
    const n = matrix.length; 
    const L: Matrix = Array.from({ length: n }, () => Array(n).fill(0));  
    const U: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
    // LU decomposition
    for (let i = 0; i < n; i++) {
        /* U matrix : This is done by subtracting the previously calculated cumulative 
        product of L and U from the value in the original table, where the value of L is the same as M in Gauss elimination.
        */
        for (let k = i; k < n; k++) {
            let sum = 0;
            for (let j = 0; j < i; j++) {
                sum += (L[i][j] * U[j][k]);
            }
            U[i][k] = matrix[i][k] - sum;
        }
        /*L matrix : Prepare the value of M for calculation in the matrix u.*/

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

    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
            sum += L[i][j] * y[j];
        }
        y[i] = (vector[i] - sum) / L[i][i];
    }

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

export const findInverse = (matrix: Matrix): Matrix | null => {
    const n = matrix.length;
    const A = matrix.map(row => [...row]);
    const I: Matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );

    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
        }

        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [I[i], I[maxRow]] = [I[maxRow], I[i]];

        if (Math.abs(A[i][i]) < EPSILON) return null;

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
