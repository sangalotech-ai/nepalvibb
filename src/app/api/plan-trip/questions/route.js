import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PlanTripQuestion from '@/models/PlanTripQuestion';

const initialQuestions = [
  {
    question: 'Din gruppestørrelse',
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
    question: 'Reisedatoer',
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
    question: 'Turdetaljer',
    description: 'Vennligst oppgi detaljer om din ønskede tur.',
    type: 'text',
    options: [
      { 
        label: 'Komfortabel', 
        value: 'comfortable', 
        icon: 'Heart',
        description: 'Tilsvarer 3-stjerners hotell. Vi vil tilstrebe å tilby komfortabel, men ikke luksuriøs overnatting.' 
      },
      { 
        label: 'Luksus', 
        value: 'luxury', 
        icon: 'Sparkles',
        description: 'Tilsvarer 4-stjerners hotell og over. Vi tilbyr den beste luksuriøse overnattingen tilgjengelig gjennom hele turen.' 
      },
      { 
        label: 'Luksus Pluss', 
        value: 'luxury-plus', 
        icon: 'Sparkles',
        description: 'Tilsvarer 5-stjerners hotell eller mer, vi tilbyr den beste luksuriøse overnattingen tilgjengelig gjennom hele turen.' 
      },
      { 
        label: 'Camping', 
        value: 'camping', 
        icon: 'Mountain',
        description: 'Du vil få en annerledes opplevelse.' 
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
    
    const hasEnglishQuestions = questions.some(q => 
      ['Your group size', 'Travel dates', 'Tour details'].includes(q.question)
    );

    if (!questions || questions.length === 0 || hasEnglishQuestions) {
      await PlanTripQuestion.deleteMany({});
      questions = await PlanTripQuestion.insertMany(initialQuestions);
    }

    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(initialQuestions);
  }
}
