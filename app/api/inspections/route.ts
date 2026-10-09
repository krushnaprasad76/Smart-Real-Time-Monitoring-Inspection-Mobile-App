import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_INSPECTIONS } from '@/lib/mock-data';
import { FieldInspectionRecord } from '@/types/civic';

let memoryInspections: FieldInspectionRecord[] = [...INITIAL_INSPECTIONS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get('nodeId');

  let results = [...memoryInspections];
  if (nodeId) {
    results = results.filter((i) => i.nodeId === nodeId);
  }

  return NextResponse.json({
    inspections: results,
    total: results.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nodeId,
      nodeName,
      category,
      inspectorName,
      inspectorBadge,
      severity,
      checklist,
      findingsNotes,
      photoUrl,
      digitalSignature,
      workOrderAction,
    } = body;

    if (!nodeId || !inspectorName || !digitalSignature) {
      return NextResponse.json({ error: 'Missing inspection sign-off parameters' }, { status: 400 });
    }

    const newInspection: FieldInspectionRecord = {
      id: `INS-${Math.floor(8000 + Math.random() * 2000)}`,
      nodeId,
      nodeName: nodeName || `Asset ${nodeId}`,
      category: category || 'drainage',
      inspectorName,
      inspectorBadge: inspectorBadge || 'INSP-FIELD',
      severity: severity || 'medium',
      status: 'submitted',
      checklist: checklist || [],
      findingsNotes: findingsNotes || 'Field physical verification completed.',
      photoUrl,
      digitalSignature,
      completedAt: new Date().toISOString(),
      workOrderAction: workOrderAction || 'Maintenance team notified for physical remediation.',
    };

    memoryInspections.unshift(newInspection);
    return NextResponse.json({ success: true, inspection: newInspection }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record inspection' }, { status: 500 });
  }
}
