---
date: '2026-10-15T20:40:04+09:00'
draft: false
title: 'Group Privacy for MaxGeo Probabilistic Counter'
---

In this post we're going to introduce an extension for [Probabilistic Counters for Privacy Preserving Data Aggregation](https://arxiv.org/pdf/2003.11446) and analyze group differential privacy ([$(\epsilon, \delta)$-$k$-DP](#13-epsilon-delta-k-differential-privacy-group-privacy)) for the [MaxGeo probabilistic counter](#11-maxgeo-counter).

# 1. Background

Let's review some of the basic definitions and lemmas to set the scene for the proof and standardize the notation.

## 1.1 MaxGeo counter

1. The counter state $M$ is initialized to $0$.
2. When the $i$-th increment request arrives ($i = 1, 2, \dots, n$), the server draws an independent sample from the geometric distribution $X_i \sim \text{Geo}(1/2)$ with probability mass function $\mathbb{P}(X_i=j)=\left(\frac{1}{2}\right)^j=2^{-j}$ for $j \in \mathbb{N}_{\geq 1}$.
3. For a non-empty dataset of $n \ge 1$ requests, the counter retains only the **maximum** value seen so far:

$$M_n = \max\{X_1, X_2, \dots, X_n\} \in \mathbb{N}_{\geq 1}.$$

## 1.2 $(\epsilon, \delta)$-Differential Privacy

Differential privacy ensures that an algorithm's output does not reveal whether any individual participated in the data set.

**Definition 1.1 (Neighboring datasets).** Modeling datasets as non-negative integer histograms where $\lVert x\rVert_1$ denotes the total number of requests, two datasets $x$, $y$ are neighboring if they differ by the addition or deletion of one person's data: $\lVert x-y\rVert_1 \le 1$.

**Definition 1.2 (Differential Privacy).** A randomized algorithm $M$ satisfies $(\epsilon, \delta)$-DP if, for all neighboring datasets $x, y$ ([Definition 1.1](#12-epsilon-delta-differential-privacy)) and all output subsets $S \subseteq \text{Range}(M)$:

$$\mathbb{P}(M(x) \in S) \le e^\epsilon\mathbb{P}(M(y) \in S) + \delta.$$

- **$\epsilon > 0$ (Privacy budget):** If $\epsilon = 0.5$, then $e^{0.5} \approx 1.65$, meaning an observer cannot see the probability of an outcome change by more than $65\%$.
- **$\delta \ge 0$ (Failure probability):** A small additive tolerance for failure. In practice, we require $\delta \ll 1/n$ (e.g., $10^{-4}$ or $10^{-6}$).

## 1.3 $(\epsilon, \delta)$-$k$-Differential Privacy (Group Privacy)

This is an extension of the [$(\epsilon, \delta)$-DP mechanism (Definition 1.2)](#12-epsilon-delta-differential-privacy) that considers a group of $k$ colluding individuals or a single user sending $k$ correlated requests over time.

**Definition 1.3 ($(\epsilon, \delta)$-$k$-Differential Privacy).** A mechanism $M$ satisfies **$(\epsilon, \delta)$-$k$-DP** if for all datasets $x, y$ differing by up to $k$ entries ($\lVert x-y\rVert_1 \le k$) and all output subsets $S$:

$$\mathbb{P}(M(x) \in S) \le e^\epsilon\mathbb{P}(M(y) \in S) + \delta$$

where $\epsilon$ denotes the total allowed privacy loss for the entire group of $k$ people.

We assume two properties:

1. Only the terminal counter value $M(x)$ is released without intermediate updates.
2. Every increment draws an i.i.d. $X_i$ on the server ([Section 1.1](#11-maxgeo-counter)).

Under these two conditions, $M(x)$ depends only on the size $n = \lVert x\rVert_1$ of $x$, and by the reverse triangle inequality, $\lVert x - y\rVert_1 \le k$ implies $\bigl|\lVert x\rVert_1 - \lVert y\rVert_1\bigr| \le k$.

## 1.4 CDF and PMF

Let $X_1, \dots, X_n \stackrel{\text{i.i.d.}}{\sim} \text{Geo}(1/2)$ ([Section 1.1](#11-maxgeo-counter)).
First, the probability that a single trial $X_i$ is at most $l$ is:

$$\mathbb{P}(X_i \le l) = \sum_{j=1}^l \mathbb{P}(X_i = j) = \sum_{j=1}^l \left(\frac{1}{2}\right)^j.$$

From the standard finite geometric series formula for ratio $r=\frac{1}{2}$:

$$\sum_{j=1}^l r^j = r \frac{1 - r^l}{1 - r} = \frac{1}{2} \cdot \frac{1 - (1/2)^l}{1 - 1/2} = 1 - 2^{-l}.$$

Thus:

$$\mathbb{P}(X_i \le l) = 1 - 2^{-l}.$$

The maximum $M_n = \max_{1 \le i \le n} X_i$ is $\le l$ if and only if **every** individual trial $X_i \le l$. The cumulative distribution function (CDF) of $M_n = \max_{1 \le i \le n} X_i$ evaluated at $l \ge 1$ is:

$$\mathbb{P}(M_n \le l) = \mathbb{P}(X_1 \le l \text{ and } X_2 \le l \text{ and } \dots \text{ and } X_n \le l).$$

Because the trials are mutually independent:

$$\mathbb{P}(M_n \le l) = \prod_{i=1}^n \mathbb{P}(X_i \le l) = \left(1 - 2^{-l}\right)^n.$$

Notice that for $n \ge 1$, this expression also holds at $l = 0$, since $\mathbb{P}(M_n \le 0) = 0 = (1 - 2^0)^n$. The probability mass function (PMF) for $l \ge 1$ is given by the difference of consecutive CDF values:

$$\begin{aligned}
\mathbb{P}(M_n = l) &= \mathbb{P}(M_n \le l) - \mathbb{P}(M_n \le l - 1) \\
&= \left(1 - 2^{-l}\right)^n - \left(1 - 2^{-(l-1)}\right)^n \\
&= \left(1 - 2^{-l}\right)^n - \left(1 - 2^{1-l}\right)^n.
\end{aligned}$$

For $l \le 0$, $\mathbb{P}(M_n = l) = 0$.

## 1.5 The Good Set Translation Lemma

*In [the paper](https://arxiv.org/pdf/2003.11446) this lemma is introduced as Fact 1.*

**Lemma F1 (Good Set Translation Lemma).** Fix an ordered pair of positive integers $(n, m)$. If there exists a subset of outcomes $S_{n,m} \subseteq \mathbb{N}_{\geq 1}$ (called the *good set*) such that:

1. Bounded likelihood ratio on the good set: $\dfrac{\mathbb{P}(M_n = l)}{\mathbb{P}(M_m = l)} \le e^\epsilon$ for all $l \in S_{n,m}$,
2. Small tail mass outside the good set: $\mathbb{P}(M_n \notin S_{n,m}) \le \delta$,

then $\mathbb{P}(M_n \in S) \le e^\epsilon \mathbb{P}(M_m \in S) + \delta$ for all measurable $S \subseteq \mathbb{N}_{\ge 1}$. Consequently, if such a good set $S_{n,m}$ exists for every ordered pair $(n, m)$ with $\min(n, m) \ge N$ and $|n - m| \le k$, then $M$ satisfies [$(\epsilon, \delta)$-$k$-DP on populations of size at least $N$ (Definition 1.3)](#13-epsilon-delta-k-differential-privacy-group-privacy).

# 2. Outline

Proving $(\epsilon, \delta)$-$k$-DP reduces to finding a good set
([Lemma F1](#15-the-good-set-translation-lemma)) for every pair $M_n$,
$M_{n+k'}$ with $0 \le k' \le k$, in both directions, due to symmetry of the problem.

In the reverse direction, with the larger population in the numerator,
[Section 3](#3-reverse-ratio-bounding-via-cauchys-mean-value-theorem) uses
Cauchy's Mean Value Theorem to bound the likelihood ratio by $1 + k/n$ at every
outcome, so the entire support is a good set once $1 + k/n \le e^\epsilon$. 

In the forward direction, the ratio reaches $2^k$ at $l = 1$, so
[Section 4](#4-forward-ratio-bounding) restricts the good set to levels at or
above a cutoff $l_{\epsilon,k}$, where the ratio is at most $e^\epsilon$.

[Section 5](#5-bounding-the-bad-set-probability) shows that $M_n$ falls below
this cutoff with probability at most $\delta$ once $n$ is at least
$N_{\epsilon,k,\delta}$. 

For $\delta \le 1/e$, this population condition already
implies $1 + k/n \le e^\epsilon$ ([Section 6](#6-reverse-ratio-verification)),
so both directions combine into the main theorem
([Section 7](#7-main-theorem-and-asymptotics)), with a population threshold
$N_{\epsilon,k,\delta} = \Theta(k\ln(1/\delta)/\epsilon)$ for $\epsilon \le k$.
Finally, [Section 8](#8-a-lower-bound-on-delta) shows that $\delta$ cannot
vanish as $n \to \infty$ for linear-sized groups $k \ge cn$, and
[Section 9](#9-comparison-with-generic-group-privacy) compares the result with
generic Dwork-Roth group privacy.

# 3. Reverse ratio bounding via Cauchy's Mean Value Theorem

Fix integers $n \ge 1$ and $k \ge 1$. Our goal is to calculate an upper bound on the *reverse ratio* from [Lemma F1](#15-the-good-set-translation-lemma), which we can write using the [PMF formula from Section 1.4](#14-cdf-and-pmf):

$$\frac{\mathbb{P}(M_{n+k} = l)}{\mathbb{P}(M_n = l)} = \frac{(1 - 2^{-l})^{n+k} - (1 - 2^{1-l})^{n+k}}{(1 - 2^{-l})^n - (1 - 2^{1-l})^n}.$$

We consider two cases:

**Case 1 ($l = 1$):** When $l = 1$, we have $1 - 2^{1-l} = 0$, and $1-2^{-1} = 1/2$ so:

$$\mathbb{P}(M_n = 1) = (1 - 2^{-1})^n = (1/2)^n, \qquad \mathbb{P}(M_{n+k} = 1) = (1/2)^{n+k}.$$

The ratio evaluates directly to:

$$\frac{\mathbb{P}(M_{n+k} = 1)}{\mathbb{P}(M_n = 1)} = \frac{(1/2)^{n+k}}{(1/2)^n} = \left(\frac{1}{2}\right)^k \le \frac{1}{2} < 1 < 1 + \frac{k}{n}.$$

This intuitively makes sense as adding more requests makes it less likely that the maximum stays stuck at $l = 1$.

**Case 2 ($l \ge 2$):** We're going to use Cauchy's Mean Value Theorem to calculate the upper bound.

**Theorem 3.1 (Cauchy's Mean Value Theorem).** If two functions $f$ and $g$ are continuous on $[a, b]$ and differentiable on $(a, b)$, and $g'(x) \ne 0$ for all $x \in (a, b)$, there exists some point $\xi \in (a, b)$ such that:

$$\frac{f(b) - f(a)}{g(b) - g(a)} = \frac{f'(\xi)}{g'(\xi)}.$$

Define the functions $f(x) = x^{n+k}$ and $g(x) = x^n$ on the interval $[a, b]$, where:

$$a = 1 - 2^{1-l}, \qquad b = 1 - 2^{-l}.$$

Notice that (by the [PMF formula in Section 1.4](#14-cdf-and-pmf)):

$$f(b) - f(a) = (1 - 2^{-l})^{n+k} - (1 - 2^{1-l})^{n+k} = \mathbb{P}(M_{n+k} = l),$$

$$g(b) - g(a) = (1 - 2^{-l})^n - (1 - 2^{1-l})^n = \mathbb{P}(M_n = l).$$

Now take their derivatives:

$$f'(x) = (n+k)x^{n+k-1}, \qquad g'(x) = n x^{n-1}.$$

Check the condition $g'(x) \neq 0$ on $(a, b)$: since $l \geq 2$, the left endpoint satisfies $a = 1-2^{1-l} \geq 1-2^{-1} = 1/2 > 0$. Thus every $x\in(a, b)$ is strictly positive, so $g'(x) > 0$ throughout $(a, b)$.

By [Cauchy's Mean Value Theorem (Theorem 3.1)](#3-reverse-ratio-bounding-via-cauchys-mean-value-theorem), there exists $\xi \in (a, b)$ such that:

$$\frac{\mathbb{P}(M_{n+k} = l)}{\mathbb{P}(M_n = l)} = \frac{f'(\xi)}{g'(\xi)} = \frac{(n+k)\xi^{n+k-1}}{n \xi^{n-1}} = \left(\frac{n+k}{n}\right) \frac{\xi^{n+k-1}}{\xi^{n-1}} = \left(1 + \frac{k}{n}\right) \xi^k.$$

$\xi$ lives within $(a, b)$:

$$\xi \in (a, b) = (1 - 2^{1-l}, 1 - 2^{-l}).$$

Because $l \ge 1$, $2^{-l} > 0$, so:

$$b = 1 - 2^{-l} < 1 \implies \xi < 1.$$

Since $0 < \xi < 1$ and $k \ge 1$:

$$0 < \xi^k < 1.$$

Multiplying by $\left(1 + \frac{k}{n}\right)$:

$$\frac{\mathbb{P}(M_{n+k} = l)}{\mathbb{P}(M_n = l)} = \left(1 + \frac{k}{n}\right) \xi^k < \mathbf{1 + \frac{k}{n}}.$$

This bound holds for every $l\geq 1$ and $k \ge 1$. For any intermediate difference $k'\in \{0, 1, \dots, k\}$:

- If $k'=0$, the ratio is $\frac{\mathbb{P}(M_{n} = l)}{\mathbb{P}(M_n = l)} = 1 = 1 + \frac{0}{n} < 1 + \frac{k}{n}$.
- If $k'\geq 1$, replacing $k$ by $k'$ in our bound gives $\frac{\mathbb{P}(M_{n+k'} = l)}{\mathbb{P}(M_n = l)} < 1 + \frac{k'}{n} \le 1 + \frac{k}{n}$.

**Lemma 3.2 (Reverse Ratio Bound).** For all $n \ge 1$, $k \ge 1$, $0 \le k' \le k$, and $l \ge 1$:

$$\frac{\mathbb{P}(M_{n+k'} = l)}{\mathbb{P}(M_n = l)} \le 1 + \frac{k'}{n} \le 1 + \frac{k}{n},$$

with $\frac{\mathbb{P}(M_{n+k'} = l)}{\mathbb{P}(M_n = l)} < 1 + \frac{k}{n}$ holding strictly for all $0 \le k' \le k$. $\blacksquare$

# 4. Forward ratio bounding

Now, our goal is to bound the *forward ratio*, with the smaller population in the numerator, using the [PMF formula from Section 1.4](#14-cdf-and-pmf):

$$\frac{\mathbb{P}(M_{n} = l)}{\mathbb{P}(M_{n+k} = l)} = \frac{(1 - 2^{-l})^n - (1 - 2^{1-l})^n}{(1 - 2^{-l})^{n+k} - (1 - 2^{1-l})^{n+k}}.$$

In a sense this direction is more difficult than the [reverse direction (Lemma 3.2)](#3-reverse-ratio-bounding-via-cauchys-mean-value-theorem) because adding requests pushes the maximum upward, making small values of $l$ less likely under $M_{n+k}$ than under $M_n$. At $l = 1$, the ratio is equal to $2^k$, which blows up exponentially in $k$ regardless of $n$.

To satisfy the privacy bound ratio $\leq e^\epsilon$ in [Lemma F1](#15-the-good-set-translation-lemma), a global bound over all $l \ge 1$ would require $\epsilon \ge k\ln 2$; for $\epsilon < k\ln 2$, this violates the $e^\epsilon$ bound and thus we cannot include every positive integer in the good set. Instead, we must pick a cutoff $l_{\epsilon, k}$:

- Bad set: $\{1, 2, \dots, l_{\epsilon, k} - 1\}$ (which is empty when $l_{\epsilon, k} = 1$, i.e., $\epsilon \ge k\ln 2$): small outcomes where the ratio is too large and we absorb the total probability into the failure probability $\delta$.
- Good set $S = \{l_{\epsilon, k}, l_{\epsilon, k} + 1, \dots\}$: large outcomes where the ratio stays below $e^\epsilon$.

## 4.1 Step 1: Single-increment bound

Let's start with looking at the ratio across a single increment step:

$$\frac{\mathbb{P}(M_n = l)}{\mathbb{P}(M_{n+1} = l)} = \frac{(1 - 2^{-l})^n - (1 - 2^{1-l})^n}{(1 - 2^{-l})^{n+1} - (1 - 2^{1-l})^{n+1}}.$$

Let $b = 1 - 2^{-l}$ and $a = 1 - 2^{1-l}$. Notice the algebraic identity:

$$b^{n+1} - a^{n+1} = b(b^n - a^n) + a^n(b - a).$$

Notice that:

- For $l = 1$, $a = 1 - 2^0 = 0$, so $a^n(b - a) = 0$, giving exact equality: $b^{n+1} - a^{n+1} = b(b^n - a^n)$.
- For $l \ge 2$, $a = 1 - 2^{1-l} > 0$ and $b > a$, so $a^n(b - a) > 0$, giving strict inequality: $b^{n+1} - a^{n+1} > b(b^n - a^n)$.

Thus, for all $l \ge 1$:

$$b^{n+1} - a^{n+1} \ge b(b^n - a^n).$$

Substituting back $\mathbb{P}(M_n = l) = b^n - a^n$ and $\mathbb{P}(M_{n+1} = l) = b^{n+1} - a^{n+1}$ ([Section 1.4](#14-cdf-and-pmf)):

$$\mathbb{P}(M_{n+1} = l) \geq (1 - 2^{-l}) \mathbb{P}(M_n = l) \implies \frac{\mathbb{P}(M_n = l)}{\mathbb{P}(M_{n+1} = l)} \leq \frac{1}{1 - 2^{-l}}.$$

Because this bound does not depend on the population size (only on the level $l$), we can telescope it across $k'$ single increments from $n$ to $n+k'$ (taking the empty product to equal $1$ when $k' = 0$):

$$\frac{\mathbb{P}(M_n = l)}{\mathbb{P}(M_{n+k'} = l)} = \prod_{j=0}^{k'-1} \frac{\mathbb{P}(M_{n+j} = l)}{\mathbb{P}(M_{n+j+1} = l)} \leq \left(\frac{1}{1 - 2^{-l}}\right)^{k'}.$$

Since $1-2^{-l} < 1$, the base $\frac{1}{1-2^{-l}}$ is strictly greater than $1$. Therefore, for every $0 \leq k' \leq k$:

$$\frac{\mathbb{P}(M_n = l)}{\mathbb{P}(M_{n+k'} = l)} \leq \left(\frac{1}{1 - 2^{-l}}\right)^{k'} \leq \left(\frac{1}{1 - 2^{-l}}\right)^{k}.$$

## 4.2 Step 2: Solving for the Good Set Cutoff $l_{\epsilon, k}$

We want this forward ratio from [Section 4.1](#41-step-1-single-increment-bound) to be bounded by $e^\epsilon$ to satisfy Condition 1 of [Lemma F1](#15-the-good-set-translation-lemma):

$$\left(\frac{1}{1 - 2^{-l}}\right)^k \le e^\epsilon.$$

Take the $k$-th root on both sides:

$$\frac{1}{1 - 2^{-l}} \le e^{\epsilon/k} \iff 1 - 2^{-l} \ge e^{-\epsilon/k} \iff 2^{-l} \le 1 - e^{-\epsilon/k} = \frac{e^{\epsilon/k} - 1}{e^{\epsilon/k}}.$$

Invert both sides (reversing the inequality):

$$2^l \ge \frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1}.$$

Take $\log_2$ on both sides:

$$l \ge \log_2\left(\frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1}\right).$$

Since $l$ must be an integer, define the threshold:

$$l_{\epsilon, k} := \left\lceil \log_2\left(\frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1}\right) \right\rceil.$$

For any level $l \ge l_{\epsilon, k}$, the forward ratio is bounded by $e^\epsilon$. This defines our **good set**:

$$S := [l_{\epsilon, k}, \infty)\cap\mathbb{N}_{\geq 1}.$$

Note that for any $\epsilon > 0$ and $k \geq 1$, $e^{\epsilon/k} > 1$, so the fraction $\frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1}$ is strictly greater than $1$. Therefore, its logarithm is strictly positive, which guarantees $l_{\epsilon,k} \geq 1$.

**Lemma 4.1 (Forward Ratio Bound on the Good Set).** On the semi-infinite good set $S := [l_{\epsilon, k}, \infty)\cap\mathbb{N}_{\geq 1}$, every level $l \in S$ satisfies $\frac{\mathbb{P}(M_n = l)}{\mathbb{P}(M_{n+k'} = l)} \le e^\epsilon$ for all $0 \le k' \le k$. $\blacksquare$

# 5. Bounding the Bad-Set Probability

So far we showed in [Lemma 4.1 (Section 4.2)](#42-step-2-solving-for-the-good-set-cutoff-l_epsilon-k) that for the forward ordered pair $(n, n+k')$, Condition 1 of [Lemma F1](#15-the-good-set-translation-lemma) holds on the good set $S := [l_{\epsilon, k}, \infty)\cap\mathbb{N}_{\geq 1}$.

Next, for $\delta \in (0, 1)$, we need to show Condition 2 of [Lemma F1](#15-the-good-set-translation-lemma), which bounds the probability that the numerator distribution $M_n$ lands outside of $S$ by at most $\delta$, i.e. $\mathbb{P}(M_n \notin S) \le \delta$.

The good set $S$ is semi-infinite. Its only exterior mass is the lower tail:

$$\mathbb{P}(M_n \notin S) = \mathbb{P}(M_n < l_{\epsilon, k}) = \mathbb{P}(M_n \le l_{\epsilon, k} - 1).$$

From our [CDF formula (Section 1.4)](#14-cdf-and-pmf) (which evaluates to $0$ when $l_{\epsilon, k} = 1$):

$$\mathbb{P}(M_n \le l_{\epsilon, k} - 1) = \left(1 - 2^{-(l_{\epsilon, k}-1)}\right)^n = \left(1 - 2^{1-l_{\epsilon, k}}\right)^n < \left(1 - 2^{-l_{\epsilon, k}}\right)^n.$$

To ensure this failure probability is at most $\delta$, it suffices to bound the right-hand side by $\delta$:

$$\left(1 - 2^{-l_{\epsilon, k}}\right)^n \le \delta.$$

Take the natural logarithm of both sides:

$$\ln\left(\left(1 - 2^{-l_{\epsilon, k}}\right)^n\right) \le \ln\delta \iff n \ln\left(1 - 2^{-l_{\epsilon, k}}\right) \le -\ln\left(\frac{1}{\delta}\right).$$

Multiply by $-1$ (which reverses the inequality):

$$n \left(-\ln\left(1 - 2^{-l_{\epsilon, k}}\right)\right) \ge \ln\left(\frac{1}{\delta}\right) \iff n \ln\left(\frac{1}{1 - 2^{-l_{\epsilon, k}}}\right) \ge \ln\left(\frac{1}{\delta}\right).$$

Divide by the logarithm term to isolate $n$:

$$n \ge \frac{\ln(1/\delta)}{\ln\left(\frac{1}{1 - 2^{-l_{\epsilon, k}}}\right)}.$$

This **population condition** is sufficient to guarantee that the probability of falling in the bad set is strictly less than $\delta$.

**Lemma 5.1 (Bad-Set Probability Bound).** For any $\delta \in (0, 1)$, whenever $n$ satisfies the population condition above, $\mathbb{P}(M_n \notin S) < \delta$. $\blacksquare$

# 6. Reverse Ratio Verification

For the reverse ordered pair $(n + k', n)$, we proved in [Lemma 3.2 (Section 3)](#3-reverse-ratio-bounding-via-cauchys-mean-value-theorem) that $\frac{\mathbb{P}(M_{n+k'} = l)}{\mathbb{P}(M_n = l)} \leq 1+\frac{k}{n}$ for all $l \geq 1$.

Suppose that $n$ is large enough that $1 + \frac{k}{n} \leq e^\epsilon$. Then Condition 1 of [Lemma F1](#15-the-good-set-translation-lemma) holds on the entire support $S_{n+k', n} = \mathbb{N}_{\ge 1}$ (so $\mathbb{P}(M_{n+k'} \notin S_{n+k', n}) = 0 \le \delta$). We actually do not need to impose a separate lower bound on $n$, as shown in the following lemma.

**Lemma 6.1 (Reverse Ratio Verification).** If $\delta \in (0, 1/e]$ (where $1/e \approx 0.368$), then the [**population condition** (Lemma 5.1)](#5-bounding-the-bad-set-probability) automatically forces $1 + k/n \le e^\epsilon$.

*Proof*:
By the definition of $l_{\epsilon, k}$ in [Section 4.2](#42-step-2-solving-for-the-good-set-cutoff-l_epsilon-k):

$$l_{\epsilon, k} = \left\lceil \log_2\left(\frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1}\right) \right\rceil \ge \log_2\left(\frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1}\right).$$

Exponentiate base 2 and invert both sides:

$$2^{l_{\epsilon, k}} \ge \frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1} \implies 2^{-l_{\epsilon, k}} \le \frac{e^{\epsilon/k} - 1}{e^{\epsilon/k}} = 1 - e^{-\epsilon/k}.$$

Subtract both sides from 1:

$$1 - 2^{-l_{\epsilon, k}} \ge e^{-\epsilon/k}.$$

Invert both sides:

$$\frac{1}{1 - 2^{-l_{\epsilon, k}}} \le e^{\epsilon/k}.$$

Take the natural logarithm:

$$\ln\left(\frac{1}{1 - 2^{-l_{\epsilon, k}}}\right) \le \ln\left(e^{\epsilon/k}\right) = \frac{\epsilon}{k}.$$

Next, apply the hypothesis $\delta \in (0, 1/e]$:

$$0 < \delta \le \frac{1}{e} \implies \frac{1}{\delta} \ge e \implies \ln\left(\frac{1}{\delta}\right) \ge \ln(e) = 1 > 0.$$

Because $\ln(1/\delta) > 0$, substituting our logarithm bound into the [population condition (Lemma 5.1)](#5-bounding-the-bad-set-probability) yields:

$$n \ge \frac{\ln(1/\delta)}{\ln\left(\frac{1}{1 - 2^{-l_{\epsilon, k}}}\right)} \ge \frac{\ln(1/\delta)}{\epsilon/k} = \frac{k}{\epsilon} \ln\left(\frac{1}{\delta}\right).$$

Rearranging this inequality to isolate $k/n$ and using $\ln(1/\delta) \ge 1$ gives:

$$\frac{k}{n} \le \frac{\epsilon}{\ln(1/\delta)} \le \frac{\epsilon}{1} = \epsilon.$$

Finally, recall the fundamental calculus inequality $1 + x \le e^x$ for all real $x$. Using $\frac{k}{n} \le \epsilon$ and setting $x = \epsilon$:

$$1 + \frac{k}{n} \le 1 + \epsilon \le e^\epsilon.$$

$\blacksquare$

# 7. Main Theorem and Asymptotics

Combining [Lemma F1](#15-the-good-set-translation-lemma) across all forward ordered pairs $(n, n+k')$ (via [Lemma 4.1](#42-step-2-solving-for-the-good-set-cutoff-l_epsilon-k) and [Lemma 5.1](#5-bounding-the-bad-set-probability)) and all reverse ordered pairs $(n+k', n)$ (via [Lemma 3.2](#3-reverse-ratio-bounding-via-cauchys-mean-value-theorem) and [Lemma 6.1](#6-reverse-ratio-verification)) for $0 \le k' \le k$ yields the main theorem:

**Theorem 7.1 (Group privacy for MaxGeo).** Fix integer $k \geq 1$, privacy budget $\epsilon > 0$, and failure probability $\delta \in (0, 1/e]$. Define:

$$l_{\epsilon, k} := \left\lceil \log_2\left(\frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1}\right) \right\rceil,$$

$$N_{\epsilon,k,\delta} := \frac{\ln(1/\delta)}{\ln\left(\frac{1}{1 - 2^{-l_{\epsilon, k}}}\right)}.$$

The [MaxGeo counter](#11-maxgeo-counter) satisfies [$(\epsilon, \delta)$-$k$-DP (Definition 1.3)](#13-epsilon-delta-k-differential-privacy-group-privacy) on populations of size at least $N_{\epsilon,k,\delta}$ (i.e., for all datasets $x, y$ with $\lVert x - y\rVert_1 \le k$ and $\min(\lVert x\rVert_1, \lVert y\rVert_1) \ge N_{\epsilon,k,\delta}$). $\blacksquare$

## 7.1 $N_{\epsilon,k,\delta}$ asymptotics

Because $l_{\epsilon, k}$ is wrapped inside a ceiling function and nested inside $N_{\epsilon,k,\delta}$ in [Theorem 7.1](#7-main-theorem-and-asymptotics), the asymptotic behavior of $N_{\epsilon,k,\delta}$ is not immediately obvious.

Let's introduce the following shorthand variables: $u := \frac{\epsilon}{k} > 0$, $q := 2^{-l_{\epsilon, k}}\in(0, \frac{1}{2}]$, $D:=\ln\left(\frac{1}{1-q}\right)$, so that $N_{\epsilon,k,\delta} = \frac{\ln(1/\delta)}{D}$.

### Step 1: Bounding $q$

Let $A := \log_2\left(\frac{e^u}{e^u-1}\right)$, so that $l_{\epsilon,k} = \left\lceil A \right\rceil \geq 1$ ([Section 4.2](#42-step-2-solving-for-the-good-set-cutoff-l_epsilon-k)).
Notice that:

$$2^{-A} = \frac{e^u-1}{e^u} = 1-e^{-u}.$$

Every ceiling satisfies the ceiling inequality: $A \leq \left\lceil A \right\rceil < A + 1$. Also, since the $z\to 2^{-z}$ function is strictly decreasing, applying it flips the inequalities: $2^{-(A+1)} < 2^{-l_{\epsilon,k}} \leq 2^{-A}$ and we obtain:

$$\frac{1}{2}(1 - e^{-u}) < q \leq 1-e^{-u}.$$

Also, since $l_{\epsilon,k} \geq 1$, we always have $q = 2^{-l_{\epsilon,k}}\leq 1/2$, so we can combine the two upper bounds:

$$\frac{1}{2}(1 - e^{-u}) < q \leq \min\left(1-e^{-u}, \frac{1}{2}\right).$$

The takeaway here is that rounding $l_{\epsilon,k}$ up to an integer costs at most a factor of $1/2$ on $q$.

### Step 2: Bounding $D$

As per [Step 1](#step-1-bounding-q), since $q \leq \min\left(1-e^{-u}, \frac{1}{2}\right)$, we have:

$$1-q\geq \max\left(e^{-u}, \frac{1}{2}\right).$$

Invert both sides:

$$\frac{1}{1-q}\leq \min\left(e^{u}, 2\right).$$

Take $\ln$ on both sides, keeping in mind that $\ln$ is an increasing function so it doesn't affect $\min$:

$$\ln\frac{1}{1-q} = D \leq \min\left(u, \ln 2\right).$$

To derive the lower bound we need to recall the elementary logarithm inequality for $z\in[0, 1)$:

$$\ln (1-z) \leq -z.$$

Negate both sides and bring the minus sign under the logarithm:

$$-\ln(1-z) = \ln\frac{1}{1-z} \geq z.$$

Applying this at $z = q$ we can write, using results from [Step 1](#step-1-bounding-q):

$$D = \ln\frac{1}{1-q} \geq q > \frac{1}{2}(1-e^{-u}).$$

Since $e^u>1+u$ for all $u > 0$, taking reciprocals gives $e^{-u} < \frac{1}{1+u}$, so:

$$1-e^{-u} > 1 - \frac{1}{1+u} = \frac{u}{1+u}.$$

Now we can bound $D$ from both sides:

$$\frac{1}{2}\frac{u}{1+u} < D \leq \min(u, \ln 2).$$

### Step 3: Bounding $N_{\epsilon,k,\delta}$

Since $N_{\epsilon,k,\delta} = \frac{\ln(1/\delta)}{D}$, dividing the positive numerator $\ln(1/\delta)$ reverses the inequalities in our bounds for $D$ developed in [Step 2](#step-2-bounding-d).

We can write the lower bound from $D \leq \min(u, \ln 2)$ as:

$$N_{\epsilon,k,\delta} \geq \max\left(\frac{\ln(1/\delta)}{u}, \frac{\ln(1/\delta)}{\ln 2} \right) = \max\left(\frac{k\ln(1/\delta)}{\epsilon}, \frac{\ln(1/\delta)}{\ln 2} \right).$$

Similarly, the upper bound from $D > \frac{1}{2}\frac{u}{1+u}$ gives:

$$N_{\epsilon,k,\delta} < \frac{2(1+u)}{u}\ln\left(\frac{1}{\delta}\right) = 2\left(1 + \frac{\epsilon}{k}\right)\frac{k\ln\frac{1}{\delta}}{\epsilon}.$$

Notice that the two branches of the lower bound cross at $u = \epsilon/k = \ln 2 \approx 0.693$ (for all $u \ge \ln 2$, $l_{\epsilon,k} = 1$, $D = \ln 2$, and $N_{\epsilon,k,\delta} = \frac{\ln(1/\delta)}{\ln 2} = \Theta(\ln(1/\delta))$). In the main regime of interest where $\epsilon \leq k$, we have $u = \epsilon/k \leq 1$ and $2(1+\epsilon/k) \leq 4$, so:

$$\frac{k\ln\frac{1}{\delta}}{\epsilon} \leq N_{\epsilon,k,\delta} < \frac{4k\ln\frac{1}{\delta}}{\epsilon}.$$

Eventually, for $\epsilon \le k$:

$$N_{\epsilon,k,\delta} = \Theta\left(\frac{k\ln\frac{1}{\delta}}{\epsilon}\right).$$

From this two-sided bound, the [population condition $n \geq N_{\epsilon,k,\delta}$ (Lemma 5.1)](#5-bounding-the-bad-set-probability) for $\epsilon \leq k$ is implied by $\frac{k}{n} \le \frac{\epsilon}{4\ln(1/\delta)}$ and requires $\frac{k}{n} \le \frac{\epsilon}{\ln(1/\delta)}$, so the admissible group-to-population ratio scales as:

$$\frac{k}{n} = O\left(\frac{\epsilon}{\ln(1/\delta)}\right).$$

If $\epsilon$ and $\delta$ are fixed constants, we can handle linear-sized groups where $k = O(n)$.
On the other hand, for fixed $\epsilon > 0$, if we demand the failure probability $\delta\to 0$ as $n\to\infty$, then $\frac{\epsilon}{\ln(1/\delta)} \to 0$, meaning that our threshold covers strictly sublinear groups where $k = o(n)$. In [Section 8](#8-a-lower-bound-on-delta) we prove whether it's possible to get $\delta\to 0$ for linear-sized groups where $k = cn$.

---

# 8. A Lower Bound on $\delta$

So far we have proven a sufficiency result ([Theorem 7.1](#7-main-theorem-and-asymptotics)): given $\epsilon, k, \delta$, we showed using [Lemma F1](#15-the-good-set-translation-lemma) that there exists a good set $S$ ([Lemma 4.1](#42-step-2-solving-for-the-good-set-cutoff-l_epsilon-k)) that certifies [$(\epsilon, \delta)$-$k$-DP](#13-epsilon-delta-k-differential-privacy-group-privacy) for large enough $n$.

Now, we want to prove an impossibility result: we want to prove that for linear-sized groups ($k \ge cn$), it's impossible to make $\delta$ vanish as $n\to \infty$. First, we are going to derive the smallest valid $\delta$.

## 8.1 Hockey-stick divergence $H_\epsilon(P||Q)$

Recall the [definition of differential privacy (Definition 1.2)](#12-epsilon-delta-differential-privacy) for an ordered pair of distributions $(P, Q)$ on $\mathbb{N}_{\geq 1}$:

$$P(S) \leq e^{\epsilon}Q(S) + \delta,$$

for all $S \subseteq \mathbb{N}_{\geq 1}$. We can rearrange this inequality and write:

$$\delta \geq P(S) - e^\epsilon Q(S).$$

For $\delta$ to be valid for every event $S$, it must be at least as large as the worst case (supremum) over all subsets $S$, also called the *hockey-stick divergence*.

**Definition 8.1 (Hockey-stick divergence).**

$$H_\epsilon(P||Q) := \sup_{S \subseteq \mathbb{N}_{\geq 1}} (P(S) - e^\epsilon Q(S)).$$

$H_\epsilon(P||Q)$ is the minimum $\delta$ for the ordered pair $(P, Q)$. We therefore have the following equivalence:

$$\left(\forall S \subseteq \mathbb{N}_{\geq 1},\; P(S) \leq e^{\epsilon}Q(S) + \delta\right) \iff \delta \geq H_\epsilon(P||Q).$$

## 8.2 Optimal Failure Probability $\delta^*(n, k, \epsilon)$

Now we can translate [Definition 8.1](#81-hockey-stick-divergence-h_epsilonpq) to [$k$-group privacy (Definition 1.3)](#13-epsilon-delta-k-differential-privacy-group-privacy) at the baseline population $n\geq 1$. Recall that two datasets $x, y$ with $\min(\lVert x\rVert_1, \lVert y\rVert_1)=n$ and $\lVert x-y\rVert_1 \leq k$ induce a pair of distributions $M_n, M_{n+k'}$ for some $0\leq k' \leq k$. Because differential privacy must hold in both directions (i.e. swapping $x$ and $y$) and for every intermediate group difference $0\leq k' \leq k$, a failure probability $\delta$ is valid at population $n$ if and only if it is at least:

$$\delta^*(n, k, \epsilon) := \max_{0\leq k' \leq k} \max\{ H_\epsilon(M_n || M_{n+k'}), H_\epsilon(M_{n+k'} || M_n) \}.$$

Note that technically we could drop the $\max_{0\leq k' \leq k}$ since $M_{n+k'+1} = \max(M_{n+k'}, X_{n+k'+1})$ is a Markov post-processing of $M_{n+k'}$ with a monotone likelihood ratio, so $H_\epsilon(M_n || M_{n+k'})$ and $H_\epsilon(M_{n+k'} || M_n)$ are non-decreasing in $k'$ and maximized at $k'= k$.

The optimal failure probability can be viewed as a maximization problem over $k'$, the direction (forward vs. reverse), and the output event $S \subseteq \mathbb{N}_{\geq 1}$.

Now, our goal is to lower-bound $\delta^*$ and due to maximum and supremum properties, we need to show only one combination of the optimization variables.

We can write (from [Definition 8.1](#81-hockey-stick-divergence-h_epsilonpq)):

$$\delta^*(n, k, \epsilon) \geq H_\epsilon(M_n || M_{n+k}) = \sup_{S \subseteq \mathbb{N}_{\geq 1}}(\mathbb{P}(M_n\in S) - e^{\epsilon}\mathbb{P}(M_{n+k}\in S))\geq \mathbb{P}(M_n\in S) - e^{\epsilon}\mathbb{P}(M_{n+k}\in S)$$

for any $S \subseteq \mathbb{N}_{\geq 1}$ we choose.

## 8.3 The Lower Bound as a 1D function $g(x)$

When we compare a smaller dataset of size $n$ (counter $M_n$) and a larger dataset of size $n+k$ (counter $M_{n+k}$), [differential privacy (Definition 1.3)](#13-epsilon-delta-k-differential-privacy-group-privacy) requires two inequalities: forward and reverse inequalities to hold for every event $S$.

However, the [reverse inequality (Lemma 3.2)](#3-reverse-ratio-bounding-via-cauchys-mean-value-theorem)—for every $l\geq 1$, $\frac{\mathbb{P}(M_{n+k}=l)}{\mathbb{P}(M_n=l)}<1+\frac{k}{n}$—is not useful for proving the lower bound. Suppose $c = k/n$ is a small constant, e.g. $0.1$, meaning that the group size is $10\%$ of the population. Then, $1+c = 1.1 < e^{0.5} \approx 1.65$. This means that $\mathbb{P}(M_{n+k}=l) < e^\epsilon \mathbb{P}(M_n=l)$ for every $l\geq 1$. Consequently, $\mathbb{P}(M_{n+k}\in S) - e^{\epsilon}\mathbb{P}(M_{n}\in S) < 0$ holds for every non-empty $S$.

Let's take a look at the forward direction $(M_n, M_{n+k})$ with populations $n$ and $n+k$, where the group size is at least linear in $n$, i.e., $k \ge cn$ for a constant $c > 0$. Let's pick the lower-tail threshold event $S_l = \{1, 2, \dots, l\} = \{M \le l\}$ for $l \ge 1$.

Let's see how the [CDF from Section 1.4](#14-cdf-and-pmf) behaves on $S_l$:

- Under the smaller dataset of size $n$, let $x_l$ denote the probability of $S_l$: $x_l := \mathbb{P}(M_n \in S_l) = (1 - 2^{-l})^n$.
- Under the larger dataset of size $n + k \ge (1+c)n$, since $1 - 2^{-l} \in (0, 1)$, the probability of $S_l$ satisfies $\mathbb{P}(M_{n+k} \in S_l) = (1 - 2^{-l})^{n+k} \le (1 - 2^{-l})^{(1+c)n} = x_l^{1+c}$ (with equality when $k = cn$).

We can plug this back into our lower bound for $\delta^*(n, k, \epsilon)$ from [Section 8.2](#82-optimal-failure-probability-deltan-k-epsilon):

$$\delta^*(n, k, \epsilon) \geq \mathbb{P}(M_n\in S_l) - e^{\epsilon}\mathbb{P}(M_{n+k}\in S_l) \geq x_l - e^\epsilon x_l^{1+c},$$

which we are going to define as $g(x_l) := x_l - e^\epsilon x_l^{1+c}$. We have defined a one-dimensional function of a single variable $x\in[0, 1]$, so that our lower bound becomes:

$$\delta^*(n, k, \epsilon) \geq g(x_l).$$

To get the strongest possible lower bound on $\delta^*(n, k, \epsilon)$, we want to make $g(x_l)$ as large as possible. Therefore, let's start with finding the maximum of $g(x)$ over $[0, 1]$:

1. First derivative: $g'(x) = 1 - (1+c)e^\epsilon x^c$.
2. Critical point: Setting $g'(x) = 0$ gives $(x^\ast)^c = \frac{1}{(1+c)e^\epsilon}$, so:

$$x^\ast = \left(e^\epsilon(1+c)\right)^{-1/c}.$$

3. Concavity: Since $g''(x) = -c(1+c)e^\epsilon x^{c-1} < 0$ for all $x \in (0, 1]$ and $g$ is continuous on $[0, 1]$, $g(x)$ is strictly concave on $[0, 1]$ and reaches its unique maximum at $x^\ast$.
4. In particular, $g'(x) > 0$ on $[0, x^\ast)$, so $g(x)$ is strictly increasing on $[0, x^\ast]$.

## 8.4 Trapping a Discrete Lattice Point

Notice that $x^\ast = (e^\epsilon(1+c))^{-1/c}$ from [Section 8.3](#83-the-lower-bound-as-a-1d-function-gx) depends only on $\epsilon$ and $c$, not on $n$. If we could pick $x_l$ exactly equal to $x^\ast$, we would immediately obtain the lower bound. However, the values $x_l = (1 - 2^{-l})^n$ lie on a discrete lattice inside $(0, 1)$. We need to guarantee that the grid is fine enough so that at least one point lands near the peak $x^\ast$.

For all integers $l \ge 1$, define the logarithmic exponent:

$$u_l := -\ln(x_l) = -n \ln(1 - 2^{-l}).$$

Notice that $x_l = e^{-u_l}$. Also define the target value corresponding to the peak $x^\ast$:

$$t := -\ln(x^\ast) = \frac{\epsilon + \ln(1+c)}{c}.$$

Then $x_l \le x^\ast \iff u_l \ge t$.

### Step 1: Boundary condition for $n$

As $l \ge 1$ increases, $2^{-l}$ decreases from $1/2$ to $0$, so $u_l$ strictly decreases from $u_1 = -n \ln(1/2) = n \ln 2$ down to $\lim_{l \to \infty} u_l = 0$.

To ensure that the initial point satisfies $u_1 \ge t$ (i.e., $x_1 \le x^\ast$), we require:

$$u_1 = n \ln 2 \ge \frac{\epsilon + \ln(1+c)}{c} \iff n \ge n_0 := \left\lceil \frac{\epsilon + \ln(1+c)}{c \ln 2} \right\rceil.$$

Since $n_0$ is a constant independent of $n$, this holds for all sufficiently large $n$.

### Step 2: Define the crossing index $l_0$

Let $L := \{l \in \mathbb{N}_{\ge 1} : u_l \ge t\}$, which is the set of levels where $u_l$ is still at or above $t$.

1. **$L$ is non-empty**: By [Step 1](#step-1-boundary-condition-for-n), for $n \ge n_0$, $u_1 \ge t$, so $1 \in L$.
2. **$L$ is finite**: Since $\lim_{l \to \infty} u_l = 0 < t$, there exists a level beyond which $u_l < t$.
3. **Unique maximum element**: Every non-empty, finite subset of positive integers has a unique maximum element:

$$l_0 := \max L \in \mathbb{N}_{\ge 1}.$$

By definition of $l_0$:

$$u_{l_0} \ge t \quad \text{and} \quad u_{l_0+1} < t.$$

### Step 3: Taylor Bounds for $-\ln(1-y)$

Next, recall the standard Taylor bounds for $-\ln(1 - y)$ when $0 < y \le 1/2$:

$$y \le -\ln(1 - y) \le \frac{y}{1-y}\le 2y.$$

Setting $y = 2^{-l}$ (which is $\le 1/2$ for all $l \ge 1$):

$$2^{-l} \le -\ln(1 - 2^{-l}) \le 2 \cdot 2^{-l}.$$

Multiply by $n$:

$$n 2^{-l} \le u_l \le 2n 2^{-l}.$$

Now look at the ratio between two consecutive levels $l$ and $l+1$:

$$\frac{u_l}{u_{l+1}} \le \frac{2n 2^{-l}}{n 2^{-(l+1)}} = \frac{2 \cdot 2^{-l}}{2^{-l} \cdot 2^{-1}} = \frac{2}{1/2} = 4.$$

This guarantees that the steps $u_l$ cannot jump by more than a factor of $4$.

### Step 4: Trapping $u_{l_0}$ in $[t, 4t)$

1. From [Step 2](#step-2-define-the-crossing-index-l_0): $u_{l_0} \geq t$ and $u_{l_0+1} < t$.
2. From [Step 3](#step-3-taylor-bounds-for--ln1-y): $u_{l_0} \leq 4u_{l_0+1}$.

Substitute $u_{l_0+1} < t$ into the ratio bound:

$$u_{l_0} \le 4 u_{l_0 + 1} < 4t.$$

Combine the left- and right-hand bounds:

$$t \le u_{l_0} < 4t.$$

Negate and exponentiate (which reverses the inequalities):

$$e^{-4t} < e^{-u_{l_0}} \le e^{-t}.$$

Since $e^{-t} = x^\ast$ and $e^{-u_{l_0}} = x_{l_0}$:

$$(x^\ast)^4 < x_{l_0} \le x^\ast.$$

### Step 5: The Final Closed-Form Bound

To lower-bound $\delta^*(n, k, \epsilon) \ge g(x_{l_0})$ ([Section 8.3](#83-the-lower-bound-as-a-1d-function-gx)), we first establish a chord (a linear function) under-approximating $g(x)$ on $[0, x^\ast]$ using the concavity of $g$ proven in [Section 8.3](#83-the-lower-bound-as-a-1d-function-gx):

1. At the origin, $g(0) = 0$.
2. At the critical point $x^\ast = (e^\epsilon(1+c))^{-1/c}$, the function evaluates to:

$$g(x^\ast) = x^\ast - e^\epsilon (x^\ast)^{1+c} = x^\ast \left(1 - e^\epsilon (x^\ast)^c\right) = x^\ast \left(1 - \frac{1}{1+c}\right) = \frac{c}{1+c} x^\ast.$$

3. Because $g''(x) = -c(1+c)e^\epsilon x^{c-1} < 0$ on $(0, 1)$, $g$ is strictly concave. By concavity, the graph of $g(x)$ on the interval $[0, x^\ast]$ lies everywhere on or above the secant chord connecting the origin $(0, 0)$ to the peak $(x^\ast, g(x^\ast))$:

$$g(x) \ge \frac{g(x^\ast) - g(0)}{x^\ast - 0} x = \frac{\frac{c}{1+c}x^\ast}{x^\ast} x = \frac{c}{1+c} x \quad \text{for all } x \in [0, x^\ast].$$

Since [Step 4](#step-4-trapping-u_l_0-in-t-4t) established that $x_{l_0} \in ((x^\ast)^4, x^\ast]$, we apply this linear lower bound directly at $x = x_{l_0}$:

$$\delta^*(n, k, \epsilon) \ge g(x_{l_0}) \ge \frac{c}{1+c} x_{l_0} > \frac{c}{1+c} (x^\ast)^4.$$

Substituting $x^\ast = \left(e^\epsilon(1+c)\right)^{-1/c}$ into the inequality yields:

$$\delta^*(n, k, \epsilon) > \frac{c}{1+c} \left(e^\epsilon(1+c)\right)^{-4/c} := B(\epsilon, c) = \Omega(1).$$

**Theorem 8.2 (Lower Bound on $\delta$ for Linear Groups).** For any constant $c > 0$, privacy budget $\epsilon > 0$, population $n \ge n_0$, and integer group size $k \ge cn$, the optimal failure probability satisfies $\delta^*(n, k, \epsilon) > B(\epsilon, c) = \Omega(1)$. Because this lower bound is a strictly positive constant independent of $n$, it is impossible to achieve [$(\epsilon, \delta)$-$k$-DP](#13-epsilon-delta-k-differential-privacy-group-privacy) with $\delta = o(1)$ for linear groups $k \ge cn$. $\blacksquare$

# 9. Comparison with Generic Group Privacy

Whenever we analyze [$k$-group privacy (Definition 1.3)](#13-epsilon-delta-k-differential-privacy-group-privacy) for a specific mechanism, we should compare our bespoke bound ([Theorem 7.1](#7-main-theorem-and-asymptotics)) against the universal black-box reduction from [single-neighbor DP (Definition 1.2)](#12-epsilon-delta-differential-privacy) to $k$-group DP introduced by Dwork & Roth.

**Lemma 9.1 (Dwork-Roth).** Suppose $M$ satisfies $(\epsilon_1, \delta_1)$-DP on populations of size at least $N$ (with $\epsilon_1 > 0$). Then for any $k\geq 1$, $M$ satisfies $\left(k\epsilon_1, \delta_1\frac{e^{k\epsilon_1}-1}{e^{\epsilon_1}-1}\right)$-$k$-DP on populations of size at least $N$ (since any $x, y$ with $\lVert x - y\rVert_1 \le k$ and $\min(\lVert x\rVert_1, \lVert y\rVert_1) \ge N$ can be connected by a chain of at most $k$ single-neighbor steps that all remain of size at least $N$). In particular, when $\delta_1 = 0$, pure $(\epsilon_1, 0)$-DP implies $(k\epsilon_1, 0)$-$k$-DP.

First, take a look at the single-neighbor likelihood ratio bounds when $n\geq 1$:

- Forward ratio ($k = 1$): For all $l \geq 1$, we showed in [Section 4.1](#41-step-1-single-increment-bound) that $\frac{\mathbb{P}(M_n=l)}{\mathbb{P}(M_{n+1}=l)} \leq \frac{1}{1-2^{-l}}.$ Because $2^{-l}$ decreases with $l$, the right-hand side is maximized at $l=1$, where it's equal to $2 = e^{\ln 2}$.
- Reverse ratio ($k=1$): For all $l\geq 1$, we showed in [Lemma 3.2 (Section 3)](#3-reverse-ratio-bounding-via-cauchys-mean-value-theorem) that $\frac{\mathbb{P}(M_{n+1}=l)}{\mathbb{P}(M_{n}=l)} \leq 1 + \frac{1}{n}$. For every non-empty dataset, $1 + \frac{1}{n} \leq 1 + 1 = 2 = e^{\ln 2}$.

This means that [MaxGeo](#11-maxgeo-counter) satisfies pure $(\ln 2, 0)$-DP for all non-empty datasets. Applying the Dwork-Roth reduction ([Lemma 9.1](#9-comparison-with-generic-group-privacy)), we immediately observe that MaxGeo satisfies $(k\ln 2, 0)$-$k$-DP. This requires no population growth and has zero failure probability. However, the privacy budget $\epsilon=k\ln 2$ grows linearly with $k$, which quickly becomes meaningless as a privacy guarantee.

Also, because $\frac{\mathbb{P}(M_n=1)}{\mathbb{P}(M_{n+k}=1)} = 2^k = e^{k\ln 2}$ for every $n\geq 1$ ([Section 4](#4-forward-ratio-bounding)), no pure-DP analysis can achieve $\epsilon < k\ln 2$.

## 9.1 Non-Pure Chaining to the Original Result

In [the paper](https://arxiv.org/pdf/2003.11446), MaxGeo for $k=1$ and $\delta_1 \in (0, 1/e]$ is shown to satisfy $(\epsilon_1, \delta_1)$-DP once the population $n$ satisfies $n \ge \frac{\ln (1/\delta_1)}{\ln \left( \frac{1}{1-2^{-l_{\epsilon_1,1}}} \right)} \iff \delta_1(n) := (1-2^{-l_{\epsilon_1,1}})^n \le \delta_1$, where $l_{\epsilon_1,1} = \left\lceil \log_2\left( \frac{e^{\epsilon_1}}{e^{\epsilon_1} - 1} \right)\right\rceil.$

Suppose we want to certify [$(\epsilon, \delta)$-$k$-DP](#13-epsilon-delta-k-differential-privacy-group-privacy) for a group of size $k$ using Dwork-Roth chaining ([Lemma 9.1](#9-comparison-with-generic-group-privacy)). If MaxGeo satisfies $(\epsilon_1, \delta_1)$-DP for single neighbors, then chaining across $k$ steps certifies $\left(k\epsilon_1, \delta_1\frac{e^{k\epsilon_1}-1}{e^{\epsilon_1}-1}\right)$-$k$-DP.

To make this match the desired target $(\epsilon, \delta)$, let's set:

- Privacy budget: $k\epsilon_1 = \epsilon \iff \epsilon_1 = \frac{\epsilon}{k}$.
- Failure probability: $\delta_1\frac{e^{k\epsilon_1}-1}{e^{\epsilon_1}-1} = \delta \iff \delta_1\frac{e^{\epsilon}-1}{e^{\epsilon/k}-1} = \delta \iff \delta_1 = \delta\frac{e^{\epsilon/k}-1}{e^\epsilon - 1}$ (note that for $\delta \in (0, 1/e]$ and $k \ge 1$, $\delta_1 \le \delta \le 1/e$, so the single-step reverse ratio is automatically bounded by [Lemma 6.1](#6-reverse-ratio-verification)).

Now substitute $\epsilon_1 = \frac{\epsilon}{k}$ into $l_{\epsilon_1,1}$:

$$l_{\epsilon_1,1} = \left\lceil \log_2\left( \frac{e^{\epsilon_1}}{e^{\epsilon_1} - 1} \right)\right\rceil = \left\lceil \log_2\left( \frac{e^{\epsilon/k}}{e^{\epsilon/k} - 1} \right)\right\rceil = l_{\epsilon,k}.$$

The single-step cutoff at per-step budget $\epsilon_1=\epsilon/k$ is identical to the $k$-step cutoff level $l_{\epsilon,k}$ from our direct analysis ([Section 4.2](#42-step-2-solving-for-the-good-set-cutoff-l_epsilon-k)). Hence, both thresholds share the same denominator $D$ defined in [Section 7.1](#71-n_epsilonkdelta-asymptotics).

Now let's compare the numerators. The derived direct $k$-step threshold ([Theorem 7.1](#7-main-theorem-and-asymptotics)) is $N_{\epsilon, k, \delta}=\frac{\ln (1/\delta)}{D}.$

To calculate the black-box chained threshold:

$$\delta_1 = \delta\frac{e^{\epsilon/k}-1}{e^\epsilon - 1}.$$

Take the reciprocal:

$$\frac{1}{\delta_1} = \frac{1}{\delta}\frac{e^\epsilon-1}{e^{\epsilon/k}-1}.$$

Apply logarithm:

$$\ln\frac{1}{\delta_1} = \ln\frac{1}{\delta}+\ln\frac{e^\epsilon-1}{e^{\epsilon/k}-1}.$$

Dividing by $D$ gives:

$$N_{\epsilon, k, \delta}^{\text{chain}} = \frac{\ln (1/\delta)}{D} + \frac{1}{D}\ln\frac{e^\epsilon-1}{e^{\epsilon/k}-1} = N_{\epsilon, k, \delta} + \frac{1}{D}\ln\frac{e^\epsilon-1}{e^{\epsilon/k}-1}.$$

We can calculate the exact additive population overhead of the black-box chaining:

$$N_{\epsilon, k, \delta}^{\text{chain}}-N_{\epsilon, k, \delta}=\frac{1}{D}\ln\frac{e^\epsilon-1}{e^{\epsilon/k}-1} > 0$$

for all $k \geq 2$. Dividing by $N_{\epsilon, k, \delta}$ gives the exact multiplicative ratio:

$$\frac{N_{\epsilon, k, \delta}^{\text{chain}}}{N_{\epsilon, k, \delta}} = 1+\frac{\ln\frac{e^\epsilon-1}{e^{\epsilon/k}-1}}{\ln(1/\delta)}.$$

We can estimate the additive savings for fixed $\epsilon > 0$ as $k \ge 2$ grows, so $\epsilon/k \leq 1$:

Using $e^u-1\sim u$ as $u=\epsilon/k\to 0$, the accumulation factor inside the log scales linearly with $k$:

$$\frac{e^\epsilon-1}{e^{\epsilon/k}-1} \sim \frac{e^\epsilon-1}{\epsilon/k} = \frac{e^\epsilon-1}{\epsilon}k=\Theta(k).$$

Hence, for $k \ge 2$, $\ln\frac{e^\epsilon-1}{e^{\epsilon/k}-1} = \Theta(\ln k)$.
On the other hand, the $1/D$ factor is already bounded from our two-sided estimates in [Step 2 of Section 7.1](#step-2-bounding-d): $1/D = \Theta\left(\frac{k}{\epsilon}\right).$

Multiplying these two together, we show that the direct $k$-step analysis saves:

$$N_{\epsilon, k, \delta}^{\text{chain}}-N_{\epsilon, k, \delta} = \Theta\left(\frac{k\ln k}{\epsilon}\right)$$

or multiplicatively:

$$\frac{N_{\epsilon, k, \delta}^{\text{chain}}}{N_{\epsilon, k, \delta}} = 1 + \Theta\left(\frac{\ln k}{\ln (1/\delta)} \right).$$

Viewed at a fixed population $n$ (with $1 + k/n \le e^\epsilon$), because $l_{\epsilon_1,1} = l_{\epsilon,k}$, the direct $k$-step bad-set probability bound is $\delta_{\text{direct}}(n) = (1 - 2^{-l_{\epsilon,k}})^n = e^{-nD} = \delta_1(n)$, whereas approximate chaining multiplies this by the Dwork-Roth accumulation factor:

$$\delta_{\text{chain}}(n) = \delta_1(n)\frac{e^\epsilon - 1}{e^{\epsilon/k} - 1} = \Theta(k)\,\delta_{\text{direct}}(n),$$

eliminating a $\Theta(k)$ blow-up in $\delta$ at any fixed $n$. In the linear regime $k = cn$ (with $1 + c \le e^\epsilon$), [Step 2 of Section 7.1](#step-2-bounding-d) gives $D = \Theta(\epsilon/k) = \Theta(\epsilon/(cn))$, so $nD = \Theta(\epsilon/c)$ and $\delta_{\text{direct}}(n) = e^{-nD} \in (0, 1)$ stays strictly bounded below $1$, whereas $\delta_{\text{chain}}(n) = \Theta(n)\,e^{-nD} \to \infty$ blows up past $1$.

# 10. Summary

Compared to [pure black-box group privacy (Lemma 9.1)](#9-comparison-with-generic-group-privacy), the direct analysis of the [MaxGeo distribution](#11-maxgeo-counter) ([Theorem 7.1](#7-main-theorem-and-asymptotics)) makes small privacy budgets $\epsilon < k\ln 2$ possible. Second, against [approximate black-box chaining (Section 9.1)](#91-non-pure-chaining-to-the-original-result), which treats a $k$-record change as $k$ separate hops, the direct $k$-step proof eliminates the $\Theta(k)$ blow-up at any fixed population $n$, saves $\Theta\left(\frac{k\ln k}{\epsilon}\right)$ users in the [sublinear regime (Section 7.1)](#71-n_epsilonkdelta-asymptotics), and prevents $\delta$ from blowing up past $1$ in the linear regime. Finally, whereas black-box reductions are one-way implications that cannot rule out privacy, the [lattice-trapping lower bound (Theorem 8.2)](#84-trapping-a-discrete-lattice-point) proves $\delta^*(n, k, \epsilon) = \Omega(1)$ whenever $k\geq cn$, establishing the sublinear barrier for group size as an intrinsic limit of the MaxGeo counter.
