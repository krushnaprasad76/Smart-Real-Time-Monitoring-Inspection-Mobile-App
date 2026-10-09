import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_STREET_NODES } from '@/lib/mock-data';
import { StreetAssetNode } from '@/types/civic';

// Server-authoritative in-memory state for runtime
let memoryNodes: StreetAssetNode[] = [...INITIAL_STREET_NODES];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');

  if (id) {
    const node = memoryNodes.find((n) => n.id === id);
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    }
    return NextResponse.json({ node });
  }

  let results = [...memoryNodes];
  if (category && category !== 'all') {
    results = results.filter((n) => n.category === category);
  }

  return NextResponse.json({
    nodes: results,
    total: results.length,
    timestamp: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, nodeId, faultType, metrics, status } = body;

    if (action === 'inject_fault') {
      const nodeIndex = memoryNodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) {
        return NextResponse.json({ error: 'Node not found' }, { status: 404 });
      }

      const node = memoryNodes[nodeIndex];
      node.status = 'critical';

      if (faultType === 'drainage_flood') {
        node.metrics.waterLevelCm = 89;
        node.metrics.flowRateLpm = 8;
        node.activeAlertDescription = 'Simulated Flash Flood: Water Level 89cm (Capacity 90cm)';
      } else if (faultType === 'electrical_surge') {
        node.metrics.transformerTempC = 96;
        node.metrics.gridLoadPct = 98;
        node.activeAlertDescription = 'Simulated Thermal Runaway: Core Temp 96°C';
      } else if (faultType === 'water_main_burst') {
        node.metrics.acousticLeakDb = 82;
        node.metrics.waterPressurePsi = 28;
        node.activeAlertDescription = 'Simulated Main Rupture: 82 dB Acoustic Leak Sound';
      } else if (faultType === 'streetlight_blackout') {
        node.metrics.voltage = 0;
        node.metrics.lux = 0;
        node.activeAlertDescription = 'Simulated Line Failure: Zero Voltage Detected';
      } else if (faultType === 'pothole_axle_strike') {
        node.metrics.vibrationRmsG = 5.2;
        node.activeAlertDescription = 'Simulated High Impact: 5.2G Vehicle Axle Shock';
      }

      return NextResponse.json({ success: true, node });
    }

    if (action === 'reset_all') {
      memoryNodes = JSON.parse(JSON.stringify(INITIAL_STREET_NODES));
      return NextResponse.json({ success: true, nodes: memoryNodes });
    }

    if (nodeId && (metrics || status)) {
      const nodeIndex = memoryNodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex !== -1) {
        if (metrics) {
          memoryNodes[nodeIndex].metrics = {
            ...memoryNodes[nodeIndex].metrics,
            ...metrics,
          };
        }
        if (status) {
          memoryNodes[nodeIndex].status = status;
        }
        return NextResponse.json({ success: true, node: memoryNodes[nodeIndex] });
      }
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error processing telemetry' }, { status: 500 });
  }
}
