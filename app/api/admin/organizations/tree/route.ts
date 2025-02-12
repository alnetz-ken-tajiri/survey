import { NextRequest, NextResponse } from "next/server";
import { fetchOrganizations } from "@/app/api/admin/service/service";
import { Prisma } from "@prisma/client";


type Organization = Prisma.OrganizationGetPayload<{
    include: { leader: true };
}>;

type OrganizationRelationship = Prisma.OrganizationRelationshipGetPayload<{}>;
    export type TreeResponse = {
        organizations: Organization[];
        relationships: OrganizationRelationship[];
    }

export async function GET(request: NextRequest) {

    try {
        const { organizations, relationships } = await fetchOrganizations();
        const result: TreeResponse = { organizations, relationships };
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        // console.error(error);
        return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
    }
}
