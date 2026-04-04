import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const typeColors = { article:"#4c6ef5", youtube:"#ef4444", tweet:"#38bdf8", note:"#facc15", webpage:"#22c55e", image:"#a855f7", pdf:"#f97316", default:"#6366f1" };

export default function KnowledgeGraph({ nodes = [], links = [] }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes.length || !svgRef.current) return;
    const el = svgRef.current;
    const width = el.clientWidth || 900;
    const height = el.clientHeight || 600;

    d3.select(el).selectAll("*").remove();

    const svg = d3.select(el).attr("width", width).attr("height", height);
    const g = svg.append("g");

    svg.call(d3.zoom().scaleExtent([0.3, 3]).on("zoom", e => g.attr("transform", e.transform)));

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100).strength(d => d.strength || 0.5))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(30));

    const link = g.append("g").selectAll("line").data(links).join("line")
      .attr("stroke", "rgba(255,255,255,0.08)").attr("stroke-width", d => d.strength > 0.5 ? 2 : 1);

    const node = g.append("g").selectAll("g").data(nodes).join("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("circle").attr("r", 18)
      .attr("fill", d => (typeColors[d.type] || typeColors.default) + "33")
      .attr("stroke", d => typeColors[d.type] || typeColors.default)
      .attr("stroke-width", 2);

    node.append("text").text(d => d.title?.slice(0, 14) + (d.title?.length > 14 ? "…" : ""))
      .attr("text-anchor", "middle").attr("dy", 32)
      .attr("fill", "#94a3b8").attr("font-size", 10).attr("font-family", "DM Sans");

    sim.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [nodes, links]);

  return <svg ref={svgRef} className="w-full h-full" />;
}
