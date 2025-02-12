import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createOrganization, updateOrganization } from "@/app/api/admin/service/service";


export async function GET(request: NextRequest) {
    try {
        const organizations = await prisma.organization.findMany();
        return NextResponse.json(organizations);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        for (const [key, value] of Object.entries(data)) {
            if (key === "leaderId") {
                data[key] = parseInt(value as string);
            }
        }

        let organization;
        if (data.id) {
            organization = await updateOrganization(data.id, data);
        } else {
            organization = await createOrganization(data);
        }
        return NextResponse.json(organization);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
    }
}   
