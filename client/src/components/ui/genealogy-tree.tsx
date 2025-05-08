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

export function GenealogyTree({ data, width = 800, height = 800 }: GenealogyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;
    
    console.log("Rendering genealogy tree with data:", data);
    
    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 60, right: 60, bottom: 60, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Check if there are any children in the tree
      const hasChildren = data.children && data.children.length > 0;
      console.log(`Root node has children: ${hasChildren ? 'Yes' : 'No'}`);
      
      // Create a tree layout (VERTICAL orientation - root at top)
      const treeLayout = d3.tree<TreeNode>().size([innerWidth, innerHeight]);

      // Convert the flat data to a hierarchy
      const root = d3.hierarchy(data);
      
      console.log(`Tree hierarchy created with ${root.descendants().length} total nodes`);

      // Assign the data to the tree layout
      const treeData = treeLayout(root);

      // Create a group for the tree
      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add links between nodes (VERTICAL - using linkVertical)
      g.selectAll(".link")
        .data(treeData.links())
        .join("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
          .x(d => d.x)
          .y(d => d.y)
        )
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

      // Create node groups (VERTICAL - x and y are swapped)
      const node = g.selectAll(".node")
        .data(treeData.descendants())
        .join("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`);

      // Add node circles with orange/red fills for the brand
      node.append("circle")
        .attr("r", 25)
        .attr("fill", d => {
          // Use brand colors - orange for root, red-orange gradient based on level
          if (d.data.id === data.id) {
            return "#f97316"; // Orange-500 for root user
          } else if (d.data.isActive) {
            // Gradient from orange to red based on level
            const colors = ["#f97316", "#ef4444", "#dc2626", "#b91c1c", "#991b1b"];
            const levelIndex = Math.min(d.data.level - 1, colors.length - 1);
            return colors[levelIndex];
          }
          return "#9CA3AF"; // Gray for inactive
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

      // Add user images or initials
      node.append("text")
        .attr("dy", ".35em")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .text(d => {
          const name = d.data.name || "";
          return name.split(" ")
            .filter(part => part.length > 0)
            .map(n => n[0])
            .join("");
        });

      // Add node labels (truncate if too long)
      node.append("text")
        .attr("dy", "2em")
        .attr("x", 0)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "0.8em")
        .attr("font-weight", "500")
        .text(d => {
          const name = d.data.name || "";
          return name.length > 18 ? name.substring(0, 16) + '...' : name;
        });

      // Add level labels ABOVE the node
      node.append("text")
        .attr("dy", "-1.5em")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", "#6B7280")
        .attr("font-size", "0.7em")
        .text(d => d.data.id === data.id ? "You" : `Level ${d.data.level}`);
      
      // Add $25 branding in top left corner
      svg.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .attr("font-size", "1.5em")
        .attr("font-weight", "bold")
        .attr("fill", "#f97316")
        .attr("transform", "rotate(-15, 20, 30)")
        .text("$25");
      
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
