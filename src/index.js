import * as d3 from "d3";

import Graph from "./graph";
import scatterplot from "./scatterplot";
import State from "./state";

const WIDTH = 900,
  HEIGHT = 800;

function resizeSVG(svg, width, height) {
  svg.attr("width", width).attr("height", height);
}

/**
 * Load data from server and do transformations
 */
async function loadData() {
  const [graph, directory] = await Promise.all([
    d3.json("graph.json"),
    d3.json("directory.json")
  ]);

  // Create a map from ID to directory name
  const idToName = {};

  for (let node of graph.nodes) {
    idToName[node.id] = node.name;
  }

  // Set a 'name' attribute on 'directory' dataset
  for (let d of directory) {
    d.name = idToName[d.id];
  }

  return [graph, directory];
}

function setDropdown(graphData, directoryData, state) {
  // Derive data for the dropdown
  // Compute the IDs of second level nodes
  let secondLevelNodeIds = new Set();
  for (let link of graphData.links) {
    if (link.target.id == 0) {
      secondLevelNodeIds.add(link.source.id);
    }
  }

  let nodeNames = ["All"];
  let idToChildren = {};
  let nameToId = {};

  // Compute second level node names and mapping from node name to its ID
  for (let node of graphData.nodes) {
    if (secondLevelNodeIds.has(node.id)) {
      nodeNames.push(node.name);
      idToChildren[node.id] = [];
      nameToId[node.name] = node.id;
    }
  }

  // Compute a mapping from node ID to its children
  for (let link of graphData.links) {
    if (link.target.id in idToChildren) {
      idToChildren[link.target.id].push(link.source.id);
    }
  }

  // Find the dropdown menu
  const dropdown = d3.select("#dropdown");

  // Add second level directories for dropdown
  dropdown
    .selectAll("option")
    .data(nodeNames)
    .enter()
    .append("option")
    .text(d => d);

  // Set event listener for value change
  dropdown.on("change", function() {
    if (this.value == "All") {
      state.unlock();
      state.clear();
      return;
    }

    const nodeId = nameToId[this.value];
    const children = idToChildren[nodeId];
    state.lock();
    state.set(children, this);
  });
}

function setResetButton(state) {
  d3.select("#reset-selection").on("click", () => {
    state.unlock();
    state.clear();
  });
}

function setForceControl(graph) {
  // Default force parameter
  const force = -3;

  // Select the force control
  const forceControl = d3.select("#force");

  // Setup the initial value and show the value
  forceControl.property("value", force);
  d3.select("#show-force").text(force);

  // Setup event listener for value change
  forceControl.on("change", function() {
    graph.restartSimulation(this.value);
  });
}

async function main() {
  // Load graph data and directory data
  const [graphData, directoryData] = await loadData();

  // Select SVG elements and set size
  const graphSVG = d3.select("#graph");
  const scatterplotSVG = d3.select("#scatterplot");
  resizeSVG(graphSVG, WIDTH, HEIGHT);
  resizeSVG(scatterplotSVG, WIDTH, HEIGHT);

  // Define state object that is consistent across two views
  const state = new State(graphSVG, scatterplotSVG);

  // Plot the graph and scatterplot
  const graph = new Graph(graphSVG, graphData, state);
  graph.draw();
  scatterplot(scatterplotSVG, directoryData, state);

  // Setup interactions
  setResetButton(state);
  setDropdown(graphData, directoryData, state);
  setForceControl(graph);
}

main();
