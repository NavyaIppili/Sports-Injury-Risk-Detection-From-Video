import { buildReportPdfData, buildMinimalPdf } from "./src/utils/reportPdf.js";
const report = {
  metadata: { processed_at: "2026-08-05T14:30:00Z" },
  analysis: { average_balance_score: 82, pose_quality_score: 90, stability_score: 87 },
  risk_score: 75,
  risk_level: "medium",
  frames_processed: 120,
  duration: "00:02:30",
  status: "completed",
  detected_issues: ["Shoulder misalignment"],
  recommendations: ["Improve posture"],
};
const pdfData = buildReportPdfData(report, "Test Athlete", "Test Video");
const heading = pdfData.pages[0].lines.find((line) => typeof line !== 'string' && line.fragments.some((f) => f.text === 'Athlete Information'));
console.log(JSON.stringify({ analysisDateLine: pdfData.sections[0].lines, riskSummaryLines: pdfData.sections[1].lines, heading, pageCount: pdfData.pages.length }, null, 2));