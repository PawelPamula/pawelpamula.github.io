---
date: '2026-03-20T23:33:49+09:00'
draft: false
title: "Ramanujan's Puzzle"
---

> A certain street has between 50 and 500 houses in a row, numbered 1, 2, 3, 4, … consecutively. There is a certain house on the street such that the sum of all the house numbers to the left side of it is equal to the sum of all the house numbers to its right. Find the number of this house.

This riddle was presented to Ramanujan by his friend, P. C. Mahalanobis. Ramanujan famously came up with a general solution immediately, providing a continued fraction that encoded an infinite series of solutions. In this post, we're going to explore the method for solving this puzzle.

### Simple Algebraic Solution

Let's rewrite the problem in terms of algebraic equations. We will denote the total number of houses by \(n\) and the specific house number from the problem by \(x\).

$$
\underbrace{1 + \ldots + (x - 1)}_{\text{left side}} + x + \underbrace{(x + 1) + \ldots + n}_{\text{right side}} 
$$

The sum of the left side must equal the sum of the right side. Using the formula for the sum of an arithmetic progression, we get:

$$
\frac{x(x-1)}{2} = \frac{n(n+1)}{2} - \frac{x(x+1)}{2}
$$

Simplifying this yields:

$$
x^2 = \frac{n(n+1)}{2}
$$

$$
x = \sqrt{\frac{n(n+1)}{2}}
$$

At this point, we can run a simple Python script to find a triangular number [^1] that is also a perfect square. 

```python
from math import sqrt, floor

for n in range(1, 2000):
    t = n * (n + 1) // 2
    x = floor(sqrt(t))
    if x**2 == t:
        print(f"n = {n}, x = {x}")
```

The script yields the following results:

```
n = 1, x = 1
n = 8, x = 6
n = 49, x = 35
n = 288, x = 204
n = 1681, x = 1189
``` 

Since the problem states there are between 50 and 500 houses, the solution is **\(n=288\)** and **\(x=204\)**. However, while effective, this is a brute-force approach. Let’s look for a more elegant one!

### General Solution

If we remove the lower and upper bounds on \(n\), there are infinitely many solutions. Let’s look closer at the equation:

$$
x = \sqrt{\frac{n(n+1)}{2}}
$$

For the expression under the square root to be an integer, one of the factors, \(n\) or \((n+1)\), must be even. Let's consider the case where \(n\) is even by setting \(n = 2k\) and \(n+1 = 2k+1\). This gives us:

$$
x = \sqrt{k(2k+1)}
$$

Since \(k\) and \(2k+1\) share no common factors, both must be perfect squares for \(x\) to be an integer. Let \(k = b^2\) and \(2k+1 = a^2\). Substituting these back leads to:

$$
a^2 - 2b^2 = 1
$$

Considering the symmetrical case (where \(n+1\) is even), we eventually arrive at the general form:

$$
a^2 - 2b^2 = \pm 1
$$

This is known (somewhat erroneously [^2]) as **Pell's equation** [^3]. In its general form, it is written as:

$$
a^2 - db^2 = \pm 1
$$

Lagrange proved that the continued fraction expansion of \(\sqrt{d}\) provides the solutions to this equation.

### What is a continued fraction? 

A continued fraction is an expression of the form:

$$
a_0 + \frac{1}{a_1 + \frac{1}{a_2 + \ldots}}
$$

where \(a_i\) are integers. We often use the shorthand notation \([a_0; a_1, a_2, \ldots]\). 

In our case, \(d = 2\), so we need to represent \(\sqrt{2}\) as a continued fraction:

$$
\sqrt{2} = 1 + (\sqrt{2} - 1) = 1 + (\sqrt{2} - 1) \cdot \frac{\sqrt{2} + 1}{\sqrt{2} + 1} = 1 + \frac{1}{1 + \sqrt{2}}
$$

Since \(\sqrt{2}\) appears on both sides, we can perform a recursive substitution:

$$
\sqrt{2} = 1 + \frac{1}{2 + \frac{1}{2 + \frac{1}{2 + \ldots}}} = [1; 2, 2, 2, \ldots]
$$

We can also define the \(k\)-th **convergent** of a continued fraction (\(C_k\)), which is the fraction truncated at the \(k\)-th term. For \(\sqrt{2}\), the convergents are:

$$
C_0 = 1, \quad C_1 = \frac{3}{2}, \quad C_2 = \frac{7}{5}, \quad C_3 = \frac{17}{12}
$$

### Lagrange's Theorem

Lagrange noticed a deep connection here: if we take the \(k\)-th convergent \(C_k = \frac{A_k}{B_k}\), then \(A_k\) and \(B_k\) provide solutions to the Pell equation. 

For example, using the 2nd convergent where \(A_k = 7\) and \(B_k = 5\):

$$
A_k^2 - 2B_k^2 = 7^2 - 2(5^2) = 49 - 50 = -1
$$

### Recovering the Solution

To solve the riddle using this method, we recall our earlier substitution. 

$$
x = \sqrt{k(2k+1)} = \sqrt{a^2b^2} = a \cdot b = A_k \cdot B_k
$$

By calculating successive convergents, we generate every possible \(x\) and \(n\) that satisfy the house-sum condition. 

As we saw in our Python output, these values match perfectly with the properties of the convergents of \(\sqrt{2}\).

[^1]: [https://en.wikipedia.org/wiki/Triangular_number](https://en.wikipedia.org/wiki/Triangular_number)
[^2]: It was actually Euler who mistakenly attributed the equation to John Pell!
[^3]: [https://en.wikipedia.org/wiki/Pell%27s_equation](https://en.wikipedia.org/wiki/Pell%27s_equation)