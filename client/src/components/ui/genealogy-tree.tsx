import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from './card';

interface TreeNode {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  plan?: string;
  level: number;
  children?: TreeNode[];
}

interface GenealogyTreeProps {
  data: TreeNode;
  width?: number;
  height?: number;
}

export function GenealogyTree({ data, width = 800, height = 600 }: GenealogyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Clear any existing tree
    d3.select(svgRef.current).selectAll("*").remove();

    // Create a hierarchical layout
    const root = d3.hierarchy(data);
    
    // Specify the tree layout
    const treeLayout = d3.tree<TreeNode>().size([width - 100, height - 100]);
    
    // Compute the tree layout
    treeLayout(root);

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(50, 50)`);

    // Add links between nodes
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x(d => d.y)  // Swap x and y for horizontal layout
        .y(d => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5);

    // Add nodes
    const nodes = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y}, ${d.x})`);  // Swap x and y for horizontal layout

    // Node circles
    nodes.append("circle")
      .attr("r", 20)
      .attr("fill", d => {
        if (d.data.level === 0) return "#0066CC";  // Primary color for root
        if (d.data.level === 1) return "#00A67E";  // Secondary color for level 1
        return "#FFB100";  // Accent color for deeper levels
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Node text
    nodes.append("text")
      .attr("dy", 3)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .text(d => getInitials(d.data));

    // Node labels
    nodes.append("text")
      .attr("dy", 35)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .text(d => d.data.firstName);

    function getInitials(node: TreeNode): string {
      return `${node.firstName[0]}${node.lastName[0]}`;
    }
  }, [data, width, height]);

  if (!data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No genealogy data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-auto">
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} width={width} height={height}></svg>
      </div>
    </Card>
  );
}
