import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SENSOR_LOGS } from '@/lib/mock-data';
import { SensorLogEntry } from '@/types/civic';

let memoryLogs: SensorLogEntry[] = [...INITIAL_SENSOR_LOGS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const severity = searchParams.get('severity');
  const query = searchParams.get('query');

  let results = [...memoryLogs];

  if (category && category !== 'all') {
    results = results.filter((l) => l.category === category);
  }

  if (severity && severity !== 'all') {
    results = results.filter((l) => l.severity === severity);
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (l) =>
        l.nodeId.toLowerCase().includes(q) ||
        l.nodeName.toLowerCase().includes(q) ||
        l.message.toLowerCase().includes(q) ||
        l.metricName.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    logs: results,
    total: results.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nodeId, nodeName, category, severity, metricName, metricValue, threshold, message } = body;

    if (!nodeId || !metricName) {
      return NextResponse.json({ error: 'Missing required log parameters' }, { status: 400 });
    }

    const newLog: SensorLogEntry = {
      id: `LOG-${Math.floor(5000 + Math.random() * 5000)}`,
      timestamp: new Date().toISOString(),
      nodeId,
      nodeName: nodeName || `Node ${nodeId}`,
      category: category || 'drainage',
      severity: severity || 'info',
      metricName,
      metricValue: String(metricValue),
      threshold: threshold || 'Nominal',
      message: message || 'Periodic sensor check completed.',
    };

    memoryLogs.unshift(newLog);
    // Keep max 200 logs
    if (memoryLogs.length > 200) {
      memoryLogs.pop();
    }

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record sensor log' }, { status: 500 });
  }
}
