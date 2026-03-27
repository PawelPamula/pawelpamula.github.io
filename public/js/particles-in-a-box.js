const width = 600;
const height = 400;
const numParticles = 50;
const particleRadius = 8;

// 2. Create the SVG container
const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// 3. Generate random particle data
const nodes = d3.range(numParticles).map(i => ({
    id: i,
    r: particleRadius + Math.random() * 4, // vary sizes slightly
    x: Math.random() * width,
    y: Math.random() * height,
    // Initial velocity
    vx: (Math.random() - 0.5) * 5,
    vy: (Math.random() - 0.5) * 5,
    color: d3.interpolateTurbo(Math.random())
}));

// 4. Create the visual circles
const circles = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("class", "particle")
    .attr("r", d => d.r)
    .attr("fill", d => d.color);

// 5. Define the simulation
const simulation = d3.forceSimulation(nodes)
    .alphaTarget(0.3) // Keep the simulation active
    .velocityDecay(0)  // No friction (ideal gas style)
    .force("collide", d3.forceCollide().radius(d => d.r + 1).iterations(2))
    .on("tick", ticked);

function ticked() {
    nodes.forEach(node => {
        // Boundary detection: Bounce off horizontal walls
        if (node.x <= node.r) {
            node.x = node.r;
            node.vx = Math.abs(node.vx);
        } else if (node.x >= width - node.r) {
            node.x = width - node.r;
            node.vx = -Math.abs(node.vx);
        }

        // Boundary detection: Bounce off vertical walls
        if (node.y <= node.r) {
            node.y = node.r;
            node.vy = Math.abs(node.vy);
        } else if (node.y >= height - node.r) {
            node.y = height - node.r;
            node.vy = -Math.abs(node.vy);
        }
    });

    // Update circle positions in the DOM
    circles
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}