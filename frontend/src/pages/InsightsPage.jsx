import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import {
  Brain, Zap, Heart, Tag, TrendingUp, BookOpen,
  Youtube, Twitter, FileText, Globe, Image, File,
  BarChart2, Clock, Star, Activity,
} from "lucide-react";
import { contentAPI, searchAPI } from "../services/api.service.js";
import { useStats } from "../hooks/useContent.js";
import dayjs from "dayjs";

/* ── colour palette per content type ────────────── */
const TYPE_COLOR = {
  youtube:  "#ef4444",
  tweet:    "#38bdf8",
  note:     "#facc15",
  webpage:  "#06d6a0",
  image:    "#f472b6",
  pdf:      "#fb923c",
  article:  "#f59e0b",
};
const TYPE_ICON = {
  youtube: Youtube, tweet: Twitter, note: FileText,
  webpage: Globe,   image: Image,   pdf: File, article: Globe,
};

/* ── Doughnut chart (type breakdown) ─────────────── */
function DonutChart({ data }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !data?.length) return;
    const el  = ref.current;
    const W   = el.offsetWidth || 220;
    const H   = 220;
    const R   = Math.min(W, H) / 2 - 10;
    const IR  = R * 0.55;

    d3.select(el).selectAll("*").remove();
    const svg = d3.select(el)
      .append("svg").attr("width", W).attr("height", H)
      .append("g").attr("transform", `translate(${W / 2},${H / 2})`);

    const pie   = d3.pie().value(d => d.count).sort(null);
    const arc   = d3.arc().innerRadius(IR).outerRadius(R).cornerRadius(4).padAngle(0.04);
    const arcHv = d3.arc().innerRadius(IR).outerRadius(R + 8).cornerRadius(4).padAngle(0.04);

    const slices = svg.selectAll("path")
      .data(pie(data))
      .enter().append("path")
      .attr("d", arc)
      .attr("fill", d => TYPE_COLOR[d.data.type] || "#f59e0b")
      .attr("opacity", 0.85)
      .style("cursor", "crosshair")
      .on("mouseenter", function (_, d) {
        d3.select(this).transition().duration(200).attr("d", arcHv).attr("opacity", 1);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("d", arc).attr("opacity", 0.85);
      });

    slices.each(function (d) {
      const el = d3.select(this);
      const len = this.getTotalLength?.() || 1;
      el.attr("stroke-dasharray", `${len} ${len}`)
        .attr("stroke-dashoffset", len)
        .transition().duration(800).ease(d3.easeQuadOut)
        .attr("stroke-dashoffset", 0);
    });

    svg.append("text")
      .attr("text-anchor", "middle").attr("dy", "-0.2em")
      .attr("fill", "#f8f4ef")
      .attr("font-family", "Syne, sans-serif")
      .attr("font-size", 28).attr("font-weight", 800)
      .text(d3.sum(data, d => d.count));

    svg.append("text")
      .attr("text-anchor", "middle").attr("dy", "1.4em")
      .attr("fill", "#5c5650")
      .attr("font-family", "Space Grotesk, sans-serif")
      .attr("font-size", 11).attr("letter-spacing", "0.08em")
      .text("TOTAL");
  }, [data]);

  return <div ref={ref} style={{ width: '100%' }} />;
}

/* ── Activity heatmap (last 12 weeks) ───────────── */
function ActivityHeatmap({ items }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !items?.length) return;

    const counts = {};
    items.forEach(item => {
      const day = dayjs(item.createdAt).format("YYYY-MM-DD");
      counts[day] = (counts[day] || 0) + 1;
    });

    const today   = dayjs();
    const start   = today.subtract(83, 'day');   
    const days    = [];
    for (let i = 0; i <= 83; i++) {
      const d = start.add(i, 'day');
      days.push({ date: d, key: d.format("YYYY-MM-DD"), count: counts[d.format("YYYY-MM-DD")] || 0 });
    }

    const cellSize = 14;
    const gap      = 3;
    const cols     = 12;  
    const rows     = 7;   

    const el  = ref.current;
    const W   = cols * (cellSize + gap);
    const H   = rows * (cellSize + gap) + 24;

    d3.select(el).selectAll("*").remove();
    const svg = d3.select(el)
      .append("svg").attr("width", W).attr("height", H);

    const maxCount = d3.max(days, d => d.count) || 1;
    const color = d3.scaleSequential()
      .domain([0, maxCount])
      .interpolator(t => t === 0
        ? "rgba(255,255,255,0.05)"
        : `rgba(245,158,11,${0.15 + t * 0.85})`
      );

    ['S','M','T','W','T','F','S'].forEach((label, i) => {
      svg.append("text")
        .attr("x", -2).attr("y", i * (cellSize + gap) + cellSize - 2)
        .attr("fill", "#5c5650").attr("font-size", 8)
        .attr("font-family", "Space Grotesk")
        .attr("text-anchor", "end")
        .text(label);
    });

    days.forEach((d, idx) => {
      const week = Math.floor(idx / 7);
      const dow  = idx % 7;

      svg.append("rect")
        .attr("x", week * (cellSize + gap) + 14)
        .attr("y", dow  * (cellSize + gap))
        .attr("width",  cellSize)
        .attr("height", cellSize)
        .attr("rx", 3)
        .attr("fill", color(d.count))
        .attr("opacity", 0)
        .transition()
        .delay(idx * 3)
        .duration(300)
        .attr("opacity", 1);
    });
  }, [items]);

  return <div ref={ref} />;
}

/* ── Horizontal bar chart (top tags) ────────────── */
function TagBars({ tags }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !tags?.length) return;
    const slice = tags.slice(0, 8);
    const el    = ref.current;
    const W     = el.offsetWidth || 300;
    const ROW   = 32;
    const H     = slice.length * ROW;
    const max   = d3.max(slice, d => d.count) || 1;
    const xScale = d3.scaleLinear().domain([0, max]).range([0, W - 90]);

    d3.select(el).selectAll("*").remove();
    const svg = d3.select(el).append("svg").attr("width", W).attr("height", H);

    slice.forEach((tag, i) => {
      const y = i * ROW + 6;

      svg.append("rect").attr("x", 82).attr("y", y + 6)
        .attr("width", W - 90).attr("height", 10).attr("rx", 5)
        .attr("fill", "rgba(255,255,255,0.04)");

      svg.append("rect").attr("x", 82).attr("y", y + 6)
        .attr("width", 0).attr("height", 10).attr("rx", 5)
        .attr("fill", `rgba(245,158,11,${0.35 + (i / slice.length) * 0.55})`)
        .transition().delay(i * 60).duration(700).ease(d3.easeQuadOut)
        .attr("width", xScale(tag.count));

      svg.append("text").attr("x", 78).attr("y", y + 15)
        .attr("text-anchor", "end").attr("fill", "#a89f96")
        .attr("font-size", 11).attr("font-family", "Space Grotesk")
        .text(`#${tag._id}`);

      svg.append("text").attr("x", W - 4).attr("y", y + 15)
        .attr("text-anchor", "end").attr("fill", "#5c5650")
        .attr("font-size", 10).attr("font-family", "Space Grotesk")
        .text(tag.count);
    });
  }, [tags]);

  return <div ref={ref} style={{ width: '100%' }} />;
}

/* ── Saves-over-time line chart (last 30 days) ── */
function SavesChart({ items }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !items?.length) return;

    const el = ref.current;
    const W  = el.offsetWidth || 400;
    const H  = 120;
    const M  = { t: 10, r: 10, b: 24, l: 28 };
    const iW = W - M.l - M.r;
    const iH = H - M.t - M.b;

    const today = dayjs();
    const data  = Array.from({ length: 30 }, (_, i) => {
      const d   = today.subtract(29 - i, 'day');
      const key = d.format("YYYY-MM-DD");
      return {
        date:  d.toDate(),
        count: items.filter(it => dayjs(it.createdAt).format("YYYY-MM-DD") === key).length,
      };
    });

    d3.select(el).selectAll("*").remove();
    const svg = d3.select(el).append("svg").attr("width", W).attr("height", H)
      .append("g").attr("transform", `translate(${M.l},${M.t})`);

    const xScale = d3.scaleTime().domain(d3.extent(data, d => d.date)).range([0, iW]);
    const yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.count) || 1]).range([iH, 0]);

    const area = d3.area()
      .x(d => xScale(d.date)).y0(iH).y1(d => yScale(d.count))
      .curve(d3.curveCatmullRom);

    const line = d3.line()
      .x(d => xScale(d.date)).y(d => yScale(d.count))
      .curve(d3.curveCatmullRom);

    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "areaGrad").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", 1);
    grad.append("stop").attr("offset", "0%").attr("stop-color",   "#f59e0b").attr("stop-opacity", 0.3);
    grad.append("stop").attr("offset", "100%").attr("stop-color", "#f59e0b").attr("stop-opacity", 0);

    svg.append("path").datum(data).attr("fill", "url(#areaGrad)").attr("d", area);

    const path = svg.append("path").datum(data)
      .attr("fill", "none").attr("stroke", "#f59e0b")
      .attr("stroke-width", 2).attr("d", line);

    const len = path.node().getTotalLength();
    path.attr("stroke-dasharray", `${len} ${len}`)
      .attr("stroke-dashoffset", len)
      .transition().duration(1200).ease(d3.easeQuadInOut)
      .attr("stroke-dashoffset", 0);

    svg.selectAll("circle").data(data.filter(d => d.count > 0))
      .enter().append("circle")
      .attr("cx", d => xScale(d.date)).attr("cy", d => yScale(d.count))
      .attr("r", 3).attr("fill", "#f59e0b").attr("opacity", 0)
      .transition().delay(1000).duration(400)
      .attr("opacity", 1);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d => d3.timeFormat("%b %d")(d));
    svg.append("g").attr("transform", `translate(0,${iH})`).call(xAxis)
      .selectAll("text").attr("fill", "#5c5650").attr("font-size", 9).attr("font-family", "Space Grotesk");
    svg.select(".domain").remove();
    svg.selectAll(".tick line").remove();

    svg.append("g").call(d3.axisLeft(yScale).ticks(3))
      .selectAll("text").attr("fill", "#5c5650").attr("font-size", 9).attr("font-family", "Space Grotesk");
    svg.select(".domain").remove();
  }, [items]);

  return <div ref={ref} style={{ width: '100%' }} />;
}

export default function InsightsPage() {
  const stats = useStats();
  const [items,  setItems]  = useState([]);
  const [tags,   setTags]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      contentAPI.getAll({ limit: 500 }),
      searchAPI.getTags(),
    ]).then(([cRes, tRes]) => {
      setItems(cRes.data || []);
      setTags(tRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const typeBreakdown = Object.entries(
    items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const topTags = (tags || []).slice(0, 10);

  const statCards = [
    { label: "Total Saved",    value: stats?.total          ?? items.length,  icon: Brain,    color: "#f59e0b" },
    { label: "AI Processed",   value: stats?.aiProcessed    ?? 0,             icon: Zap,      color: "#06d6a0" },
    { label: "Favorites",      value: stats?.favorites      ?? 0,             icon: Heart,    color: "#ff6b6b" },
    { label: "Tags Used",      value: tags.length,                             icon: Tag,      color: "#38bdf8" },
  ];

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto z-content">
      <motion.div {...fadeUp(0)} className="mb-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Your <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-[var(--text-3)] text-sm mt-2">
              A live view of your knowledge, patterns, and progress
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs glass px-3 py-2 rounded-xl"
            style={{ color: 'var(--text-3)' }}>
            <Activity size={12} style={{ color: 'var(--brand)' }} />
            Live analytics
          </div>
        </div>
        <div className="h-px mt-6" style={{ background: 'linear-gradient(90deg, var(--brand), var(--teal) 50%, transparent)' }} />
      </motion.div>

      <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <motion.div key={s.label}
            whileHover={{ y: -4, scale: 1.02 }}
            className="card p-5 relative overflow-hidden cursor-default"
            style={{ background: `${s.color}0d`, borderColor: `${s.color}25` }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10"
              style={{ background: `radial-gradient(circle, ${s.color}, transparent)` }} />
            <s.icon size={18} style={{ color: s.color }} className="mb-3" />
            <div className="text-3xl font-black text-white leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>
              {loading ? '—' : (s.value ?? 0)}
            </div>
            <div className="text-xs mt-1.5 font-medium uppercase tracking-wider" style={{ color: `${s.color}cc` }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div {...fadeUp(0.2)} className="lg:col-span-2 card p-6"
          style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <BarChart2 size={13} style={{ color: 'var(--brand)' }} />
            </div>
            <h2 className="section-heading text-sm">Saves — Last 30 Days</h2>
          </div>
          {loading ? <div className="h-32 shimmer rounded-xl" /> : <SavesChart items={items} />}
        </motion.div>

        <motion.div {...fadeUp(0.25)} className="card p-6"
          style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(6,214,160,0.12)', border: '1px solid rgba(6,214,160,0.2)' }}>
              <BookOpen size={13} style={{ color: 'var(--teal)' }} />
            </div>
            <h2 className="section-heading text-sm">Content Mix</h2>
          </div>
          {loading ? <div className="h-52 shimmer rounded-xl" /> : <DonutChart data={typeBreakdown} />}
          <div className="mt-4 space-y-1.5">
            {typeBreakdown.slice(0, 4).map(({ type, count }) => {
              const Icon = TYPE_ICON[type] || Globe;
              const col  = TYPE_COLOR[type] || '#f59e0b';
              const pct  = items.length ? Math.round((count / items.length) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-2 text-xs text-[var(--text-3)]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col }} />
                  <Icon size={10} style={{ color: col }} />
                  <span className="capitalize flex-1">{type}</span>
                  <span style={{ color: col }} className="font-semibold">{pct}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.3)} className="lg:col-span-2 card p-6"
          style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Clock size={13} style={{ color: 'var(--brand)' }} />
              </div>
              <h2 className="section-heading text-sm">Activity — Last 12 Weeks</h2>
            </div>
          </div>
          {loading ? <div className="h-24 shimmer rounded-xl" /> : <ActivityHeatmap items={items} />}
        </motion.div>

        <motion.div {...fadeUp(0.35)} className="card p-6"
          style={{ background: 'rgba(255,255,255,0.025)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <Tag size={13} style={{ color: 'var(--sky)' }} />
            </div>
            <h2 className="section-heading text-sm">Top Tags</h2>
          </div>
          {loading ? <div className="h-64 shimmer rounded-xl" /> : <TagBars tags={topTags} />}
        </motion.div>
      </div>
    </div>
  );
}
