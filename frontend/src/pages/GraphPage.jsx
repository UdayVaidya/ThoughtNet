import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as d3 from "d3";
import { 
  Network, Search, ZoomIn, ZoomOut, Maximize2, 
  Layers, Filter, Info, X, ExternalLink, Zap
} from "lucide-react";
import { searchAPI } from "../services/api.service.js";
import { useNavigate } from "react-router-dom";

const TYPE_COLORS = {
  youtube: "#ef4444",
  tweet:   "#38bdf8",
  note:    "#facc15",
  webpage: "#06d6a0",
  image:   "#f472b6",
  pdf:     "#fb923c",
  article: "#f59e0b",
};

export default function GraphPage() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const navigate = useNavigate();
  
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const zoomRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    searchAPI.getGraphData()
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    let nodes = data.nodes;
    if (filterType !== "all") {
      nodes = nodes.filter(n => n.type === filterType);
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      nodes = nodes.filter(n => n.title.toLowerCase().includes(s) || n.tags?.some(t => t.toLowerCase().includes(s)));
    }
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = data.links.filter(l => nodeIds.has(typeof l.source === 'object' ? l.source.id : l.source) && nodeIds.has(typeof l.target === 'object' ? l.target.id : l.target));
    return { nodes, links };
  }, [data, searchTerm, filterType]);

  // D3 Implementation
  useEffect(() => {
    if (!svgRef.current || loading) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove(); // Clear previous

    const g = svg.append("g");

    // Zoom setup
    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));
    
    zoomRef.current = zoom;
    svg.call(zoom);

    // Forces
    const simulation = d3.forceSimulation(filteredData.nodes)
      .force("link", d3.forceLink(filteredData.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Links
    const link = g.append("g")
      .selectAll("line")
      .data(filteredData.links)
      .join("line")
      .attr("stroke", "url(#linkGradient)")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", d => Math.sqrt(d.strength || 1) * 2);

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(filteredData.nodes)
      .join("g")
      .call(drag(simulation))
      .on("click", (e, d) => {
        e.stopPropagation();
        setSelectedNode(d);
      })
      .on("mouseenter", (e, d) => {
        setHoveredNode(d);
        // Animate node size up on hover
        d3.select(e.currentTarget).select("circle")
          .transition()
          .duration(300)
          .attr("r", 20)
          .style("filter", `drop-shadow(0 0 12px ${TYPE_COLORS[d.type]}aa)`);
        
        d3.select(e.currentTarget).select("text")
          .transition()
          .duration(300)
          .attr("opacity", 1)
          .attr("dy", 32);
      })
      .on("mouseleave", (e, d) => {
        setHoveredNode(null);
        // Reset node size
        d3.select(e.currentTarget).select("circle")
          .transition()
          .duration(300)
          .attr("r", 14)
          .style("filter", `drop-shadow(0 0 6px ${TYPE_COLORS[d.type]}80)`);
        
        d3.select(e.currentTarget).select("text")
          .transition()
          .duration(300)
          .attr("opacity", 0)
          .attr("dy", 24);
      })
      .style("cursor", "pointer");

    // Node Circle
    node.append("circle")
      .attr("r", 14)
      .attr("fill", d => TYPE_COLORS[d.type] || "#f59e0b")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 2)
      .style("filter", d => `drop-shadow(0 0 6px ${TYPE_COLORS[d.type]}80)`);

    // Image pattern if available
    const defs = svg.append("defs");
    
    // Add glowing line effect (Neural fiber)
    const lineGradient = defs.append("linearGradient")
      .attr("id", "linkGradient")
      .attr("gradientUnits", "userSpaceOnUse");
    lineGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(245,158,11,0.2)");
    lineGradient.append("stop").attr("offset", "50%").attr("stop-color", "rgba(56,189,248,0.4)");
    lineGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(245,158,11,0.2)");

    filteredData.nodes.forEach(n => {
      if (n.thumbnail) {
        defs.append("pattern")
          .attr("id", "pattern-" + n.id)
          .attr("width", 1)
          .attr("height", 1)
          .append("image")
          .attr("href", n.thumbnail)
          .attr("width", 28)
          .attr("height", 28)
          .attr("preserveAspectRatio", "xMidYMid slice");
      }
    });

    node.select("circle")
      .attr("fill", d => d.thumbnail ? `url(#pattern-${d.id})` : (TYPE_COLORS[d.type] || "#f59e0b"))
      .attr("opacity", d => (hoveredNode && hoveredNode.id !== d.id ? 0.3 : 1))
      .transition().duration(200);

    // Labels
    node.append("text")
      .attr("dy", 24)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("opacity", 0) // Start hidden
      .style("pointer-events", "none")
      .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
      .text(d => d.title.length > 25 ? d.title.slice(0, 22) + "..." : d.title);

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function drag(sim) {
      return d3.drag()
        .on("start", (event) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on("drag", (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on("end", (event) => {
          if (!event.active) sim.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        });
    }

    return () => simulation.stop();
  }, [filteredData, loading]);

  return (
    <div className="relative h-screen flex flex-col lg:flex-row overflow-hidden bg-[#060608]">
      
      {/* ── Sidebar Controls (Hidden on mobile by default) ── */}
      <div className="hidden lg:flex w-80 flex-col glass-dark border-r border-white/5 p-6 z-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Network className="text-brand" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-syne">Knowledge Graph</h1>
            <p className="text-[10px] text-text-3 uppercase tracking-widest">Semantic Connections</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" size={14} />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-brand/40 transition-all font-mono"
          />
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <label className="text-[10px] text-text-3 uppercase tracking-widest font-bold">Filter By Type</label>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filterType === 'all' ? 'bg-brand text-black bg-white font-bold' : 'bg-white/5 text-text-3 hover:bg-white/10'}`}
            >
              All
            </button>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${filterType === type ? 'font-bold' : 'opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}
                style={{ background: filterType === type ? color : 'rgba(255,255,255,0.05)', color: filterType === type ? '#000' : '#fff' }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: filterType === type ? '#000' : color }} />
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend/Info */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-text-3 mb-4">
            <Layers size={14} />
            <span>Interactive Visualization</span>
          </div>
          <p className="text-[11px] text-text-3 leading-relaxed opacity-60 italic">
            Nodes represent your saved content. Lines indicate semantic relationships found by AI using tags and vector similarities.
          </p>
        </div>
      </div>

      {/* ── Main Graph Container ── */}
      <div ref={containerRef} className="flex-1 relative cursor-crosshair overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060608] z-30">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Zap className="text-brand" size={32} />
            </motion.div>
            <p className="mt-4 text-brand font-syne text-sm uppercase tracking-widest animate-pulse">Calculating semantic forces...</p>
          </div>
        )}
        
        <svg ref={svgRef} className="w-full h-full" />

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-20">
          <button 
            onClick={() => d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 1.5)}
            className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-brand hover:text-black transition-all group shadow-lg"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={() => d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 0.6)}
            className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-brand hover:text-black transition-all group shadow-lg"
          >
            <ZoomOut size={18} />
          </button>
          <button 
            onClick={() => d3.select(svgRef.current).transition().duration(600).call(zoomRef.current.transform, d3.zoomIdentity)}
            className="p-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-brand hover:text-black transition-all group shadow-lg"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {/* ── Node Inspector (Popup/Drawer) ── */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-screen w-full lg:w-96 glass-mid border-l border-white/10 z-50 p-8 shadow-2xl"
          >
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-6 left-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-text-3"
            >
              <X size={16} />
            </button>

            <div className="mt-12">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider" 
                  style={{ background: `${TYPE_COLORS[selectedNode.type]}20`, color: TYPE_COLORS[selectedNode.type], border: `1px solid ${TYPE_COLORS[selectedNode.type]}40` }}>
                  {selectedNode.type}
                </span>
                <span className="text-[10px] text-text-3 uppercase tracking-widest">{selectedNode.category}</span>
              </div>

              <h2 className="text-2xl font-black text-white leading-tight mb-6 font-syne underline decoration-brand/30 decoration-2 underline-offset-4">
                {selectedNode.title}
              </h2>

              {selectedNode.thumbnail && (
                <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-white/5 border border-white/10">
                  <img src={selectedNode.thumbnail} className="w-full h-full object-cover" alt="" />
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-8">
                {selectedNode.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-text-2">#{tag}</span>
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate(`/content/${selectedNode.id}`)}
                  className="w-full py-4 bg-brand rounded-2xl text-black font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98]"
                >
                  <Info size={18} /> Open Details
                </button>
                <a 
                  href={selectedNode.url} target="_blank" rel="noreferrer"
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                >
                  <ExternalLink size={18} /> Visit Source
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-syne { font-family: 'Syne', sans-serif; }
        .glass-dark { background: rgba(6, 6, 8, 0.85); backdrop-filter: blur(20px); }
        .glass-mid { background: rgba(11, 11, 15, 0.92); backdrop-filter: blur(40px); }
        .gradient-text { background: linear-gradient(135deg, #f59e0b 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}} />
    </div>
  );
}
