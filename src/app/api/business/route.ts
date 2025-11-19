import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Business from "@/models/Business";

// POST - Create a new business
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, wallet, description, logo, banner } = body;

    // Validation
    if (!name || !wallet || !description || !logo || !banner) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/i.test(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Check if business with this wallet already exists
    const existingBusiness = await Business.findOne({
      wallet: wallet.toLowerCase(),
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "Business with this wallet address already exists" },
        { status: 409 }
      );
    }

    // Create new business
    const business = await Business.create({
      name,
      wallet: wallet.toLowerCase(),
      description,
      logo,
      banner,
    });

    return NextResponse.json(
      { message: "Business created successfully", business },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - List all businesses
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [businesses, total] = await Promise.all([
      Business.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Business.countDocuments({}),
    ]);

    return NextResponse.json({
      businesses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
