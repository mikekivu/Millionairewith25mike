import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { cn } from "@/lib/utils";

interface ReferralNode {
  id: number;
  name: string;
  level: number;
  performance: number; // 0-100 value representing performance (earnings, activity, etc)
  referrals?: ReferralNode[];
}

interface HeatMapVisualizerProps {
  data: ReferralNode;
  className?: string;
  width?: number;
  height?: number;
}

export function HeatMapVisualizer({
  data,
  className,
  width = 900,
  height = 500,
}: HeatMapVisualizerProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Color scale for performance heatmap
    const colorScale = d3.scaleSequential(d3.interpolateOrRd)
      .domain([0, 100]);

    // Convert hierarchical data to format d3 can use
    const rootNode = d3.hierarchy(data);
    
    // Create a tree layout
    const treeLayout = d3.tree<ReferralNode>()
      .size([width - 100, height - 80]);
    
    // Apply the layout to the hierarchy
    const treeData = treeLayout(rootNode);
    
    // Create the SVG canvas
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(50, 40)`);
    
    // Create links (connections between nodes)
    svg.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x))
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", 1.5);
    
    // Create node groups
    const node = svg.selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);
    
    // Add node circles with heatmap coloring
    node.append("circle")
      .attr("r", 25)
      .style("fill", d => colorScale(d.data.performance))
      .style("stroke", "#fff")
      .style("stroke-width", 2);
    
    // Add node initials
    node.append("text")
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(d => {
        const name = d.data.name || "";
        return name.split(" ")
          .filter(part => part.length > 0)
          .map(n => n[0])
          .join("");
      });
    
    // Add node labels
    node.append("text")
      .attr("dy", "3em")
      .attr("text-anchor", "middle")
      .attr("font-size", "0.8em")
      .text(d => {
        const name = d.data.name || "";
        return name.length > 18 ? name.substring(0, 16) + '...' : name;
      });
    
    // Add performance percentage
    node.append("text")
      .attr("dy", "-2em")
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .attr("font-size", "0.9em")
      .attr("font-weight", "bold")
      .text(d => `${Math.round(d.data.performance)}%`);
    
    // Add legends for the heat map
    const legendWidth = 200;
    const legendHeight = 20;
    
    // Create the gradient legend
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${width - legendWidth - 150}, ${height - 50})`);
    
    // Title for the legend
    legendGroup.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("font-size", "12px")
      .text("Performance Scale");
    
    // Create color gradient
    const linearGradient = legendGroup.append("linearGradient")
      .attr("id", "performance-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    // Add color stops to the gradient
    linearGradient.selectAll("stop")
      .data([0, 25, 50, 75, 100])
      .enter()
      .append("stop")
      .attr("offset", d => `${d}%`)
      .attr("stop-color", d => colorScale(d));
    
    // Add rectangle with the gradient
    legendGroup.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#performance-gradient)");
    
    // Add labels for the gradient
    legendGroup.selectAll(".legend-label")
      .data([0, 25, 50, 75, 100])
      .enter()
      .append("text")
      .attr("class", "legend-label")
      .attr("x", d => (d / 100) * legendWidth)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", d => d === 0 ? "start" : d === 100 ? "end" : "middle")
      .attr("font-size", "10px")
      .text(d => `${d}%`);
      
  }, [data, width, height]);

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <svg 
        ref={svgRef} 
        className="heatmap-visualizer"
        style={{ 
          width: "100%", 
          height: "100%",
          minWidth: `${width}px`,
          minHeight: `${height}px` 
        }}
      />
    </div>
  );
}