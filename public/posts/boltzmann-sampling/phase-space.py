import matplotlib.pyplot as plt
import numpy as np

# Define Energy E
E = 5
v_limit = np.sqrt(2 * E)

# Create velocity values from -sqrt(2E) to +sqrt(2E)
v = np.linspace(-v_limit, v_limit, 500)

# Calculate the upper boundary curve L
L = E - (v**2) / 2

# Initialize plot
plt.figure(figsize=(8, 5))

# Plot the upper boundary line
plt.plot(v, L, color='blue', linewidth=2, label=r'$L = E - \frac{v^2}{2}$')

# Fill the phase-space region between L=0 and the parabola
plt.fill_between(v, 0, L, color='skyblue', alpha=0.5,
                 label='Region Energy $\leq E$')

# Draw axes through origin
plt.axhline(0, color='black', linewidth=1)
plt.axvline(0, color='black', linewidth=1)

# Set symbolic ticks for the boundaries and peak
plt.xticks([-v_limit, 0, v_limit], [r'$-\sqrt{2E}$', '0', r'$+\sqrt{2E}$'])
plt.yticks([0, E], ['0', r'$E$'])

# Labels and Title
plt.xlabel('Velocity ($v$)')
plt.ylabel('Angular Momentum ($L$)')
plt.title(f'Phase-Space Region (for $E = {E}$)')
plt.legend()
plt.grid(True, linestyle='--', alpha=0.6)

plt.tight_layout()
plt.show()
