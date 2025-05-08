import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  status?: 'active' | 'inactive';
  value?: number;
}

const GenealogyTreeVisualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Sample data for demonstration - 5 levels deep genealogy tree
    const treeData: TreeNode = {
      id: "root",
      name: "You",
      status: "active",
      value: 1200,
      children: [
        {
          id: "1",
          name: "Sarah J.",
          status: "active",
          value: 850,
          children: [
            {
              id: "1-1",
              name: "Mark T.",
              status: "active",
              value: 450,
              children: [
                {
                  id: "1-1-1",
                  name: "Alex R.",
                  status: "active",
                  value: 200,
                  children: [
                    {
                      id: "1-1-1-1",
                      name: "Lisa K.",
                      status: "active",
                      value: 120
                    },
                    {
                      id: "1-1-1-2",
                      name: "David P.",
                      status: "inactive",
                      value: 80
                    }
                  ]
                },
                {
                  id: "1-1-2",
                  name: "Emma S.",
                  status: "inactive",
                  value: 250
                }
              ]
            },
            {
              id: "1-2",
              name: "John D.",
              status: "active",
              value: 400,
              children: [
                {
                  id: "1-2-1",
                  name: "Michael G.",
                  status: "active",
                  value: 400
                }
              ]
            }
          ]
        },
        {
          id: "2",
          name: "Robert P.",
          status: "active",
          value: 700,
          children: [
            {
              id: "2-1",
              name: "Thomas B.",
              status: "active",
              value: 350,
              children: [
                {
                  id: "2-1-1",
                  name: "Richard F.",
                  status: "active",
                  value: 350,
                  children: [
                    {
                      id: "2-1-1-1",
                      name: "William H.",
                      status: "active",
                      value: 350
                    }
                  ]
                }
              ]
            },
            {
              id: "2-2",
              name: "Kate M.",
              status: "inactive",
              value: 350
            }
          ]
        },
        {
          id: "3",
          name: "Jennifer L.",
          status: "active",
          value: 650,
          children: [
            {
              id: "3-1",
              name: "Brian K.",
              status: "active",
              value: 350,
              children: [
                {
                  id: "3-1-1",
                  name: "Sophie T.",
                  status: "active",
                  value: 350,
                  children: [
                    {
                      id: "3-1-1-1",
                      name: "Daniel R.",
                      status: "active",
                      value: 350
                    }
                  ]
                }
              ]
            },
            {
              id: "3-2",
              name: "Amanda J.",
              status: "active",
              value: 300
            }
          ]
        }
      ]
    };

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight || 500;
    
    // Create a hierarchical layout
    const root = d3.hierarchy(treeData);
    
    // Create a tree layout with specified dimensions
    const treeLayout = d3.tree<TreeNode>()
      .size([width - 100, height - 100])
      .nodeSize([80, 120]);
    
    // Assign the data to the tree layout
    const treeData2 = treeLayout(root);
    
    // Create a group element for the entire visualization
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, 50)`);
    
    // Create links between nodes
    g.selectAll(".link")
      .data(treeData2.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x(d => d.x)
        .y(d => d.y))
      .style("fill", "none")
      .style("stroke", "#ddd")
      .style("stroke-width", 1.5);
    
    // Create nodes
    const nodes = g.selectAll(".node")
      .data(treeData2.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // Add circles to represent nodes
    nodes.append("circle")
      .attr("r", d => {
        // Size based on level and value
        const baseSize = Math.max(25 - d.depth * 3, 10);
        return d.data.value ? baseSize * Math.sqrt(d.data.value) / 15 : baseSize;
      })
      .style("fill", d => {
        if (d.data.id === "root") return "#ff9800";
        return d.data.status === "active" ? "#4CAF50" : "#9e9e9e";
      })
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .style("cursor", "pointer")
      .style("opacity", 0.9)
      .on("mouseover", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 1);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style("opacity", 0.9);
      });
    
    // Add labels to nodes
    nodes.append("text")
      .attr("dy", d => d.children ? -12 : 4)
      .style("text-anchor", "middle")
      .style("font-size", d => Math.max(14 - d.depth * 2, 10) + "px")
      .style("fill", "#333")
      .text(d => d.data.name)
      .style("pointer-events", "none");
    
    // Add value labels
    nodes.append("text")
      .attr("dy", 20)
      .style("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#777")
      .text(d => d.data.value ? `$${d.data.value}` : "")
      .style("pointer-events", "none");
      
    // Add pulsing animation to the root node
    g.selectAll(".node")
      .filter(d => d.data.id === "root")
      .select("circle")
      .append("animate")
      .attr("attributeName", "r")
      .attr("values", "20;22;20")
      .attr("dur", "1.5s")
      .attr("repeatCount", "indefinite");
      
    // Add a legend
    const legend = svg.append("g")
      .attr("transform", `translate(20, 20)`);
      
    // Legend items
    const legendItems = [
      { color: "#ff9800", label: "You" },
      { color: "#4CAF50", label: "Active Member" },
      { color: "#9e9e9e", label: "Inactive Member" }
    ];
    
    legendItems.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);
        
      legendItem.append("circle")
        .attr("r", 8)
        .style("fill", item.color);
        
      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 4)
        .style("font-size", "12px")
        .text(item.label);
    });
    
    // Enable zooming and panning
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      
    svg.call(zoom);
    
    // Center the visualization
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, 50)
      .scale(1);
      
    svg.call(zoom.transform, initialTransform);
    
    // Responsive resize
    const resizeObserver = new ResizeObserver(() => {
      if (!svgRef.current) return;
      const newWidth = svgRef.current.clientWidth;
      svg.attr("width", newWidth);
    });
    
    if (svgRef.current) {
      resizeObserver.observe(svgRef.current);
    }
    
    return () => {
      if (svgRef.current) {
        resizeObserver.unobserve(svgRef.current);
      }
    };
  }, []);
  
  return (
    <div className="genealogy-tree-container w-full">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="600" 
        className="genealogy-tree rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner"
      ></svg>
    </div>
  );
};

export default GenealogyTreeVisualization;