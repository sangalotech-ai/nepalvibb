import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TripRequest from '@/models/TripRequest';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const SPECIALIST_RESPONSES = [
  "That's a wonderful choice! The mountain trekking and culture in Nepal is truly world-class. I'd love to weave that into your itinerary. Would you like to spend more time in the mountains or also include some time in Kathmandu valley?",
  "Great — I can definitely arrange that. Based on what you've shared, I'm thinking a mix of cultural experiences and natural beauty would work perfectly for you. What's your feeling about homestays vs. boutique hotels?",
  "Absolutely! That's one of my personal favorites too. I've taken many guests there and the experience is always incredible. Are you open to adding a short side trip to the Langtang Valley as well?",
  "Perfect. I'll note that down. To help me finalize the best route, could you tell me — do you prefer early morning starts or a more relaxed pace during the day?",
];

function generateReply(message) {
  const lower = message.toLowerCase();
  
  if (lower.includes('trekking')) return "The Annapurna and Everest Base Camp routes are absolutely spectacular right now. The trails are in great condition and the autumn weather is ideal. I'd recommend a 10-12 day trek for the best experience.";
  if (lower.includes('culture')) return "Kathmandu valley has three UNESCO World Heritage cities — Kathmandu, Patan, and Bhaktapur — all within driving distance of each other. We can design a wonderful cultural immersion for you.";
  if (lower.includes('price')) return "Nepal is actually quite affordable compared to Western destinations. I can give you a precise quote once we finalize the itinerary.";

  return SPECIALIST_RESPONSES[Math.floor(Math.random() * SPECIALIST_RESPONSES.length)];
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { message, tripId, type, sender, attachment, ...onboardingData } = body;
    
    let trip;

    if (type === 'trip_request') {
      // Create new trip from onboarding
      trip = await TripRequest.create({
        ...onboardingData,
        messages: [{
          sender: 'system',
          text: `Trip request initiated for ${onboardingData.name || 'a new traveler'}.`
        }, {
          sender: 'user',
          text: message || 'I am ready to plan my trip!'
        }, {
          sender: 'specialist',
          text: "Welcome! I've received your trip preferences and I'm excited to help you plan your Nepal adventure. I'm reviewing your details now."
        }]
      });
    } else {
      // Update existing trip with new message
      if (tripId && tripId !== 'new') {
        trip = await TripRequest.findById(tripId).catch(() => null);
        if (!trip) {
          trip = await TripRequest.findOne({ _id: tripId }).catch(() => null);
        }
      }

      if (!trip) {
        // Fallback: search by user session if tripId is not found
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          const emailClean = session.user.email.trim().toLowerCase();
          const emailRegex = new RegExp(`^${emailClean.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
          trip = await TripRequest.findOne({
            $or: [{ userId: session.user.id }, { email: emailRegex }]
          }).sort({ createdAt: -1 });
        }
      }

      if (trip) {
        const msgSender = sender || 'user';
        trip.messages.push({
          sender: msgSender,
          text: message || '',
          attachment: attachment || null,
          timestamp: new Date()
        });

        if (msgSender === 'user') {
          const replyText = generateReply(message || 'file attachment');
          trip.messages.push({
            sender: 'specialist',
            text: replyText,
            timestamp: new Date(Date.now() + 500)
          });
        }
        await trip.save();
      }
    }

    return NextResponse.json({
      success: true,
      tripId: trip?._id || tripId,
      messages: trip?.messages || [],
      reply: trip?.messages?.[trip.messages.length - 1]?.text || "I've received your message.",
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process message' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    let trip = null;

    if (id && id !== 'undefined' && id !== 'null' && id !== 'latest') {
      trip = await TripRequest.findById(id).catch(() => null);
      if (!trip) {
        trip = await TripRequest.findOne({ _id: id }).catch(() => null);
      }
    }

    if (!trip) {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const queryConditions = [];
        if (session.user.id) queryConditions.push({ userId: session.user.id });
        if (session.user.email) {
          const emailClean = session.user.email.trim().toLowerCase();
          const emailRegex = new RegExp(`^${emailClean.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
          queryConditions.push({ email: emailRegex });
          queryConditions.push({ userId: emailClean.replace(/[^a-zA-Z0-9]/g, "-") });
        }
        if (queryConditions.length > 0) {
          trip = await TripRequest.findOne({ $or: queryConditions }).sort({ createdAt: -1 });
        }
      }
    }

    if (trip) {
      const tripObj = trip.toObject();
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
      return NextResponse.json(tripObj);
    }
    
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
