import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

export interface ReferralNode {
  id: number;
  name: string;
  level: number;
  performance: number; // 0-100 value
  isActive: boolean;
  children: ReferralNode[];
}

interface HeatmapVisualizerProps {
  data: ReferralNode;
  width?: number;
  height?: number;
  className?: string;
  colorScale?: "brand" | "traditional"; // "brand" = orange/red, "traditional" = green/yellow/orange/red
}

export default function HeatmapVisualizer({
  data,
  width = 900,
  height = 600,
  className,
  colorScale = "brand"
}: HeatmapVisualizerProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Performance to color mapping function based on selected color scale
  const getColor = (performance: number): string => {
    if (colorScale === "brand") {
      // Brand colors (orange/red theme)
      if (performance < 25) {
        return '#b91c1c'; // Deeper red for poor performance
      } else if (performance < 50) {
        return '#dc2626'; // Red for below average
      } else if (performance < 75) {
        return '#ef4444'; // Lighter red for average
      } else {
        return '#f97316'; // Orange for good performance - our primary brand color
      }
    } else {
      // Traditional colors (green/yellow/orange/red)
      if (performance < 25) {
        return '#ef4444'; // Red for poor performance
      } else if (performance < 50) {
        return '#f97316'; // Orange for below average
      } else if (performance < 75) {
        return '#eab308'; // Yellow for average
      } else {
        return '#22c55e'; // Green for good performance
      }
    }
  };

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create a hierarchical layout
    const root = d3.hierarchy(data);
    
    // Count total nodes to determine spacing
    const totalNodes = root.descendants().length;
    
    // Create tree layout
    const treeLayout = d3.tree()
      .size([innerWidth, innerHeight])
      .separation((a, d) => (a.parent === d.parent ? 2 : 3));
    
    treeLayout(root);

    // Create the main g element
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add links between nodes
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d => {
        return `M${d.source.x},${d.source.y}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y}`;
      })
      .attr("fill", "none")
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7);

    // Create a group for each node
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add the heat map node rectangles with performance-based colors
    node.append("rect")
      .attr("width", 120)
      .attr("height", 80)
      .attr("x", -60)
      .attr("y", -40)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", d => {
        const performance = d.data.performance || 0;
        return getColor(performance);
      })
      .attr("stroke", d => d.data.isActive ? "#ea580c" : "#64748b") // Orange-600 for active nodes
      .attr("stroke-width", 2)
      .attr("opacity", d => d.data.isActive ? 1 : 0.7);

    // Add a gradient overlay to make it look more like a heat map
    node.append("rect")
      .attr("width", 120)
      .attr("height", 80)
      .attr("x", -60)
      .attr("y", -40)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "url(#heatmap-gradient)")
      .attr("opacity", 0.2);

    // Add the node labels (name)
    node.append("text")
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("font-size", "12px")
      .attr("text-shadow", "0 1px 3px rgba(0,0,0,0.3)")
      .text(d => d.data.name);

    // Add level indicator
    node.append("text")
      .attr("dy", 10)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "medium")
      .attr("text-shadow", "0 1px 2px rgba(0,0,0,0.3)")
      .text(d => `Level: ${d.data.level}`);

    // Add performance score
    node.append("text")
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("text-shadow", "0 1px 3px rgba(0,0,0,0.5)")
      .text(d => `${d.data.performance || 0}%`);

    // Add status indicator
    node.append("text")
      .attr("dy", -30)
      .attr("x", 45)
      .attr("text-anchor", "end")
      .attr("fill", "white")
      .attr("font-size", "9px")
      .attr("font-weight", "medium")
      .attr("text-shadow", "0 1px 2px rgba(0,0,0,0.3)")
      .text(d => d.data.isActive ? "Active" : "Inactive");

    // Add a linear gradient for the heatmap effect
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "heatmap-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 0.3);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 0);

    // Add a legend
    // Add $25 branding in top left corner like in the genealogy tree
    svg.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("font-size", "1.5em")
      .attr("font-weight", "bold")
      .attr("fill", "#f97316")
      .attr("transform", "rotate(-15, 20, 30)")
      .text("$25");
      
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 180}, ${height - 120})`);

    const legendTitle = legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Performance Legend");

    // Legend items based on selected color scale
    const legendItems = colorScale === "brand" 
      ? [
          { label: "Excellent (75-100%)", color: "#f97316" }, // Orange
          { label: "Good (50-74%)", color: "#ef4444" }, // Light red
          { label: "Fair (25-49%)", color: "#dc2626" }, // Red
          { label: "Poor (0-24%)", color: "#b91c1c" } // Deep red
        ]
      : [
          { label: "Excellent (75-100%)", color: "#22c55e" }, // Green
          { label: "Good (50-74%)", color: "#eab308" }, // Yellow
          { label: "Fair (25-49%)", color: "#f97316" }, // Orange
          { label: "Poor (0-24%)", color: "#ef4444" } // Red
        ];

    legendItems.forEach((item, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 20 + i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color);

      legend.append("text")
        .attr("x", 25)
        .attr("y", 32 + i * 20)
        .attr("font-size", "11px")
        .text(item.label);
    });

  }, [data, width, height, colorScale]);

  return (
    <div className={cn("relative", className)}>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height} 
        className="overflow-visible"
      />
    </div>
  );
}