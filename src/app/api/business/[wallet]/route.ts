import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Business from "@/models/Business";

// GET - Get business by wallet address
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  try {
    await dbConnect();

    const { wallet } = await context.params; // <- REQUIRED

    const business = await Business.findOne({
      wallet: wallet.toLowerCase(),
    }).lean();

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ business });
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update business by wallet address
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  try {
    await dbConnect();

    const { wallet } = await context.params; // <- REQUIRED
    const body = await req.json();
    const { name, description, logo, banner } = body;

    if (!/^0x[a-fA-F0-9]{40}$/i.test(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (logo) updateData.logo = logo;
    if (banner) updateData.banner = banner;

    const updatedBusiness = await Business.findOneAndUpdate(
      { wallet: wallet.toLowerCase() },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Business updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete business by wallet address
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ wallet: string }> }
) {
  try {
    await dbConnect();

    const { wallet } = await context.params; // <- REQUIRED

    if (!/^0x[a-fA-F0-9]{40}$/i.test(wallet)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const deletedBusiness = await Business.findOneAndDelete({
      wallet: wallet.toLowerCase(),
    });

    if (!deletedBusiness) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Business deleted successfully" });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
