---
date: '2026-04-07T14:56:51+09:00'
draft: false
title: 'From Maxwell-Boltzmann to Boltzmann distribution'
---

In the [previous post]({{< relref "posts/maxwell-boltzmann/index.md" >}}), we derived the Maxwell-Boltzmann distribution for particle velocities by exploring the geometric properties of hyperspheres. That derivation relied on a critical assumption: that the total energy of the system remains constant.

In this post, we are going to take a look at the distribution of particle energies when the system is allowed to exchange energy with its surroundings and the box volume is permitted to change but the temperature is fixed, also called the _canonical ensemble_. This setup leads directly to the Boltzmann distribution - a foundational concept in statistical mechanics. While typical derivations involve maximizing the entropy, we will take a more elementary path (essentially without introducing entropy), building directly on our previous results to show how the Boltzmann distribution naturally emerges.


### Particles in a box interacting with an external bath

{{< svg src="piston.svg" class="svg-inline" width="75%" >}}

In the figure above, we have a box of particles closed off by a piston. On the left side, we assume there is a large bath of particles behind an elastic plate, which allows for an exchange of energy between the particles in the system and the bath.

If the box was closed off by a fixed wall on the left, the total energy would simply be the sum of the potential energy of the spring and the kinetic energy of the particles. If the piston moved in the negative \(x\) direction, the spring's potential energy would transform into kinetic energy, raising the system's temperature.

However, by allowing particles to exchange energy through a loose elastic plate with an external "bath", we can maintain the system at a constant temperature. The plate moves along the \(x\) direction over a small distance \(\Delta\), responding to hits from particles in both the system and the bath.

Assuming equal masses, elastic head-on collisions exchange velocities. Once hit by a particle, the plate begins vibrating with a velocity \(\pm v_x\). The plate will have its own velocity distribution, which differs from the Maxwell distribution of the particles' \(x\)-velocity component:

$$\begin{aligned}
\pi(v_x)dv_x \varpropto e^{-\beta\frac{v_x^2}{2}}dv_x
\end{aligned}$$

From the perspective of the plate, however, disproportionately more fast particles hit it than slow ones. Fast particles cover more distance in less time and reach the plate more frequently. A single particle traveling with velocity \(v_x\) needs to travel a total distance of \(2L\) to hit the plate, bounce off the piston, and hit the plate again. The time between hits is \(\Delta t = \frac{2L}{|v_x|}\), which results in a collision frequency \(f = \frac{|v_x|}{2L}\).

Because the frequency of hits is directly proportional to the \(x\) component of the velocity, we find the distribution of collision velocities by multiplying the particle density at \(v_x\) by the frequency of these hits. This product dictates how the plate is pushed and defines its resulting velocity distribution:

$$\begin{aligned}
\pi_{collision}(v_x)dv_x \varpropto |v_x|e^{-\beta\frac{v_x^2}{2}}dv_x
\end{aligned}$$

### Getting rid of the bath

We can now eliminate the external bath and the elastic plate with a clever abstraction. Instead of modeling the physical collisions, we can simply resample the horizontal velocity component whenever a particle hits the boundary.

Since this collision distribution is equivalent to the Maxwell distribution for absolute velocity in two dimensions (as shown in the [previous post]({{< relref "posts/maxwell-boltzmann/index.md#from-1d-to-2d-probability-density-function" >}})), we can replace it with two independent Gaussian variables:

$$\Upsilon_1, \Upsilon_2 \sim Gaussian(0, \frac{1}{\sqrt\beta})$$

The \(x\)-velocity component becomes \(v_x = \sqrt{\Upsilon_1^2 + \Upsilon_2^2}\). To implement this in a model, we can start with a uniform random variable \(\Upsilon \sim Uniform(0, 1)\) and substitute \(\Upsilon = e^{-u}\), which gives \(u = -\log\Upsilon\). Setting this equal to \(\beta\frac{v_x^2}{2}\), we arrive at a simple "boundary sampler":

$$v_x = \sqrt{\frac{-2\log\Upsilon}{\beta}}$$

Whenever a particle hits the plate, its outgoing horizontal velocity component is redrawn from this \(\pi_{collision}(v_x)\) distribution.

### Switching to the piston perspective

{{< svg src="piston-launch.svg" class="svg-inline" width="75%" >}}

Now, let's shift our focus to the piston itself. From a microscopic view, the piston interacts with the plate when it reaches the boundary. As we've shown, we can replace the bath and particles with our boundary sampler. The result is that when the piston makes contact at \(L = 0\), it is "relaunched" with an outgoing velocity \(v_0\) drawn from the collision distribution. We can drop the absolute value since the launch always occurs in the positive \(x\) direction:

$$\begin{aligned}
\pi_{launch}(v_0)dv_0 \varpropto v_0e^{-\beta\frac{v_0^2}{2}}dv_0
\end{aligned}$$

Once launched, the piston moves under constant acceleration, pulled back by the spring. If we set the units such that mass and force equal 1, the equations of motion are straightforward:

$$\ddot{x} = -1$$

Integrating with respect to time gives the velocity:

$$\dot{x} = v_0 - t$$

Integrating again, knowing the piston starts at \(x = 0\), gives its position:

$$x = v_0t - \frac{1}{2}t^2$$

How long does it take for the piston to return to the plate? Setting \(x = 0\) yields:

$$0 = v_0t - \frac{1}{2}t^2 = t(v_0 - \frac{1}{2}t)$$

Solving for \(t\) reveals two distinct moments: the launch (\(t = 0\)) and the return (\(t = 2v_0\)). Crucially, the total "flight time" is directly proportional to the launch velocity; the harder we throw the piston, the longer it stays out in the box.

### From launch velocity to time distribution

If we observe this system at a random moment, what is the probability of finding it in a state that originated from a specific launch velocity \(v_0\)? To answer this, we use the ergodic principle: the probability of a state is proportional to the fraction of time the system spends in that state.

Piston launches in the interval \([v_0, v_0 + dv_0]\) occur with a probability proportional to \(\pi_{launch}(v_0)\). However, because each such launch lasts for a duration of \(2v_0\), the system spends more time on high-velocity trajectories. Therefore, the time-averaged probability is:

$$\pi_{time}(v_0)dv_0 \varpropto v_0 \cdot \pi_{launch}(v_0)dv_0 \varpropto v_0^2 e^{-\beta\frac{v_0^2}{2}}dv_0$$

We can rewrite this in terms of the total energy \(E\). At the moment of launch (\(x = 0\)), the energy is simply \(E = \frac{v_0^2}{2}\). Differentiating gives \(dE = v_0dv_0\), allowing us to transform the distribution:

$$\begin{aligned}
\pi_{time}(v_0)dv_0 &\varpropto v_0 \cdot (v_0 e^{-\beta E} dv_0) \\\\
&\varpropto v_0 e^{-\beta E} dE
\end{aligned}$$

### The Boltzmann distribution

Substituting \(v_0 = \sqrt{2E}\) into the expression above, the probability of finding the piston at energy \(E\) becomes:

$$\begin{aligned}
\pi_{time}(E)dE \varpropto \sqrt{E}e^{-\beta E}dE
\end{aligned}$$

We have arrived at the Boltzmann distribution. The \(\sqrt{E}\) term is the density of states—a factor that accounts for how much "room" exists in phase space at a particular energy level.

To visualize this, consider the phase space \((x, v)\). For a fixed energy \(E = x + \frac{v^2}{2}\), there are many combinations of position and velocity that satisfy the equation. The "volume" of states available up to energy \(E\) is the area under the curve in phase space:

{{< svg src="energy_phase_space.svg" class="svg-inline" width="75%">}}

$$\begin{aligned}
V(E) &= \int_{-\sqrt{2E}}^{\sqrt{2E}}\left(E-\frac{v^2}{2} \right)dv \\\\
&= \frac{4\sqrt{2}}{3}E^{\frac{3}{2}}
\end{aligned}$$

The density of states \(N(E)\), i.e. the number of states available specifically in the interval \([E, E+dE]\), is the derivative of this volume:

$$N(E) = \frac{\partial V(E)}{\partial E} \varpropto \sqrt{E}$$

This completes our derivation. The final probability distribution for the energy is the product of the number of available states and the exponential _Boltzmann factor_:

$$\boxed{\pi(E) \varpropto N(E)e^{-\beta E}}$$