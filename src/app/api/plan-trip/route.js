import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TripRequest from '@/models/TripRequest';
import SiteSettings from '@/models/SiteSettings';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import User from '@/models/User';

export async function GET(request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    let query = {};
    if (session?.user) {
      const queryConditions = [];
      if (session.user.id) {
        queryConditions.push({ userId: session.user.id });
      }
      if (session.user.email) {
        const emailClean = session.user.email.trim().toLowerCase();
        const emailRegex = new RegExp(`^${emailClean.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
        queryConditions.push({ email: emailRegex });
        queryConditions.push({ userId: emailClean.replace(/[^a-zA-Z0-9]/g, "-") });
      }
      if (queryConditions.length > 0) {
        query = { $or: queryConditions };
      }
    }

    const trips = await TripRequest.find(query).sort({ createdAt: -1 });

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

    const normalizedEmail = contact?.email ? contact.email.trim().toLowerCase() : '';
    let userDoc = null;
    if (normalizedEmail) {
      userDoc = await User.findOne({ email: normalizedEmail });
      if (!userDoc) {
        userDoc = await User.create({
          name: contact?.name || 'User',
          email: normalizedEmail,
          password: contact?.password?.trim() || 'default123',
          phone: contact?.phone || ''
        });
      }
    }

    const userId = session?.user?.id || (userDoc ? userDoc._id.toString() : (normalizedEmail ? normalizedEmail.replace(/[^a-zA-Z0-9]/g, "-") : null));

    const tripRequest = await TripRequest.create({
      ...contact,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...selections, 
      userId,
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
