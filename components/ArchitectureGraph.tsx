'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ArchitectureGraphProps {
  tree: any[];
}

export default function ArchitectureGraph({ tree }: ArchitectureGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!tree || !svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .call(d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
        container.attr("transform", event.transform);
      }));

    const container = svg.append("g");

    // Process tree into a hierarchy for visualization
    // We'll focus on directories and important files as nodes
    const nodes: any[] = [];
    const links: any[] = [];

    const rootNode = { id: "root", name: "/", type: "tree", group: 0 };
    nodes.push(rootNode);

    // Filter to limit complexity for visualization
    // Only show top 2 levels of directories and files in root
    const filteredTree = tree.filter(item => {
      const depth = item.path.split('/').length;
      return depth <= 2;
    });

    filteredTree.forEach(item => {
      const parts = item.path.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');
      const parentId = parentPath === "" ? "root" : parentPath;

      nodes.push({
        id: item.path,
        name,
        type: item.type,
        group: item.type === 'tree' ? 1 : 2
      });

      links.push({
        source: parentId,
        target: item.path
      });
    });

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    const link = container.append("g")
      .attr("stroke", "#27272a")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1);

    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", d => d.type === 'tree' ? 8 : 5)
      .attr("fill", d => d.type === 'tree' ? "#10b981" : "#3b82f6")
      .attr("stroke", "#09090b")
      .attr("stroke-width", 2);

    node.append("text")
      .attr("x", 12)
      .attr("y", 4)
      .text(d => d.name)
      .attr("fill", "#a1a1aa")
      .attr("font-size", "10px")
      .attr("font-family", "var(--font-mono)");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [tree]);

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Directories
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Files
        </div>
      </div>
      <div className="absolute top-4 right-4 text-[10px] text-zinc-500 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-800">
        Drag to move • Scroll to zoom
      </div>
    </div>
  );
}
