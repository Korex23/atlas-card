import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect } from "@/lib/mongodb";
import UserAuthorizations from "@/models/UserAuthorizarions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { businessWallet, businessName, smartAccountAddress, delegation } =
      body;

    console.log(body);
    if (
      !businessWallet ||
      !businessName ||
      !smartAccountAddress ||
      !delegation
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: [
            "businessWallet",
            "businessName",
            "smartAccountAddress",
            "delegation",
          ],
        },
        { status: 400 }
      );
    }

    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (
      !addressRegex.test(businessWallet) ||
      !addressRegex.test(smartAccountAddress)
    ) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    console.log({
      userEmail: session.user.email,
      businessName,
      businessWallet,
      smartAccountAddress,
      delegation,
    });

    const existingAuth = await UserAuthorizations.findOne({
      userEmail: session.user.email,
      businessName,
      businessWallet,
      smartAccountAddress,
      delegation,
    });

    console.log(existingAuth);

    if (existingAuth) {
      return NextResponse.json(
        {
          error: "Authorization already exists for this business",
          existingAuthorization: {
            businessName: existingAuth.businessName,
            businessWallet: existingAuth.businessWallet,
            createdAt: existingAuth.createdAt,
          },
        },
        { status: 409 }
      );
    }

    console.log("Delegation before create:", delegation);

    const authorization = await UserAuthorizations.create({
      userEmail: session.user.email,
      smartAccountAddress,
      businessWallet,
      businessName,
      delegation,
    });

    console.log("Created document:", authorization);

    return NextResponse.json(
      {
        success: true,
        message: "Authorization created successfully",
        authorization,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error storing authorization:", error);
    return NextResponse.json(
      {
        error: "Failed to store authorization",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const businessWallet = searchParams.get("businessWallet");
    const smartAccountAddress = searchParams.get("smartAccountAddress");

    const query: any = { userEmail: session.user.email };
    if (businessWallet) query.businessWallet = businessWallet;
    if (smartAccountAddress) query.smartAccountAddress = smartAccountAddress;

    const authorizations = await UserAuthorizations.find(query)
      .sort({ createdAt: -1 })
      .lean(); // optional: returns plain JS objects

    return NextResponse.json(
      {
        success: true,
        count: authorizations.length,
        authorizations,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching authorizations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch authorizations",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const businessWallet = searchParams.get("businessWallet");
    const smartAccountAddress = searchParams.get("smartAccountAddress");

    if (!businessWallet || !smartAccountAddress) {
      return NextResponse.json(
        { error: "businessWallet and smartAccountAddress are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await UserAuthorizations.findOneAndDelete({
      userEmail: session.user.email,
      businessWallet,
      smartAccountAddress,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Authorization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Authorization deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting authorization:", error);
    return NextResponse.json(
      {
        error: "Failed to delete authorization",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
