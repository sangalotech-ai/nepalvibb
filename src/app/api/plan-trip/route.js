import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TripRequest from '@/models/TripRequest';
import SiteSettings from '@/models/SiteSettings';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const queryConditions = [];
    if (session.user.id) {
      queryConditions.push({ userId: session.user.id });
    }
    if (session.user.email) {
      const emailRegex = new RegExp(`^${session.user.email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
      queryConditions.push({ email: emailRegex });
    }

    const trips = await TripRequest.find(
      queryConditions.length > 0 ? { $or: queryConditions } : {}
    ).sort({ createdAt: -1 });

    const formattedTrips = trips.map(tripDoc => {
      const tripObj = tripDoc.toObject();
      const hasUserMsg = tripObj.messages?.some(m => m.sender === 'user');
      if (!hasUserMsg) {
        const clientDesc = tripObj.trip_description || tripObj.message || tripObj.notes;
        const userText = clientDesc && clientDesc.trim() 
          ? clientDesc.trim() 
          : `Hei! Jeg ønsker å planlegge en tur til ${tripObj.destination || 'Nepal'}${tripObj.tour ? ` (${tripObj.tour})` : ''}.`;

        tripObj.messages = [
          {
            _id: 'init-user-msg',
            sender: 'user',
            text: userText,
            timestamp: tripObj.createdAt || new Date()
          },
          ...(tripObj.messages || [])
        ];
      }
      return tripObj;
    });

    return NextResponse.json(formattedTrips);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { selections, contact } = body;
    const session = await getServerSession(authOptions);
    
    const clientDescription = selections?.trip_description || contact?.message || selections?.notes || contact?.notes;
    let userMessageText = '';
    if (clientDescription && clientDescription.trim()) {
      userMessageText = clientDescription.trim();
    } else {
      const parts = [];
      if (selections?.tour) parts.push(`Tur: ${selections.tour}`);
      if (selections?.destination) parts.push(`Destinasjon: ${selections.destination}`);
      if (selections?.accommodation) parts.push(`Overnatting: ${selections.accommodation}`);
      if (selections?.budget) parts.push(`Budsjett: ${selections.budget} ${selections?.currency || 'NOK'}`);
      
      userMessageText = parts.length > 0 
        ? `Hei! Jeg ønsker å planlegge en tur. ${parts.join(', ')}.` 
        : `Hei! Jeg vil gjerne planlegge en tur til Himalaya.`;
    }

    let welcomeMessageTemplate = `Hei {name}! Takk for at du planlegger reisen din med Nepalvibb. Jeg har mottatt din forespørsel og ser frem til å hjelpe deg med å skreddersy det perfekte Himalaya-eventyret. 🙏`;
    try {
      const siteSettings = await SiteSettings.findOne({});
      if (siteSettings?.welcomeMessage?.trim()) {
        welcomeMessageTemplate = siteSettings.welcomeMessage.trim();
      }
    } catch (e) {
      console.error("Could not fetch SiteSettings welcomeMessage:", e);
    }

    const dynamicWelcomeText = welcomeMessageTemplate.replace(/\{name\}/g, contact.name || 'reisende');

    const tripRequest = await TripRequest.create({
      ...contact,
      ...selections, 
      userId: session?.user?.id || null,
      status: 'active',
      messages: [
        {
          sender: 'user',
          text: userMessageText,
          timestamp: new Date(Date.now() - 1000)
        },
        {
          sender: 'specialist',
          text: dynamicWelcomeText,
          timestamp: new Date()
        }
      ]
    });

    return NextResponse.json(tripRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
