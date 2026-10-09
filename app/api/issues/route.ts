import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_CITIZEN_REPORTS } from '@/lib/mock-data';
import { CitizenReport } from '@/types/civic';

let memoryReports: CitizenReport[] = [...INITIAL_CITIZEN_REPORTS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  let results = [...memoryReports];

  if (category && category !== 'all') {
    results = results.filter((r) => r.category === category);
  }

  if (status && status !== 'all') {
    results = results.filter((r) => r.status === status);
  }

  return NextResponse.json({
    reports: results,
    total: results.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, title, address, ward, description, severity, reporterName, photoUrl, associatedNodeId } = body;

    if (!title || !category || !address) {
      return NextResponse.json({ error: 'Missing required report fields' }, { status: 400 });
    }

    const newReport: CitizenReport = {
      id: `CIT-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      title,
      address,
      ward: ward || 'Ward 1 - Downtown Metro',
      description: description || 'Issue observed by municipal user.',
      severity: severity || 'moderate',
      photoUrl: photoUrl || 'https://picsum.photos/seed/civic_hazard/600/400',
      reporterName: reporterName || 'Anonymous Citizen',
      status: 'reported',
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      associatedNodeId,
    };

    memoryReports.unshift(newReport);
    return NextResponse.json({ success: true, report: newReport }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, status } = body;

    const reportIndex = memoryReports.findIndex((r) => r.id === id);
    if (reportIndex === -1) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (action === 'upvote') {
      memoryReports[reportIndex].upvotes += 1;
      return NextResponse.json({ success: true, report: memoryReports[reportIndex] });
    }

    if (status) {
      memoryReports[reportIndex].status = status;
      return NextResponse.json({ success: true, report: memoryReports[reportIndex] });
    }

    return NextResponse.json({ error: 'Invalid patch action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
