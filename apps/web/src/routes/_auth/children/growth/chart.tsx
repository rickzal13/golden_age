import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { GrowthSummaryCard } from "../../../../components/ui/GrowthSummaryCard";
import { getChartDataApi } from "../../../../features/growth/api";
import { useGrowthSummary } from "../../../../features/growth/hooks/useGrowthSummary";

interface Point {
  ageMonths: number;
  value: number;
  date: string;
  percentile: number | null;
  statusColor: string | null;
}

export default function GrowthChartPage() {
  const { childId, chartType } = useParams<{ childId: string; chartType: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<Point | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { summary } = useGrowthSummary(childId);

  useEffect(() => {
    if (!childId || !chartType) return;
    getChartDataApi(childId, chartType)
      .then((res) => {
        setChartData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [childId, chartType]);

  useEffect(() => {
    if (chartData) drawChart(canvasRef.current, chartData);
  }, [chartData]);

  const findNearestPoint = useCallback(
    (mx: number, my: number) => {
      if (!chartData || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = mx * scaleX;
      const cy = my * scaleY;

      // Recalculate ranges
      const W = canvas.width,
        H = canvas.height;
      const pad = { top: 30, right: 30, bottom: 40, left: 60 };
      const pw = W - pad.left - pad.right,
        ph = H - pad.top - pad.bottom;

      let minV = Number.POSITIVE_INFINITY,
        maxV = Number.NEGATIVE_INFINITY;
      for (const c of chartData.percentileCurves) {
        for (const p of c.points) {
          minV = Math.min(minV, p.value);
          maxV = Math.max(maxV, p.value);
        }
      }
      for (const p of chartData.points) {
        minV = Math.min(minV, p.value - 0.5);
        maxV = Math.max(maxV, p.value + 0.5);
      }
      const vRange = maxV - minV;
      const maxAge = Math.max(
        ...(chartData.percentileCurves[0]?.points.map((p: any) => p.age_months) || [24]),
      );

      const toX = (age: number) => pad.left + (age / maxAge) * pw;
      const toY = (v: number) => pad.top + ph - ((v - minV) / vRange) * ph;

      // Find nearest point within threshold
      let nearest: Point | null = null;
      let minDist = Number.POSITIVE_INFINITY;
      for (const p of chartData.points) {
        const px = toX(p.ageMonths),
          py = toY(p.value);
        const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
        if (dist < 40 && dist < minDist) {
          minDist = dist;
          nearest = p;
        }
      }
      if (nearest) {
        setTooltip(nearest);
        setTooltipPos({ x: mx, y: my - 80 });
      } else {
        setTooltip(null);
      }
    },
    [chartData],
  );

  const handleCanvasMove = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0]!.clientX;
      clientY = e.touches[0]!.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    findNearestPoint(clientX - rect.left, clientY - rect.top);
  };

  const handleCanvasLeave = () => setTooltip(null);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <p className="text-sm text-gray-500">Loading chart...</p>
      </div>
    );

  const chartLabel =
    chartType === "wfa"
      ? "Weight-for-Age"
      : chartType === "hfa"
        ? "Height-for-Age"
        : "Head Circumference";

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        to={`/children/${childId}/growth`}
        className="mb-4 inline-block text-sm text-gray-400 hover:text-gray-600"
      >
        &larr; Back to records
      </Link>

      <GrowthSummaryCard
        latestWeight={summary.latestWeight}
        latestHeight={summary.latestHeight}
        lastMeasurementDate={summary.lastMeasurementDate}
        totalRecords={summary.totalRecords}
      />

      <h1 className="mt-6 text-2xl font-bold text-gray-900">{chartLabel}</h1>
      <div className="mt-3 flex gap-2">
        {["wfa", "hfa", "hcfa"].map((ct) => (
          <Link
            key={ct}
            to={`/children/${childId}/growth/chart/${ct}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${chartType === ct ? "bg-teal-100 text-teal-700" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
          >
            {ct === "wfa" ? "Weight" : ct === "hfa" ? "Height" : "Head"}
          </Link>
        ))}
      </div>

      {chartData?.points?.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-sm font-medium text-gray-900">No chart data available</p>
          <p className="mt-1 text-sm text-gray-500">
            Add your first{" "}
            {chartType === "wfa" ? "weight" : chartType === "hfa" ? "height" : "head circumference"}{" "}
            measurement
          </p>
          <Link
            to={`/children/${childId}/growth?add=true`}
            className="mt-4 inline-block rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Add Measurement
          </Link>
        </div>
      ) : (
        <div className="relative mt-6 rounded-xl border border-gray-100 bg-white p-4">
          <canvas
            ref={canvasRef}
            width={700}
            height={420}
            className="w-full h-auto touch-none"
            onMouseMove={handleCanvasMove}
            onMouseLeave={handleCanvasLeave}
            onTouchStart={handleCanvasMove}
            onTouchMove={handleCanvasMove}
            onTouchEnd={handleCanvasLeave}
          />
          {tooltip && (
            <div
              className="pointer-events-none absolute z-20 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs"
              style={{
                left: Math.min(tooltipPos.x, window.innerWidth - 200),
                top: Math.max(tooltipPos.y, 10),
              }}
            >
              <p className="font-medium text-gray-900">
                {new Date(tooltip.date).toLocaleDateString()}
              </p>
              <p className="text-gray-500">
                {chartLabel.split("-")[0]}: {tooltip.value} {chartType === "wfa" ? "kg" : "cm"}
              </p>
              <p className="text-gray-500">Age: {tooltip.ageMonths} months</p>
              {tooltip.percentile && (
                <p className="text-gray-500">WHO: {tooltip.percentile}th percentile</p>
              )}
              {tooltip.statusColor && (
                <p
                  className={
                    tooltip.statusColor === "green"
                      ? "text-emerald-600"
                      : tooltip.statusColor === "yellow"
                        ? "text-amber-600"
                        : "text-red-600"
                  }
                >
                  {tooltip.statusColor === "green"
                    ? "Healthy Range"
                    : tooltip.statusColor === "yellow"
                      ? "Needs Attention"
                      : "Below Range"}
                </p>
              )}
            </div>
          )}
          <div className="mt-3 flex justify-center gap-6 text-xs text-gray-400">
            {[3, 15, 50, 85, 97].map((p) => (
              <span key={p}>— {p}th</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function drawChart(canvas: HTMLCanvasElement | null, data: any) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width,
    H = canvas.height;
  const pad = { top: 30, right: 30, bottom: 40, left: 60 };
  const pw = W - pad.left - pad.right,
    ph = H - pad.top - pad.bottom;
  ctx.clearRect(0, 0, W, H);

  let minV = Number.POSITIVE_INFINITY,
    maxV = Number.NEGATIVE_INFINITY;
  for (const c of data.percentileCurves) {
    for (const p of c.points) {
      minV = Math.min(minV, p.value);
      maxV = Math.max(maxV, p.value);
    }
  }
  for (const p of data.points) {
    minV = Math.min(minV, p.value - 0.5);
    maxV = Math.max(maxV, p.value + 0.5);
  }
  const vRange = maxV - minV;
  const maxAge = Math.max(
    ...(data.percentileCurves[0]?.points.map((p: any) => p.age_months) || [24]),
  );

  const toX = (age: number) => pad.left + (age / maxAge) * pw;
  const toY = (v: number) => pad.top + ph - ((v - minV) / vRange) * ph;

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, H - pad.bottom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pad.left, H - pad.bottom);
  ctx.lineTo(W - pad.right, H - pad.bottom);
  ctx.stroke();

  ctx.fillStyle = "#9ca3af";
  ctx.font = "10px sans-serif";
  for (let i = 0; i <= 4; i++) {
    const v = minV + (vRange * i) / 4;
    ctx.fillText(v.toFixed(1), 5, toY(v) + 4);
  }
  for (let i = 0; i <= maxAge; i += 3) {
    ctx.fillText(i.toString(), toX(i) - 5, H - pad.bottom + 16);
  }

  const pctColors = ["#fca5a5", "#fcd34d", "#34d399", "#fcd34d", "#fca5a5"];
  for (let ci = 0; ci < data.percentileCurves.length; ci++) {
    const curve = data.percentileCurves[ci];
    ctx.strokeStyle = pctColors[ci]!;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < curve.points.length; i++) {
      if (i === 0) ctx.moveTo(toX(curve.points[i].age_months), toY(curve.points[i].value));
      else ctx.lineTo(toX(curve.points[i].age_months), toY(curve.points[i].value));
    }
    ctx.stroke();
  }

  for (const p of data.points) {
    const color =
      p.statusColor === "green" ? "#10b981" : p.statusColor === "yellow" ? "#f59e0b" : "#ef4444";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(toX(p.ageMonths), toY(p.value), 5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (data.points.length > 1) {
    ctx.strokeStyle = "#0d9488";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.points.length; i++) {
      if (i === 0) ctx.moveTo(toX(data.points[i].ageMonths), toY(data.points[i].value));
      else ctx.lineTo(toX(data.points[i].ageMonths), toY(data.points[i].value));
    }
    ctx.stroke();
  }
}
