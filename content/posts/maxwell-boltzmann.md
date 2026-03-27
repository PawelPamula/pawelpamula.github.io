---
date: '2026-03-25T21:56:30+09:00'
draft: true
title: "So how does one derive Maxwell's distribution again?"
---

A recent [3blue1brown's video](https://www.youtube.com/watch?v=fsLh-NYhOoU) on the properties of hyperspheres reminded me of a classic problem in statistical mechanics - the distribution of speeds for particles in a gas.

While seemingly unrelated, hyperspheres are very useful for explaining the physical properties of such a system.

{{< animation src="/animations/particles.webm" width=50% >}}

The animation above shows 64 identical particles on a grid, initialized with uniformly sampled velocities, colliding within a rigid box. These collisions are perfectly elastic, meaning that while individual particles exchange momentum and energy, the total kinetic energy of the system remains constant.

In this simulation, we handle two types of events: wall reflections and particle-to-particle collisions.

When a particle hits a wall, it simply mirrors its velocity. However, when two particles collide, they exchange momentum. For two particles with positions \(\vec{x_1}, \vec{x_2}\) and velocities \(\vec{v_1}, \vec{v_2}\), the post-collision velocity \(\vec{v_1^{\prime}}\) (and analogously \(\vec{v_2^{\prime}}\)) is given by the standard elastic collision formula:

$$\vec{v_1^{\prime}} = \vec{v_1} - \frac{\langle \vec{v_1} - \vec{v_2}, \vec{x_1} - \vec{x_2} \rangle}{\|\vec{x_1} - \vec{x_2}\|^2}(\vec{x_1} - \vec{x_2})$$

Each interaction changes the individual velocity components \(v_x\) and \(v_y\) by a small amount \(\Delta v\). Because these changes are essentially random and independent, the Central Limit Theorem takes over, and the components eventually follow gaussian distribution.

However, while the velocity components are normal, the speed \( v = \sqrt{v_x^2 + v_y^2}\) follows a different distribution.

{{< plot name="speed_distribution" alt="Speed distribution of particles in a box." >}}

To find this distribution, we have to look at the geometry of the velocity space. As mentioned before, the total kinetic energy of the system is constant.

$$ E_{kin} = \frac{1}{2}m(\vec{v_1}^2 + \cdots + \vec{v_N}^2) $$

Each velocity has two components, therefore squared velocity is \( \vec{v_i}^2 = v_{x,i}^2 + v_{y,i}^2 \). We can rewrite the sum of all velocities squared as

$$ v_{x,0}^2 + v_{y,0}^2 + \cdots + v_{x,N}^2 + v_{y,N}^2 = \frac{2 E_{kin}}{m} $$

On the left side of the equation we have \(2N\) components. The right side of the equation is constant. Therefore, we can see any set of legal velocities as a **point on a \(2N\)-dimensional hypersphere with radius \(\sqrt\frac{2E_{kin}}{m}\)**.

As mentioned earlier, every velocity component \(v_i\) (let's drop \(x\) and \(y\) indexes and assume we have \(2N\) components) is a normally distributed random variable with variance \( \sigma^2 \).

$$ v_i \sim \mathcal{N}(0, \sigma^2) $$

The variance (let's use \( Var(v_i)\) this time) of a random variable (in our case \( v_i \)) is given as

$$ Var[v_i] = E[v_i^2] - E[v_i]^2 $$

In our simulation, we sampled the initial velocity components from a uniform distribution betwen -1 and 1, so the expected value of each component \( E[v_i] \) is \(0\). That leaves us with \( Var[v_i]\), or in other words \( \sigma^2 \) equal to \( E[v_i^2]\). So variance is equal to the expected value of the velocity component squared. We could sum these expected values.

$$ \sum_{i=1}^{2N} E[v_i^2] = 2N\sigma^2 $$

On the other hand, from the linearity of expectation, the same sum is equal to the aformentioned (constant) radius of the hypersphere.

$$ \sum_{i=1}^{2N} E[v_i^2] = E[\sum_{i=1}^{2N} v_i^2] = E[R^2] = R^2 = \frac{2 E_{kin}}{m} $$

Now we have an explicit variance component \(\sigma^2 = \frac{2E_{kin}}{m2N}\) which lets us write down the probability density function for velocity components. There's also one more step that probably deserves it's own derivation, but for now we're going to take it for granted. Namely, it's the Equipartition Theorem that states that in two dimensional systems (with two independent degree of freedom), the average kinetic energy is equal to \( k_BT \), \( \frac{1}{2}k_BT \) per each degree of freedom (where \(k_B\) is the Boltzmann constant and T is tempreature).

We mentioned earlier that each velocity component is distributed normally \(v_i \sim \mathcal{N}(0, \sigma^2)\), therefore we can write the probability density function in the following way.

$$
\begin{aligned}
\pi(v_i) &= \frac{1}{\sqrt{2\pi}\sigma}exp\left(-\frac{v_i^2}{2\sigma^2}\right) \\\\
&= \sqrt{\frac{m}{2\pi k_B T}}exp\left(-\frac{1}{2}\frac{mv_i^2}{k_BT}\right)
\end{aligned}
$$ 

### From 1D to 2D probability density function.

Now, it takes a little bit of work using tools from statistics and multivariable calculus to arrive at the probability density function of \( \vec{v} \) in two dimensions. However, I think it's worth seeing the derivation step by step just for completeness.

Because the movement in the \(x\)-direction is completely independent of the movement in the \(y\)-direction, the probability of a particle having a specific velocity vector \(\vec{v} = (v_x, v_y)\) is simply the product of their individual probability density functions:

$$P(v_x, v_y) = \pi(v_x) \cdot \pi(v_y)$$

When we multiply these together, the constants multiply and the exponents add:

$$P(v_x, v_y) = \frac{m}{2\pi k_B T}\exp\left(-\frac{m(v_x^2 + v_y^2)}{2k_BT}\right)$$

Now we want to get to a one dimensional probability density function of a particle landing in a tiny mathematical "box" of velocity space. To get there, we multiply the density function by the area of that box \((dv_x, dv_y)\):

$$\text{Probability} = P(v_x, v_y) \, dv_x \, dv_y$$

Next, we convert the Cartesian area element (\(dv_x \, dv_y\)) into a polar area element. In polar coordinates, an area element is defined by a tiny change in radius (\(dv\)) and a tiny change in angle (\(d\theta\)). The size of this area is \(v \, dv \, d\theta\). The \(v\) pops out from the Jacobian  of the coordinate transformation. Substituting the new area element into our probability equation:

$$\text{Probability} = \frac{m}{2\pi k_B T}\exp\left(-\frac{mv^2}{2k_BT}\right) v \, dv \, d\theta$$

Right now, this equation describes the probability of a particle having a specific speed \(v\) and pointing in a specific direction \(\theta\).But we don't care about the direction; we only want the probability distribution of the speed. To get this, we add up the probabilities for all possible directions from \(\theta = 0\) to \(2\pi\). This is called finding the marginal distribution.

$$\pi(v) \, dv = \int_{0}^{2\pi} \frac{m}{2\pi k_B T}\exp\left(-\frac{mv^2}{2k_BT}\right) v \, dv \, d\theta$$

Since nothing inside the integral depends on \(\theta\) (the distribution is isotropic), we can pull everything out except \(d\theta\):

$$
\begin{aligned}
\pi(v) \, dv &= \frac{m}{2\pi k_B T} v \exp\left(-\frac{mv^2}{2k_BT}\right) dv \int_{0}^{2\pi} d\theta \\\\
&= \frac{m}{2\pi k_B T} v \exp\left(-\frac{mv^2}{2k_BT}\right) dv (2\pi) \\\\
&= \frac{mv}{k_BT}exp\left(-\frac{mv^2}{2k_BT}\right) dv
\end{aligned}
$$

Indeed, we can plot the resulting distribution and it matches the simulation data.

{{< plot name="speed_distribution_with_boltzmann" alt="Speed distribution of particles in a box." >}}

### Sampling points on a hypersphere

Earlier we stated that the distribution of velocity component \(v_i\) is distributed normally due to a bunch of independent, random interactions. While it's true, it's a fairly hand-wavy assumption. Let's take a look at it from a different angle. Recall the following equation stating that any set of legal velocities can be viewed as a point on a \(2N\)-dimensional hypersphere with radius \(\sqrt\frac{2E_{kin}}{m}\).

$$ v_{x,0}^2 + v_{y,0}^2 + \cdots + v_{x,N}^2 + v_{y,N}^2 = \frac{2 E_{kin}}{m} $$

We can ask the question, since all configurations should be equally likely, how to sample a point on a hypersphere.



