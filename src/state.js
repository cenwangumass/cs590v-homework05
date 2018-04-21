import * as d3 from "d3";

class State {
  constructor(graph, scatterplot) {
    this.graph = graph;
    this.scatterplot = scatterplot;
    this.state = new Set();
    this.currentElement = null;
    this.locked = false;
  }

  checkElement(element) {
    if (this.currentElement != element) {
      this.state.clear();
    }
    this.currentElement = element;
  }

  clear() {
    this.state.clear();
    this.refresh();
  }

  set(nodeIds, element) {
    this.checkElement(element);
    this.state = new Set(nodeIds);
    this.refresh();
  }

  add(nodeId, element) {
    this.checkElement(element);
    this.state.add(nodeId);
    this.refresh();
  }

  refresh() {
    const opacity = this.state.size == 0 ? 1 : 0.05;

    this.graph
      .selectAll("circle")
      .attr("class", "data-point")
      .attr("opacity", opacity);

    this.graph
      .selectAll("circle")
      .filter(d => this.state.has(d.id))
      .attr("class", "selected");

    this.scatterplot
      .selectAll("circle")
      .attr("class", "data-point")
      .attr("opacity", opacity);

    this.scatterplot
      .selectAll("circle")
      .filter(d => this.state.has(d.id))
      .attr("class", "selected");
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  isLocked() {
    return this.locked;
  }
}

export default State;
