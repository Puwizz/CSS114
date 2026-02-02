# Linear Equation Solver

A comprehensive React application for solving systems of linear equations using various numerical methods. This project demonstrates the implementation of complex mathematical algorithms within a modern web interface.

## 🚀 Features

- **Store & Manage Matrices**: Dynamic input for matrices of size `n x n`.
- **Multiple Algorithms**:
  - **Gauss Elimination**: Reduces matrix to row echelon form.
  - **Gauss-Jordan**: Reduces matrix to reduced row echelon form.
  - **LU Factorization**: Decomposes matrix into Lower and Upper triangular matrices.
  - **Matrix Inversion**: Calculates the inverse matrix and solves `x = A⁻¹b`.
- **Responsive UI**: Built with Tailwind CSS, featuring dark mode support.

## 🛠 Tech Stack

- **Frontend**: React (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## 📂 Code Explanation

### 1. Core Logic: `src/utils/solver.ts`
This file contains the "brain" of the application. It exports purely mathematical functions that operate on matrices (`number[][]`) and vectors (`number[]`).

- **`solveGaussElimination(matrix, vector)`**
  - Performs **Forward Elimination** with Partial Pivoting (swapping rows to place the largest value on the diagonal).
  - Checks for singular matrices (where diagonal element is near zero).
  - Uses **Back Substitution** to find the variable values from the last equation upwards.

- **`solveGaussJordan(matrix, vector)`**
  - Extends Gauss Elimination.
  - Normalizes each pivot row (dividing by the pivot value).
  - Eliminates values **both below and above** the pivot.
  - The resulting vector is the direct solution.

- **`solveLUFactorization(matrix, vector)`**
  - Implements the **Doolittle Algorithm**.
  - Decomposes Matrix $A$ into $L$ (Lower Triangular) and $U$ (Upper Triangular).
  - Solves the system in two steps:
    1. $Ly = b$ (Forward Substitution)
    2. $Ux = y$ (Backward Substitution)
    - Returns `{ x, L, U }` so the UI can display the decomposition.

- **`findInverse(matrix)`**
  - Uses Gauss-Jordan on an augmented matrix $[A | I]$.
  - Transforms $A$ into Identity $I$, which simultaneously transforms $I$ into $A^{-1}$.

### 2. Main Interface: `src/App.tsx`
The central component that orchestrates the application state and UI.

- **State Management**:
  - `n`: Dimension of the matrix (e.g., 3).
  - `matrixA`, `matrixB`: Store user input.
  - `method`: Tracks the currently selected algorithm.
  - `resultX`, `resultLU`, `resultInverse`: Store calculation results to prevent re-calculation on render.
  
- **`handleSolve()`**:
  - Validates inputs.
  - Calls the appropriate function from `solver.ts`.
  - Handles errors (e.g., "Singular Matrix") using a `try-catch` block.
  - For the **Inverse** method, it manually calculates $x = A^{-1} \cdot b$ to provide the solution vector alongside the inverse matrix.

### 3. Components (`src/components/`)
- **`MatrixInput.tsx`**: Dynamically generates a grid of input fields based on the dimension `n`.
- **`ResultDisplay.tsx`**: Visualizes the results, formatting the matrices and vectors for easy reading.

---

## 📦 How to Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```
