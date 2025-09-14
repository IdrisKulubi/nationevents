import { NextRequest, NextResponse } from "next/server";
import { generateAttendeesDocx, type AttendeeData } from "@/lib/actions/data-export-actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data }: { data: AttendeeData[] } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    // Generate DOCX file
    const docxBuffer = await generateAttendeesDocx(data);

    // Create filename with current date
    const filename = `attendees-export-${new Date().toISOString().split("T")[0]}.docx`;

    // Return the DOCX file as a download
    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("Error generating DOCX:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX file" },
      { status: 500 }
    );
  }
}
