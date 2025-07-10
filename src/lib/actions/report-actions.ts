"use server";

import db from "@/db/drizzle";
import {
  users,
  employers,
  events,
  jobSeekers,
} from "@/db/schema";
import { and, eq, count, ne } from "drizzle-orm";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
  ImageRun,
  ShadingType,
  PageBreak,
  TabStopPosition,
  TabStopType,
  UnderlineType,
} from "docx";
import QuickChart from "quickchart-js";
import { Buffer } from "buffer";

async function generateChart(
  type: "pie" | "bar" | "line",
  labels: string[],
  data: number[],
  title: string
) {
  const chart = new QuickChart();
  chart.setWidth(600);
  chart.setHeight(400);
  
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  chart.setConfig({
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: title,
        data: data,
        backgroundColor: type === 'pie' ? colors : colors[0],
        borderColor: type === 'pie' ? colors.map(c => c + 'CC') : colors[0],
        borderWidth: 2,
        borderRadius: type === 'bar' ? 4 : 0,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: {
            size: 18,
            weight: 'bold',
            family: 'Arial'
          },
          color: '#1F2937',
          padding: 20
        },
        legend: {
          display: type === 'pie',
          position: 'bottom',
          labels: {
            font: {
              size: 12,
              family: 'Arial'
            },
            color: '#374151',
            padding: 15
          }
        }
      },
      scales: type === 'bar' ? {
        y: {
          beginAtZero: true,
          grid: {
            color: '#E5E7EB'
          },
          ticks: {
            font: {
              size: 11,
              family: 'Arial'
            },
            color: '#6B7280'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              size: 11,
              family: 'Arial'
            },
            color: '#6B7280'
          }
        }
      } : undefined,
      layout: {
        padding: 20
      }
    },
  });

  const chartImage = await chart.toBinary();
  return chartImage;
}

function createStyledTable(headers: string[], data: string[][], isMainTable = false): Table {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "3B82F6" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "3B82F6" },
      left: { style: BorderStyle.SINGLE, size: 2, color: "3B82F6" },
      right: { style: BorderStyle.SINGLE, size: 2, color: "3B82F6" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    },
    rows: [
      new TableRow({
        children: headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ 
                    text: header, 
                    bold: true, 
                    color: "FFFFFF",
                    size: isMainTable ? 24 : 22
                  })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 100 },
                }),
              ],
              shading: {
                type: ShadingType.SOLID,
                fill: "3B82F6",
              },
              verticalAlign: VerticalAlign.CENTER,
              margins: {
                top: 100,
                bottom: 100,
                left: 100,
                right: 100,
              },
            })
        ),
        tableHeader: true,
      }),
      ...data.map(
        (row, index) =>
          new TableRow({
            children: row.map(
              (cellText, cellIndex) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [                  new TextRun({ 
                    text: cellText,
                    size: 20,
                    color: "374151"
                  })],
                      alignment: cellIndex === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
                      spacing: { before: 80, after: 80 },
                    })
                  ],
                  shading: {
                    type: ShadingType.SOLID,
                    fill: index % 2 === 0 ? "F9FAFB" : "FFFFFF",
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  margins: {
                    top: 80,
                    bottom: 80,
                    left: 100,
                    right: 100,
                  },
                })
            ),
          })
      ),
    ],
  });
}

export async function generateEventReport() {
  try {
    // 1. Fetch Core Data
    const event = await db.query.events.findFirst({
      where: eq(events.isActive, true),
    });

    if (!event) {
      throw new Error("No active event found.");
    }

    // 2. Fetch Data
    const allEmployers = await db.query.employers.findMany({
      with: { user: true },
    });

    const allJobSeekers = await db.query.jobSeekers.findMany({
      with: { user: true },
    });

    // 3. Calculate Statistics
    const companySizeDistribution = allEmployers.reduce((acc, emp) => {
      const size = emp.companySize || "Not Specified";
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const industryDistribution = allEmployers.reduce((acc, emp) => {
        const industry = emp.industry || "Not Specified";
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topIndustries = Object.entries(industryDistribution).sort(([,a],[,b]) => b - a).slice(0, 10);

    const verifiedEmployers = allEmployers.filter(emp => emp.isVerified);

    // Job Seeker Statistics (100% attendance as requested)
    const attendedJobSeekers = allJobSeekers; // All job seekers attended

    // 4. Generate Charts
    const companySizeChart = await generateChart(
        "bar",
        Object.keys(companySizeDistribution),
        Object.values(companySizeDistribution),
        "Employer Company Sizes"
    );
    const topIndustriesChart = await generateChart(
        "bar",
        topIndustries.map(i => i[0]),
        topIndustries.map(i => i[1]),
        "Top Industries Represented"
    );
    const verificationChart = await generateChart(
        "pie",
        ["Verified", "Pending Verification"],
        [verifiedEmployers.length, allEmployers.length - verifiedEmployers.length],
        "Employer Verification Status"
    );

    const participationChart = await generateChart(
        "pie",
        ["Job Seekers", "Employers"],
        [allJobSeekers.length, allEmployers.length],
        "Event Participation Overview"
    );

    const attendanceChart = await generateChart(
        "pie",
        ["Attended (100%)", "No Shows (0%)"],
        [attendedJobSeekers.length, 0],
        "Job Seeker Attendance Rate"
    );

    // 5. Build DOCX
    const children = [
      // Title Page
      new Paragraph({
        children: [
          new TextRun({ 
            text: `Event Report`, 
            bold: true, 
            size: 48,
            color: "3B82F6"
          }),
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 720, after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({ 
            text: event.name, 
            bold: true, 
            size: 32,
            color: "1F2937"
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      }),
      new Paragraph({
        children: [
          new TextRun({ 
            text: `Report Date: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}`,
            size: 24,
            color: "6B7280"
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({ 
            text: `Event Date: ${new Date(event.startDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}`,
            size: 24,
            color: "6B7280"
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 720 },
      }),

      // Executive Summary Section
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({ 
        children: [
          new TextRun({ 
            text: "Executive Summary", 
            bold: true, 
            size: 32,
            color: "3B82F6",
            underline: { type: UnderlineType.SINGLE, color: "3B82F6" }
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 360 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "This report provides a comprehensive overview of employer participation and registration statistics for the event. The data presented below reflects the current state of employer engagement and verification status.",
            size: 22,
            color: "374151"
          })
        ],
        spacing: { after: 360 },
        alignment: AlignmentType.JUSTIFIED,
      }),
      createStyledTable(
          ["Metric", "Job Seekers", "Employers"],
          [
              ["Total Registered", allJobSeekers.length.toString(), allEmployers.length.toString()],
              ["Total Attended", attendedJobSeekers.length.toString(), verifiedEmployers.length.toString()],
              ["Attendance/Verification Rate", "100%", `${allEmployers.length > 0 ? ((verifiedEmployers.length / allEmployers.length) * 100).toFixed(1) : 0}%`],
          ]
      ),

      // Employer Analysis Section
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({ 
        children: [
          new TextRun({ 
            text: "Participation Analysis", 
            bold: true, 
            size: 32,
            color: "3B82F6",
            underline: { type: UnderlineType.SINGLE, color: "3B82F6" }
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 360 },
      }),
      
      // Overall Participation Chart
      new Paragraph({
        children: [
          new TextRun({
            text: "Overall Event Participation",
            bold: true,
            size: 24,
            color: "1F2937"
          })
        ],
        spacing: { before: 360, after: 240 },
      }),
      new Paragraph({ 
        children: [new ImageRun({ 
          data: participationChart, 
          transformation: { width: 480, height: 320 },
          type: "png"
        })], 
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      }),
      
      // Job Seeker Attendance Chart
      new Paragraph({
        children: [
          new TextRun({
            text: "Job Seeker Attendance Rate",
            bold: true,
            size: 24,
            color: "1F2937"
          })
        ],
        spacing: { before: 360, after: 240 },
      }),
      new Paragraph({ 
        children: [new ImageRun({ 
          data: attendanceChart, 
          transformation: { width: 480, height: 320 },
          type: "png"
        })], 
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      }),
      
      // Verification Status Chart
      new Paragraph({
        children: [
          new TextRun({
            text: "Employer Verification Status",
            bold: true,
            size: 24,
            color: "1F2937"
          })
        ],
        spacing: { before: 360, after: 240 },
      }),
      new Paragraph({ 
        children: [new ImageRun({ 
          data: verificationChart, 
          transformation: { width: 480, height: 320 },
          type: "png"
        })], 
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      }),
      
      // Company Size Chart
      new Paragraph({
        children: [
          new TextRun({
            text: "Company Size Distribution",
            bold: true,
            size: 24,
            color: "1F2937"
          })
        ],
        spacing: { before: 360, after: 240 },
      }),
      new Paragraph({ 
        children: [new ImageRun({ 
          data: companySizeChart, 
          transformation: { width: 480, height: 320 },
          type: "png"
        })], 
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
      }),
      
      // Industry Chart
      new Paragraph({
        children: [
          new TextRun({
            text: "Industry Representation",
            bold: true,
            size: 24,
            color: "1F2937"
          })
        ],
        spacing: { before: 360, after: 240 },
      }),
      new Paragraph({ 
        children: [new ImageRun({ 
          data: topIndustriesChart, 
          transformation: { width: 480, height: 320 },
          type: "png"
        })], 
        alignment: AlignmentType.CENTER,
        spacing: { after: 720 },
      }),

      // Complete Directory Section
      new Paragraph({
        children: [new PageBreak()],
      }),
      new Paragraph({ 
        children: [
          new TextRun({ 
            text: "Complete Employer Directory", 
            bold: true, 
            size: 32,
            color: "3B82F6",
            underline: { type: UnderlineType.SINGLE, color: "3B82F6" }
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 360 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "The following table contains detailed information for all registered employers, including their contact details, industry classification, company size, and verification status.",
            size: 22,
            color: "374151"
          })
        ],
        spacing: { after: 360 },
        alignment: AlignmentType.JUSTIFIED,
      }),
      createStyledTable(
        ["Company Name", "Contact Person", "Email", "Industry", "Company Size", "Verified"],
        allEmployers.map(e => [
          e.companyName, 
          e.contactPerson || "N/A", 
          e.user.email, 
          e.industry || "N/A",
          e.companySize || "N/A",
          e.isVerified ? "✓ Yes" : "✗ No"
        ]),
        true
      ),
    ];

    const doc = new Document({
      creator: "Nation Events System",
      title: `Event Report - ${event.name}`,
      description: "Comprehensive employer participation and registration report",
      subject: "Event Analytics Report",
      keywords: "event, employers, report, analytics",
      styles: {
        paragraphStyles: [
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            run: {
              size: 32,
              bold: true,
              color: "3B82F6",
            },
            paragraph: {
              spacing: {
                before: 480,
                after: 360,
              },
            },
          },
          {
            id: "Heading2",
            name: "Heading 2", 
            basedOn: "Normal",
            next: "Normal",
            run: {
              size: 24,
              bold: true,
              color: "1F2937",
            },
            paragraph: {
              spacing: {
                before: 360,
                after: 240,
              },
            },
          },
        ],
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children,
        }
      ],
    });

    // 6. Return file
    const buffer = await Packer.toBuffer(doc);
    return { success: true, file: buffer.toString("base64") };
  } catch (error) {
    console.error("Error generating report:", error);
    if (error instanceof Error) {
        return { success: false, error: `Failed to generate report: ${error.message}` };
    }
    return { success: false, error: "An unknown error occurred while generating the report." };
  }
} 