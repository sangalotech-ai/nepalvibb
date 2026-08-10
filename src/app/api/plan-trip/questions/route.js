import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlanTripQuestion from '@/models/PlanTripQuestion';

const initialQuestions = [
  {
    question: 'Your group size',
    description: 'Hvem skal du reise sammen med?',
    type: 'select',
    options: [
      { label: 'Solo', value: 'solo', icon: 'User' },
      { label: 'Par', value: 'couple', icon: 'Users' },
      { label: 'Familie', value: 'family', icon: 'Users' },
      { label: 'Gruppe', value: 'group', icon: 'Users' }
    ],
    order: 0,
    isActive: true
  },
  {
    question: 'Travel dates',
    description: 'Når planlegger du å besøke Himalaya?',
    type: 'select',
    options: [
      { label: 'Fleksibel', value: 'flexible', icon: 'Calendar' },
      { label: 'Spesifikke datoer', value: 'fixed', icon: 'Calendar' },
      { label: 'Vår (Mars-Mai)', value: 'spring', icon: 'Calendar' },
      { label: 'Høst (Sept-Nov)', value: 'autumn', icon: 'Calendar' }
    ],
    order: 1,
    isActive: true
  },
  {
    question: 'Tour details',
    description: 'Vennligst oppgi detaljer om din ønskede tur.',
    type: 'text',
    options: [
      { 
        label: 'Comfortable', 
        value: 'comfortable', 
        icon: 'Heart',
        description: 'Equivalent to 3-star hotels. We will strive to provide comfortable, but not luxurious accommodation.' 
      },
      { 
        label: 'Luxury', 
        value: 'luxury', 
        icon: 'Sparkles',
        description: 'Equivalent to 4 star hotels and above. We offer the best luxury accommodation available throughout the tour.' 
      },
      { 
        label: 'Luxury Plus', 
        value: 'luxury-plus', 
        icon: 'Sparkles',
        description: 'Equivalent to 5 star hotels or more, we offer the best luxury accommodation available throughout the tour.' 
      },
      { 
        label: 'Camping', 
        value: 'camping', 
        icon: 'Mountain',
        description: 'You will have a different experience' 
      }
    ],
    order: 2,
    isActive: true
  }
];

export async function GET() {
  try {
    await dbConnect();
    let questions = await PlanTripQuestion.find({ isActive: true }).sort({ order: 1 });
    
    if (!questions || questions.length === 0) {
      await PlanTripQuestion.deleteMany({});
      questions = await PlanTripQuestion.insertMany(initialQuestions);
    }

    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(initialQuestions);
  }
}
