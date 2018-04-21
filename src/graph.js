import * as d3 from "d3";
import * as tip from "d3-tip";

class Graph {
  constructor(svg, data, state) {
    this.svg = svg;
    this.data = data;
    this.state = state;

    // Get size of SVG
    this._width = svg.attr("width");
    this._height = svg.attr("height");

    // Create tooltip
    this._tip = this._setTip();
    this.svg.call(this._tip);

    this._showForce = d3.select("#show-force");
    this._chargeForce = null;
    this._simulation = null;
    this._setSimulation();
  }

  _setTip() {
    // D3 tooltip
    return tip()
      .attr("class", "d3-tip")
      .html(d => {
        return `
          <div>
            <div>${d.name}</div>
          </div>
        `;
      });
  }

  _setSimulation() {
    const chargeForce = d3.forceManyBody().strength(-3);
    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id(function(d) {
          return d.id;
        })
      )
      .force("charge", chargeForce)
      .force("collide", d3.forceCollide().radius(5))
      .force("center", d3.forceCenter(this._width / 2, this._height / 2));

    this._chargeForce = chargeForce;
    this._simulation = simulation;
  }

  draw() {
    const self = this;
    const svg = self.svg;
    const data = self.data;
    const tip = self._tip;
    const state = self.state;
    const simulation = self._simulation;

    // Plot links between nodes
    const links = svg
      .append("g")
      .attr("class", "link")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line");

    // Plot nodes
    const nodes = svg
      .append("g")
      .attr("class", "node")
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("id", d => d.id)
      .attr("r", 5)
      .attr("fill", "red")
      .on("mouseover", function(d) {
        tip.show(d);
        if (!state.isLocked()) {
          state.set([+this.id]);
        }
      })
      .on("mouseout", function(d) {
        tip.hide(d);
        if (!state.isLocked()) {
          state.clear();
        }
      })
      .on("click", function() {
        state.lock();
        state.add(+this.id);
      })
      .call(
        d3
          .drag()
          .on("start", started)
          .on("drag", dragged)
          .on("end", ended)
      );

    function ticked() {
      links
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodes.attr("cx", d => d.x).attr("cy", d => d.y);
    }

    simulation.nodes(data.nodes).on("tick", ticked);
    simulation.force("link").links(data.links);

    function started(d) {
      if (!d3.event.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function ended(d) {
      if (!d3.event.active) {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    }
  }

  restartSimulation(value) {
    this._showForce.text(value);
    this._chargeForce.strength(value);
    this._simulation.alpha(1).restart();
  }
}

export default Graph;
