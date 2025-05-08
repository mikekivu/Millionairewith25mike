import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';

interface TreeNode {
  id: number;
  name: string;
  level: number;
  children?: TreeNode[];
  img?: string;
  isActive?: boolean;
}

interface GenealogyTreeProps {
  data: TreeNode;
  width?: number;
  height?: number;
}

export function GenealogyTree({ data, width = 1200, height = 600 }: GenealogyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;
    
    console.log("Rendering genealogy tree with data:", data);
    
    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 40, right: 120, bottom: 20, left: 120 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Check if there are any children in the tree
      const hasChildren = data.children && data.children.length > 0;
      console.log(`Root node has children: ${hasChildren ? 'Yes' : 'No'}`);
      
      // Create a tree layout (horizontal orientation - root at top)
      const treeLayout = d3.tree<TreeNode>()
        .size([innerWidth, innerHeight])
        .nodeSize([120, 100]); // Increase spacing between nodes

      // Convert the flat data to a hierarchy
      const root = d3.hierarchy(data);
      
      console.log(`Tree hierarchy created with ${root.descendants().length} total nodes`);

      // Assign the data to the tree layout
      const treeData = treeLayout(root);

      // Create a group for the tree and center it
      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add links between nodes with straight lines and right angles
      g.selectAll(".link")
        .data(treeData.links())
        .join("path")
        .attr("class", "link")
        .attr("d", d => {
          // Draw right-angled lines
          const sourceX = d.source.x;
          const sourceY = d.source.y;
          const targetX = d.target.x;
          const targetY = d.target.y;
          
          // Create a path with a right angle
          return `
            M${sourceX},${sourceY}
            V${(sourceY + targetY) / 2}
            H${targetX}
            V${targetY}
          `;
        })
        .attr("fill", "none")
        .attr("stroke", "#3b82f6") // Blue color for lines
        .attr("stroke-width", 1.5);

      // Create node groups
      const node = g.selectAll(".node")
        .data(treeData.descendants())
        .join("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

      // Add $25 branding icon at top left
      svg.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .attr("font-size", "1.8em")
        .attr("font-weight", "bold")
        .attr("fill", "#f97316")
        .attr("transform", "rotate(-15, 20, 30)")
        .text("$25");

      // Add circles for user avatars with orange border
      node.append("circle")
        .attr("r", 24)
        .attr("fill", "white")
        .attr("stroke", d => {
          if (d.data.id === data.id) {
            return "#f97316"; // Orange for root user
          } else if (d.data.isActive) {
            return "#f97316"; // Orange for active users
          }
          return "#6b7280"; // Gray for inactive users
        })
        .attr("stroke-width", 2);

      // Add user icon inside circle
      node.append("text")
        .attr("dy", ".35em")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("fill", d => {
          if (d.data.id === data.id) {
            return "#f97316"; // Orange for root user
          } else if (d.data.isActive) {
            return "#f97316"; // Orange for active users
          }
          return "#6b7280"; // Gray for inactive users
        })
        .attr("font-size", "16px")
        .html('&#128100;'); // Person emoji/icon

      // Add node name labels below the node
      node.append("text")
        .attr("dy", "2.5em")
        .attr("x", 0)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "0.9em")
        .attr("font-weight", "500")
        .attr("fill", "#374151") // Dark gray for text
        .text(d => {
          const name = d.data.name || "";
          return name.length > 18 ? name.substring(0, 16) + '...' : name;
        });
      
      console.log("Genealogy tree rendering complete");
    } catch (error) {
      console.error("Error rendering genealogy tree:", error);
    }
  }, [data, width, height]);

  if (!data) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-[400px]">
          <p className="text-muted-foreground">No referral data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 overflow-auto">
        <svg ref={svgRef} width={width} height={height}></svg>
      </CardContent>
    </Card>
  );
}
