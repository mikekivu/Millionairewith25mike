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

      const margin = { top: 40, right: 40, bottom: 40, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create a group for the tree and center it
      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add $25 branding icon at top left
      svg.append("text")
        .attr("x", 20)
        .attr("y", 30)
        .attr("font-size", "1.8em")
        .attr("font-weight", "bold")
        .attr("fill", "#f97316")
        .attr("transform", "rotate(-15, 20, 30)")
        .text("$25");

      // Functions to find max depth and max width
      function findMaxDepth(node: TreeNode): number {
        if (!node.children || node.children.length === 0) return 1;
        return 1 + Math.max(...node.children.map(child => findMaxDepth(child)));
      }

      function findMaxWidth(node: TreeNode, level: number, widths: number[]): void {
        if (!widths[level]) widths[level] = 0;
        widths[level]++;
        if (node.children) {
          node.children.forEach(child => findMaxWidth(child, level + 1, widths));
        }
      }

      // Calculate the max depth and width
      const maxDepth = findMaxDepth(data);
      const widths: number[] = [];
      findMaxWidth(data, 0, widths);
      const maxWidth = Math.max(...widths);

      // Calculate horizontal and vertical spacing
      const levelWidth = innerWidth / maxDepth;
      const nodeVerticalSpacing = innerHeight / Math.max(maxWidth, 1);

      // Custom recursive function to position nodes
      function positionNodes(node: TreeNode, level: number, verticalPosition: number, positions: Map<number, {x: number, y: number}>, parentId?: number) {
        const x = level * levelWidth + 50; // 50px offset from left
        const y = verticalPosition * nodeVerticalSpacing + 60; // 60px offset from top
        
        positions.set(node.id, {x, y});
        
        if (node.children && node.children.length > 0) {
          // Calculate positions for children
          const childCount = node.children.length;
          const start = verticalPosition - (childCount - 1) / 2;
          
          node.children.forEach((child, index) => {
            positionNodes(child, level + 1, start + index, positions, node.id);
          });
        }
      }

      // Create a map to store positions
      const positions = new Map<number, {x: number, y: number}>();
      
      // Position the nodes
      positionNodes(data, 0, 0, positions);

      // Render connections (lines)
      function drawConnections(node: TreeNode, positions: Map<number, {x: number, y: number}>) {
        if (node.children && node.children.length > 0) {
          const parentPos = positions.get(node.id);
          if (!parentPos) return;
          
          node.children.forEach(child => {
            const childPos = positions.get(child.id);
            if (!childPos) return;
            
            g.append("path")
              .attr("d", `
                M${parentPos.x + 24},${parentPos.y}
                H${(parentPos.x + childPos.x) / 2}
                V${childPos.y}
                H${childPos.x - 24}
              `)
              .attr("fill", "none")
              .attr("stroke", "#3b82f6")
              .attr("stroke-width", 1.5);
            
            drawConnections(child, positions);
          });
        }
      }
      
      // Draw all connections
      drawConnections(data, positions);

      // Render nodes
      function renderNodes(node: TreeNode, positions: Map<number, {x: number, y: number}>) {
        const pos = positions.get(node.id);
        if (!pos) return;
        
        const nodeGroup = g.append("g")
          .attr("transform", `translate(${pos.x},${pos.y})`);
        
        // Add circle background
        nodeGroup.append("circle")
          .attr("r", 24)
          .attr("fill", "white")
          .attr("stroke", node.id === data.id || node.isActive 
            ? "#f97316"  // Orange for root and active users
            : "#6b7280") // Gray for inactive users
          .attr("stroke-width", 2);
        
        // Add user icon
        nodeGroup.append("text")
          .attr("dy", ".35em")
          .attr("x", 0)
          .attr("y", 0)
          .attr("text-anchor", "middle")
          .attr("fill", node.id === data.id || node.isActive 
            ? "#f97316"  // Orange for root and active users 
            : "#6b7280") // Gray for inactive users
          .attr("font-size", "16px")
          .html('&#128100;'); // Person emoji/icon
        
        // Add name label
        nodeGroup.append("text")
          .attr("dy", "2.5em")
          .attr("x", 0)
          .attr("y", 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "0.9em")
          .attr("font-weight", "500")
          .attr("fill", "#374151") // Dark gray for text
          .text(() => {
            const name = node.name || "";
            return name.length > 18 ? name.substring(0, 16) + '...' : name;
          });
        
        // Recursively render children
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => renderNodes(child, positions));
        }
      }
      
      // Render all nodes
      renderNodes(data, positions);
      
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
